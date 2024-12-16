import { BASE_PATH } from '@configs/app-config';
import { APP_PREFIX } from '@configs/app-constants';
import { AppMonitorDef, IMonitor, INewMonitor } from '@customTypes/monitor-types';
import { AppError } from '@models/AppError';
import HttpError from '@models/HttpError';
import { MONITORS_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

const log = logLevel.getLogger('monitors');

const API_MONITOR = `${BASE_PATH}/api/monitor/`;
export const PARAM_MONITOR_ID = "monitorId";
export const PARAM_MONITOR_DEF_ID = "monitorDefId";

/**
 * Creates new DRM monitor using the given information.
 *
 * @param monitorDef The definition of the monitor to create.
 * 
 * @throws An {@link AppError} if an error occurs while creating the monitor.
 */
export const createDRMMonitor = async (monitorDef: AppMonitorDef) => {
    let monitorId;
    let monitorCreated = false;
    try {
        // Check if there exists a monitor for this monitor definition.
        const monitorIdResp = await fetch(`${API_MONITOR}?${PARAM_MONITOR_DEF_ID}=${monitorDef.id}`);
        if (!monitorIdResp.ok) {
            const error = await monitorIdResp.json();
            const appError = newAppError(`Error starting monitor '${monitorDef.id}'${error.error ? ": " + error.error : ""}`, monitorIdResp.status);
            log.error(appError.message);
            throw appError;
        }
        // If the response contains an ID it means the monitor already exists, so don't create a new one.
        const data = await monitorIdResp.json();
        monitorId = data.id;
        if (!monitorId) {
            // Create the monitor and get the monitor ID.
            const resp = await DRMRest.post({ url: MONITORS_INVENTORY, body: buildMonitorJson(monitorDef) });
            if (!resp.body) {
                throw new Error(ERROR_BODY_UNDEFINED);
            }
            const body = await resp.body(true);
            monitorId = body.id;
            monitorCreated = true;
        }
        // Call our API to start the monitor TCP client.
        const response = await fetch(`${API_MONITOR}?${PARAM_MONITOR_ID}=${monitorId}&${PARAM_MONITOR_DEF_ID}=${monitorDef.id}`, { method: "POST" });
        if (!response.ok) {
            const error = await response.json();
            const appError = newAppError(`Error starting monitor '${monitorDef.id}' with ID ${monitorId}${error.error ? ": " + error.error : ""}`, response.status);
            log.error(appError.message);
            throw appError;
        }
        if (response.body) {
            return [monitorId, response.body];
        } else {
            const appError = newAppError(`Error starting monitor '${monitorDef.id}' with ID ${monitorId}: Received empty response in start request`, 500);
            log.error(appError.message);
            throw appError;
        }
    } catch (e) {
        // Remove the monitor from DRM if it was created.
        if (monitorCreated) {
            try {
                await deleteDRMMonitor(monitorId);
            } catch (ex) { /* Catch to allow below exception to throw and log.*/ }
        }
        if (!(e instanceof AppError)) {
            throw newAppError("Error creating monitor", e instanceof HttpError ? e as HttpError : e as Error);
        }
        throw e;
    }
};

/**
 * Removes the monitor with the given ID from DRM.
 * 
 * @param monId DRM ID of the monitor to remove.
 */
export const deleteDRMMonitor = async (monId: number) => {
    try {
        await DRMRest.del({ url: `${MONITORS_INVENTORY}/${monId}` });
    } catch (e) {
        const appError = newAppError(`Error deleting monitor with ID ${monId}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Retrieves the list of inactive monitors matching the default monitor description.
 * 
 * @returns The list of inactive monitors.
 * 
 * @throws An {@link AppError} if there is any error while retrieving inactive monitors.
 */
export const getDRMInactiveMonitors = async () => {
    const query = `status='inactive' and description startsWith '${APP_PREFIX}'`;
    try {
        const res = await DRMRest.get({ url: MONITORS_INVENTORY, params: {query: query} });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: IMonitor[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError(`Error retrieving inactive monitors`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Deletes all inactive DRM monitors.
 * 
 * @returns A promise that resolves when the inactive monitors are deleted.
 * 
 * @throws An {@link AppError} if there is any error while deleting inactive monitors.
 */
export const deleteDRMInactiveMonitors = async () => {
    try {
        const inactiveMonitors = await getDRMInactiveMonitors();
        for (const monitor of inactiveMonitors) {
            await deleteDRMMonitor(monitor.id);
        }
    } catch (e) {
        const appError = newAppError(`Error deleting inactive monitors`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Builds the monitor JSON suitable for the v1/monitors APIs based on the given
 * definition.
 * 
 * @param monitorDef App monitor definition.
 * 
 * @returns The monitor JSON.
 */
const buildMonitorJson = (monitorDef: AppMonitorDef) => {
    const monitor: INewMonitor = {
        type: "tcp",
        topics: monitorDef.topics,
        description: monitorDef.description || APP_PREFIX,
        format: "json",
        persistent: false,
        batch_duration: monitorDef.batchDuration || 0,
        batch_size: monitorDef.batchSize || 1,
    };
    // If a schema was provided, include it in the monitor definition.
    if (monitorDef.schema) {
        monitor["schema_type"] = "handlebars";
        monitor["schema"] = monitorDef.schema.replace(/\s+/g, ' ').trim();
    }
    return JSON.stringify(monitor);
};