import { DevicesSummaryStatus, VendorIdAndType } from '@customTypes/report-types';
import { AppError } from '@models/AppError';
import { REPORTS_CONNECTION_STATUS, REPORTS_MAINTENANCE_WINDOW, REPORTS_VENDOR_ID_DEVICE_TYPE } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import appLog from '@utils/log-utils';

const log = appLog.getLogger("reports-functions");

const CONNECTION_STATUS_CONNECTED = "connected";
const CONNECTION_STATUS_DISCONNECTED = "disconnected";

const MAINTENANCE_STATUS_YES = "yes";
const MAINTENANCE_STATUS_NO = "no";

/**
 * Returns the connection status of the simulated devices of the demo.
 * 
 * @param group Name of the group devices belong to.
 * 
 * @returns An array containing the number of connected devices and the number of disconnected devices.
 * 
 * @throws An {@link AppError} if there is any error reading the connection status report.
 */
export const getConnectionStatus = async (group?: string) => {
    const queryParams = {
        ...(group && { query: `group='${group}'` })
    };
    try {
        const res = await DRMRest.get({ url: REPORTS_CONNECTION_STATUS, params: queryParams });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: DevicesSummaryStatus[] } = await res.body(true);
        // Get the number of connected and disconnected devices from the response.
        let connected = 0;
        let disconnected = 0;
        list.forEach(elm => {
            if (elm.value === CONNECTION_STATUS_CONNECTED) {
                connected = elm.count;
            } else if (elm.value === CONNECTION_STATUS_DISCONNECTED) {
                disconnected = elm.count;
            }
        });
        return [connected, disconnected];
    } catch (e) {
        const appError = newAppError("Error getting connection status report", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Returns the maintenance window status of the simulated devices of the demo.
 * 
 * @param group Name of the group devices belong to.
 * 
 * @returns An array containing the number of devices in service and the number of devices in maintenance window.
 * 
 * @throws An {@link AppError} if there is any error reading the maintenance window status report.
 */
export const getMaintenanceWindowStatus = async (group?: string) => {
    const queryParams = {
        ...(group && { query: `group='${group}'` })
    };
    try {
        const res = await DRMRest.get({ url: REPORTS_MAINTENANCE_WINDOW, params: queryParams });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: DevicesSummaryStatus[] } = await res.body(true);
        // Get the number of in maintenance and in service devices from the response.
        let inMaintenance = 0;
        let inService = 0;
        list.forEach(elm => {
            if (elm.value === MAINTENANCE_STATUS_YES) {
                inMaintenance = elm.count;
            } else if (elm.value === MAINTENANCE_STATUS_NO) {
                inService = elm.count;
            }
        });
        return [inService, inMaintenance];
    } catch (e) {
        const appError = newAppError("Error getting maintenance window status report", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Returns the list of vendor IDs and types of all devices included in the given group
 * (or all devices if no group is provided).
 * 
 * @param group Name of the group devices belong to.
 * 
 * @returns An array of {@link VendorIdAndType}.
 * 
 * @throws An {@link AppError} if there is any error reading the vendor ID and type report.
 */
export const getVendorIdAndType = async (group?: string) => {
    const queryParams = {
        ...(group && { query: `group='${group}'` })
    };
    try {
        const res = await DRMRest.get({ url: REPORTS_VENDOR_ID_DEVICE_TYPE, params: queryParams });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: VendorIdAndType[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError("Error getting vendor ID and type report", e as any);
        log.error(appError.message);
        throw appError;
    }
};