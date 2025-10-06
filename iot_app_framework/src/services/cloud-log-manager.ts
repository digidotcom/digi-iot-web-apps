import _ from 'lodash';

import { CloudLogItem, CloudLogCallback } from '@customTypes/cloud-log-types';
import logLevel from '@utils/log-utils';

// Variables.
const log = logLevel.getLogger('cloud-log-manager');

class CloudLogManager {
    // Variables.
    private static instance: CloudLogManager;

    private cloudLog: CloudLogItem[];
    private logListeners: CloudLogCallback[];

    // Private constructor to ensure singleton pattern
    private constructor() {
        this.cloudLog = [];
        this.logListeners = [];
    }

    // Public method to get the singleton instance
    public static getInstance(): CloudLogManager {
        if (!CloudLogManager.instance) {
            CloudLogManager.instance = new CloudLogManager();
        }
        return CloudLogManager.instance;
    }

    /**
     * Returns the log list.
     * 
     * @returns The log list.
     */
    getLog() {
        return this.cloudLog;
    }

    /**
     * Clears the log list and listeners.
     */
    clearLog() {
        this.cloudLog = [];
        this.logListeners = [];
    }

    /**
     * Adds the given log item to the log list.
     * 
     * @param logItem Log item to add.
     */
    addLogItem(logItem: CloudLogItem) {
        // If the log item does not have ID, get the next one.
        if (!logItem.id) {
            logItem.id = this.cloudLog.length + 1;
        }
        // Add the item to the array.
        this.cloudLog.push(logItem);
        // Notify all listeners.
        this.logListeners.forEach(l => l(logItem));
    }

    /**
     * Registers the given log callback to be notified when the list changes.
     * 
     * @param listener Log callback to register.
     */
    registerLogCallback(listener: CloudLogCallback) {
        this.logListeners.push(listener);
    }

    /**
     * Unregisters the given log callback.
     * 
     * @param listener Log callback to unregister.
     */
    unregisterLogCallback(listener: CloudLogCallback) {
        _.pull(this.logListeners, listener);
    }

}

// Export the singleton instance
const cloudLogManager = CloudLogManager.getInstance();
export default cloudLogManager;
