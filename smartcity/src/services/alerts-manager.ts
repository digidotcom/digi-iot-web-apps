import { APP_GROUPS, MONITOR_ALERTS, STREAM_INCIDENCE } from '@configs/app-config';
import { STATUS_ERROR, STATUS_LOADED, STATUS_LOADING, STATUS_NOT_LOADED } from '@configs/app-constants';
import { IAlertSummary } from '@customTypes/alert-types';
import { AppError } from '@models/AppError';
import devicesManager from '@services/devices-manager';
import { getAlertDefinition } from '@services/drm/alert-definitions';
import { getAlerts } from '@services/drm/alerts';
import MonitorsManager from '@services/monitors-manager';
import { newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';
import { showError } from '@utils/toast-utils';

// Variables.
const log = logLevel.getLogger('alerts-manager');

export const STATUS_FIRED = "fired";
export const STATUS_ACK = "acknowledged";
export const STATUS_RESET = "reset";

class AlertsManager {
    // Variables.
    private static instance: AlertsManager;

    private _alerts: IAlertSummary[] = [];
    private statusListeners: ((status: string) => void)[] = [];
    private alertsListeners: ((alerts: IAlertSummary[]) => void)[] = [];
    private _status: string = STATUS_NOT_LOADED;
    private _errorMessage: string | undefined = undefined;

    // Private constructor to ensure singleton pattern
    private constructor() {
        this.alertsMonitorCallback = this.alertsMonitorCallback.bind(this);
    }

    // Public method to get the singleton instance
    public static getInstance(): AlertsManager {
        if (!AlertsManager.instance) {
            AlertsManager.instance = new AlertsManager();
        }
        return AlertsManager.instance;
    }

    // Getter for status.
    get status(): string {
        return this._status;
    }

    // Getter for error message.
    get errorMessage(): string | undefined {
        return this._errorMessage;
    }

    // Getter for alerts.
    get alerts(): IAlertSummary[] | undefined {
        return this._alerts;
    }

    /**
     * Initialize the AlertsManager by fetching alerts from cloud and setting up monitoring.
     * 
     * @throws An {@link AppError} if there is any error initializing alerts.
     */
    public async initialize(): Promise<void> {
        // Sanity check.
        if (this.status === STATUS_LOADED || this.status === STATUS_LOADING) {
            return;
        }

        // Update status.
        this.notifyStatusListeners(STATUS_LOADING);
        this._errorMessage = undefined;
        try {
            // Get the alerts.
            this._alerts = await getAlerts();
            try {
                // Initialize the monitor.
                await this.initMonitor();
            } catch (error) {
                throw error;
            } finally {
                // Update status.
                this.notifyStatusListeners(STATUS_LOADED);
                // Notify listeners.
                this.notifyAlertsListeners();
            }
        } catch (error) {
            const appError = newAppError("Failed to initialize AlertsManager", error as any);
            log.error(appError.message);
            this._errorMessage = appError.message;
            // Update status.
            this.notifyStatusListeners(STATUS_ERROR);
            throw appError;
        }
    }

    /**
     * Sorts the given alert and moves it to the first position of the list.
     * 
     * @param alert Alert to sort.
     */
    public sortAlert(alert: IAlertSummary) {
        const index = this._alerts.indexOf(alert);
        if (index !== -1) {
            this._alerts.unshift(this._alerts.splice(index, 1)[0]);
            this.notifyAlertsListeners();
        }
    }

    /**
     * Clears the list of alerts.
     */
    clear() {
        // Remove all alerts.
        this._alerts = []
        // Notify listeners.
        this.notifyAlertsListeners();
        // Update status.
        this.notifyStatusListeners(STATUS_NOT_LOADED);
    }

     /**
     * Initializes alerts monitor if it does not already exist.
     */
     private async initMonitor() {
        // Create a monitor to be notified when any alert changes.
        if (!MonitorsManager.monitorExists(MONITOR_ALERTS)) {
            await MonitorsManager.createMonitor(MONITOR_ALERTS);
            MonitorsManager.registerMonitorCallback(MONITOR_ALERTS, this.alertsMonitorCallback);
        }
     }

    /**
     * Called when the alerts monitor receives data.
     * 
     * @param data Received data in JSON format.
     * @param error Received error string.
     */
    private async alertsMonitorCallback(data?: object, error?: string) {
        // Sanity check.
        if (error) {
            showError(error);
            return;
        }

        const monitorAlerts = data as IAlertSummary[];
        if (!monitorAlerts || monitorAlerts.length == 0) {
            return;
        }
        // The monitor data contains an array of objects.
        for (const alert of monitorAlerts) {
            // Make sure the monitor message is an alert for simulated devices.
            if (alert.group === undefined || APP_GROUPS.find(a => alert.group?.startsWith(a)) === undefined) {
                return;
            }
            const existingAlert = this._alerts.find(a => a.id == alert.id && a.source === alert.source);
            // If the alert already exists, update it.
            if (existingAlert) {
                existingAlert.status = alert.status;
                existingAlert.last_update = alert.last_update;
                this._alerts.unshift(this._alerts.splice(this._alerts.indexOf(existingAlert), 1)[0]);
            } else {
                // New alerts coming from monitors do not have name, so find it.
                const name = await this.getAlertName(alert.id);
                alert.name = name;
                this._alerts.unshift(alert);
            }

            // Check if the alert is an incidence alert and update the device incidence.
            if (alert.source?.endsWith(`/${STREAM_INCIDENCE}`)) {
                const isFired = alert.status === STATUS_FIRED;
                const isReset = alert.status === STATUS_RESET;
                if (isFired || isReset) {
                    devicesManager.updateDeviceIncidence(alert.source.substring(0, alert.source.indexOf("/")), isFired);
                }
            }
        }

        // Notify listeners.
        this.notifyAlertsListeners();
    }

    /**
     * Returns the name of the alert with the given ID.
     * 
     * @param id Alert ID.
     * @param alerts List of alerts.
     * 
     * @returns The name of the alert.
     */
    private async getAlertName(id: number)  {
        // Check if there is any alert with the same ID to get its name.
        const foundAlert = this._alerts.find(a => a.id == id && a.name);
        if (foundAlert) {
            return foundAlert.name;
        }
        // Otherwise, get all alert definitions and find the name.
        try {
            const alertDefinition = await getAlertDefinition(id);
            if (alertDefinition) {
                return alertDefinition.name;
            }
        } catch (e) {
            showError((e as AppError).message);
        }
        return "Unknown alert";
    }

    /**
     * Adds a listener for status changes.
     *
     * @param listener The function to be called with the status update.
     */
    subscribeStatus(listener: (status: string) => void) {
        this.statusListeners.push(listener);
    }

    /**
     * Adds a listener for alerts list changes.
     *
     * @param listener The function to be called when the alerts list changes.
     */
    subscribeAlerts(listener: (alerts: IAlertSummary[]) => void) {
        this.alertsListeners.push(listener);
    }

    /**
     * Removes a listener from the status listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeStatus(listener: (status: string) => void) {
        this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    }

    /**
     * Removes a listener from the alerts listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeAlerts(listener: (alerts: IAlertSummary[]) => void) {
        this.alertsListeners = this.alertsListeners.filter((l) => l !== listener);
    }

    /**
     * Sets the given status and notifies it to all status listeners.
     *
     * @param newStatus The new status to set and notify.
     */
    private notifyStatusListeners(newStatus: string) {
        this._status = newStatus;
        this.statusListeners.forEach((listener) => listener(this._status));
    }

    /**
     * Notifies all alerts of a change in the alerts list.
     */
    private notifyAlertsListeners() {
        this.alertsListeners.forEach((listener) => listener(this._alerts ?? []));
    }

}

// Export the singleton instance
const alertsManager = AlertsManager.getInstance();
export default alertsManager;