import { Mutex } from 'async-mutex';

import { APP_MONITORS } from '@configs/app-config';
import { AppMonitor } from '@customTypes/monitor-types';
import { AppError } from '@models/AppError';
import CloudLogManager from '@services/cloud-log-manager';
import { createDRMMonitor, deleteDRMInactiveMonitors } from '@services/drm/monitors';
import { newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

const CREATE_MONITOR_RETRIES = 3;

const log = logLevel.getLogger('monitors-manager');

class MonitorsManager {
    // Variables.
    private static instance: MonitorsManager;
    private static monitorMutex = new Mutex();

    private appMonitors: AppMonitor[] = [];

    // Private constructor to ensure singleton pattern
    private constructor() {
        this.startMonitorStreamReader = this.startMonitorStreamReader.bind(this);
    }

    // Public method to get the singleton instance
    public static getInstance(): MonitorsManager {
        if (!MonitorsManager.instance) {
            MonitorsManager.instance = new MonitorsManager();
        }
        return MonitorsManager.instance;
    }

    /**
     * Creates and starts a new monitor with the given definition ID.
     *
     * @param defID The definition ID of the monitor to be created.
     * 
     * @throws An {@link AppError} if an error occurs while creating the monitor.
     */
    async createMonitor(defID: string) {
        await MonitorsManager.monitorMutex.runExclusive(async () => {
            let retry = CREATE_MONITOR_RETRIES;
            while (retry > 0) {
                retry -= 1;
                const monitorDef = APP_MONITORS.find((def: { id: string; }) => def.id === defID);

                // Sanity checks.
                if (!monitorDef) {
                    const appError = newAppError(`Could not find monitor definition with ID '${defID}'`);
                    log.error(appError.message);
                    throw appError;
                }
                if (this.monitorExists(defID)) {
                    // If monitor is already created, just return.
                    return;
                }

                // Call DRM API to create the monitor.
                try {
                    const [monitorId, stream] = await createDRMMonitor(monitorDef);
                    // The monitor is successfully created, add it to the list.
                    const appMonitor = this.addMonitor(monitorDef.id, monitorId, monitorDef.topics);
                    // Start reading from the TCP stream asynchronously, without blocking the creation call.
                    this.startMonitorStreamReader(appMonitor, stream);
                    return;
                } catch (error) {
                    const errorMessage = (error as AppError).message;
                    if (errorMessage.includes("monitors") && errorMessage.includes("limit")) {
                        // Monitor limit has been reached. Remove inactive monitors and try again.
                        await deleteDRMInactiveMonitors();
                    } else {
                        throw error;
                    }
                }
            }

            // If we exhausted retries, throw an error.
            throw newAppError(`Failed to create monitor with ID '${defID}'`);
        });
    };

    /**
     * Starts reading data from the monitor's TCP stream.
     * 
     * @param appMonitor Monitor to start reading data from.
     * @param stream The monitor's readable stream.
     */
    private async startMonitorStreamReader(appMonitor: AppMonitor, stream: ReadableStream<Uint8Array>) {
        const decoder = new TextDecoder();
        let done = false;

        // Create monitor reader.
        appMonitor.reader = stream.getReader();
        // Loop until the reader is done.
        while (!done) {
            try {
                const { value, done: streamDone } = await appMonitor.reader.read();
                done = streamDone;
                if (value && !done) {
                    // Read data from the reader. Skip empty data.
                    const data = decoder.decode(value, { stream: true }).trim();
                    if (!data) {
                        continue;
                    }
                    // Try to parse the monitor data and only notify it if it contains a valid payload.
                    try {
                        let json = JSON.parse(data);
                        // Filter out some monitor data.
                        if (Array.isArray(json)) {
                            if (json.length === 1 && json[0]?.end === 1) { // The data is just `[{"end": 1}]` (Terminator for DataPoint monitor, ignore)
                                continue;
                            } else if (json.length > 0) { // Filter 'Monitor' and 'web-service' monitor alerts.
                                json = json.filter(entry => (
                                    entry.source == null ||
                                    (!entry.source.startsWith("Monitor:") && !entry.source.startsWith("web-service"))
                                ));
                                // Final check, all entries might have been removed.
                                if (json.length === 0) {
                                    continue;
                                }
                            }
                        }
                        // Notify the content via callbacks.
                        appMonitor.callbacks?.forEach((callback: (arg0: undefined, arg1: undefined) => void) => {
                            if (json.error) {
                                callback(undefined, json.error);
                            } else {
                                callback(json, undefined);
                            }
                        });
                        // Add the entry to the cloud log.
                        this.addLogItem(json, appMonitor?.topics ?? []);
                    } catch (error) {
                        log.debug(`JSON parse error in monitor '${appMonitor.id}'`, error);
                    }
                }
            } catch (e) {
                const appError = newAppError(`Error reading from monitor ${appMonitor.id}`, e as any)
                log.error(appError.message);
                done = true;
            }
        }
        // Clean up when the stream is done.
        this.removeMonitor(appMonitor.id);
    };

    /**
     * Adds a new application monitor to the monitors list.
     * 
     * @param id The ID of the monitor to add.
     * @param monID The DRM ID of the monitor to add.
     * @param topics The topics associated with the monitor.
     * 
     * @return The application monitor that was added. 
     */
    private addMonitor(id: string, monID: number, topics: string[]) {
        // Initialize the new application monitor.
        const appMonitor: AppMonitor = {
            id: id,
            monID: monID,
            topics: topics,
            callbacks: []
        };
        // Add the monitor to the list.
        this.appMonitors.push(appMonitor);

        return appMonitor;
    };

    /**
     * Removes the application monitor with the given ID.
     * 
     * @param id The ID of the monitor to remove.
     */
    private removeMonitor(id: string) {
        const index = this.appMonitors.findIndex(appMonitor => appMonitor.id === id);

        if (index !== -1) {
            const monitors = this.appMonitors.splice(index, 1);
            if (monitors.length > 0) {
                monitors[0].reader?.cancel();
            }
        }
    };

    /**
     * Finds and returns the `AppMonitor` with the given ID.
     * 
     * @param id ID of the `AppMonitor` to get.
     * 
     * @return The `AppMonitor` with the given ID, `undefined` if not found.
     */
    private getMonitor(id: string) {
        return this.appMonitors.find(appMonitor => appMonitor.id === id);
    }

    /**
     * Returns whether a monitor with the given ID is already created or not.
     * 
     * @param id The ID of the monitor to check.
     * 
     * @return `true` if the monitor is created, `false` otherwise.
     */
    monitorExists(id: string) {
        return this.getMonitor(id) !== undefined;
    }

    /**
     * Registers a callback for the given monitor ID.
     * 
     * @param id ID of the monitor to register the callback to.
     * @param callback Callback that will be invoked when the monitor receives data.
     * 
     * @throws An {@link AppError} if the monitor is not found or created yet.
     */
    registerMonitorCallback(id: string, callback: (data?: Object, error?: string) => void) {
        const appMonitor = this.getMonitor(id);
        if (!appMonitor) {
            const appError = newAppError(`Error registering monitor callback: Monitor '${id}' does not exist.`);
            log.error(appError);
            throw appError;
        }

        if (!appMonitor.callbacks.includes(callback)) {
            appMonitor.callbacks.push(callback);
        }
    }

    /**
     * Unregisters a callback for the given monitor ID.
     * 
     * @param id ID of the monitor to unregister the callback from.
     * @param callback The callback to remove.
     * 
     * @throws An {@link AppError} if the monitor is not found or created yet.
     */
    unregisterMonitorCallback(id: string, callback: (data?: object, error?: string) => void) {
        const appMonitor = this.getMonitor(id);
        if (!appMonitor) {
            const appError = newAppError(`Error unregistering monitor callback: Monitor '${id}' does not exist.`);
            log.error(appError);
            throw appError;
        }

        const callbackIndex = appMonitor.callbacks.indexOf(callback);
        if (callbackIndex != -1) {
            // Remove the callback from the array
            appMonitor.callbacks.splice(callbackIndex, 1);
        }
    };

    /**
     * Tears down all registered monitors.
     */
    tearDownMonitors() {
        // Close all stored readers, which will cause the monitors to be stopped and deleted in the backend.
        this.appMonitors.forEach(appMonitor => appMonitor.reader?.cancel());
    };

    /**
     * Adds a new entry coming from a monitor to the cloud log.
     * 
     * @param message Monitor message.
     * @param topics Monitor topics.
     */
    private addLogItem(message: string, topics: string[]) {
        const url = `Push monitor for '${topics}'`;
        CloudLogManager.addLogItem({
            method: "Monitor",
            url: url,
            fullUrl: url,
            params: undefined,
            status: 200,
            time: new Date(),
            responseBody: JSON.stringify(message),
            responseType: "json"
        });
    };
}

// Export the singleton instance
const monitorsManager = MonitorsManager.getInstance();
export default monitorsManager;