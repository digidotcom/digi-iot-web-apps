import { IFirmware, INewFirmware } from '@customTypes/firmware-types';
import { AppError } from '@models/AppError';
import { FIRMWARE_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';
import { toHexString } from '@utils/string-utils';

const log = logLevel.getLogger("firmware-functions");

/**
 * Returns the custom firmware for the given pairs of vendor ID and device type.
 * 
 * @param pairs Pairs of vendor ID and type of the firmware to get.
 * 
 * @returns A list of custom firmware.
 * 
 * @throws An {@link AppError} if there is any error getting the list of custom firmware.
 */
export const getCustomFirmware = async (pairs: { vendorId: number, deviceType: string }[]) => {
    const query = pairs.map(p => `(vendor_id=${p.vendorId} and type='${p.deviceType}')`).join(" or ");
    try {
        const res = await DRMRest.get({ url: FIRMWARE_INVENTORY, params: { firmware_type: 'custom', query: query } });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: IFirmware[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError("Error getting custom firmware", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Creates the given custom firmware.
 * 
 * @param firmware Custom firmware to create.
 * 
 * @returns The created firmware.
 * 
 * @throws An {@link AppError} if there is any error creating the custom firmware.
 */
export const createCustomFirmware = async (firmware: INewFirmware) => {
    const vendorString = toHexString(firmware.vendor_id);
    try {
        const res = await DRMRest.post({
            url: `${FIRMWARE_INVENTORY}/${vendorString}/${firmware.type}?firmware_version=${firmware.firmware_version}&information_link=${firmware.information_link}&security_related=${firmware.security_related}&filename=${firmware.file.name}`,
            headers: { "content-type": "application/octet-stream" },
            body: firmware.file
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true) as IFirmware;
    } catch (e) {
        const appError = newAppError(`Error uploading custom firmware`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Deletes the given custom firmware.
 * 
 * @param vendorId Vendor ID of the firmware to delete.
 * @param deviceType Device type of the firmware to delete.
 * @param firmwareVersion Version of the firmware to delete.
 * 
 * @throws An {@link AppError} if there is any error deleting the custom firmware.
 */
export const deleteCustomFirmware = async (vendorId: number, deviceType: string, firmwareVersion: string) => {
    const vendorString = toHexString(vendorId);
    try {
        await DRMRest.del({ url: `${FIRMWARE_INVENTORY}/${vendorString}/${deviceType}?firmware_version=${firmwareVersion}` });
    } catch (e) {
        const appError = newAppError(`Error deleting custom firmware with firmware version ${firmwareVersion}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};