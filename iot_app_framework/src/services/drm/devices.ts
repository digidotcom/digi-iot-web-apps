import { IDevice } from '@customTypes/device-types';
import { AppError } from '@models/AppError';
import { DEVICE_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

const log = logLevel.getLogger('devices');

/**
 * Returns the Digi Remote Manager devices that belong to the given group(s) and/or
 * device type(s).
 * 
 * @param groups List of groups to retrieve devices.
 * @param deviceTypes List of device types to retrieve.
 * 
 * @returns The retrieved devices.
 * 
 * @throws An {@link AppError} if there is any error retrieving the devices.
 */
export const getDevices = async (groups?: string[], deviceTypes?: string[]) => {
    const groupsQuery = groups ? groups.map(group => `group startsWith '${group}'`).join(' or ') : "";
    const deviceTypesQuery = deviceTypes ? deviceTypes.map(deviceType => `type='${deviceType}'`).join(' or ') : "";

    const query = groupsQuery && deviceTypesQuery
        ? `(${groupsQuery}) and (${deviceTypesQuery})`
        : groupsQuery || deviceTypesQuery || "";

    const queryParams = query ? { query } : {};
    try {
        const res = await DRMRest.get({
            url: `${DEVICE_INVENTORY}`,
            params: queryParams
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: IDevice[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError("Error retrieving devices", e as any);
        log.error(appError.message);
        throw appError;
    }
};