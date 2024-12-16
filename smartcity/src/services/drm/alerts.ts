import { APP_PREFIX } from '@configs/app-constants';
import { IAlertSummary } from '@customTypes/alert-types';
import { AppError } from '@models/AppError';
import { ALARMS_STATUS, ALERTS_SUMMARY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import appLog from '@utils/log-utils';

const log = appLog.getLogger("alerts-functions");

const ALARM_STATUS_RESET = 0;
const ALARM_STATUS_ACKNOWLEDGE = 2;

/**
 * Returns the list of alerts for the demo.
 * 
 * @param group Name of the group alerts belong to.
 * 
 * @returns The list of alerts for the demo.
 * 
 * @throws An {@link AppError} if there is any error reading the alerts.
 */
export const getAlerts = async (group?: string) => {
    const query = `description startswith '${APP_PREFIX}'` + (group ? ` and group='${group}'` : "");
    try {
        const res = await DRMRest.get({ url: ALERTS_SUMMARY, params: { query: query } });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list } = await res.body(true);
        const alerts: IAlertSummary[] = list;
        return alerts;
    } catch (e) {
        const appError = newAppError(`Error reading alerts${group ? ` for ${group}` : ""}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Acknowledges the given alert.
 * 
 * @param alert Alert to acknowledge.
 * 
 * @returns `true` if the alert could be acknowledged, `false` otherwise.
 * 
 * @throws An {@link AppError} if there is any error acknowledging the alert.
 */
export const acknowledgeAlert = async (alert: IAlertSummary) => {
    return await updateAlert(alert.id, alert.source ?? "", ALARM_STATUS_ACKNOWLEDGE);
};

/**
 * Resets the given alert.
 * 
 * @param alert Alert to reset.
 * 
 * @returns `true` if the alert could be reset, `false` otherwise.
 * 
 * @throws An {@link AppError} if there is any error reseting the alert.
 */
export const resetAlert = async (alert: IAlertSummary) => {
    return await updateAlert(alert.id, alert.source ?? "", ALARM_STATUS_RESET);
};

/**
 * Updates the alert with the given ID and source.
 * 
 * @param id Alert ID.
 * @param source Alert status.
 * @param status New status.
 * 
 * @returns `true` if the alert could be updated, `false` otherwise.
 * 
 * @throws An {@link AppError} if there is any error updating the alert.
 */
const updateAlert = async (id: number, source: string, status: number) => {
    const url = `${ALARMS_STATUS}/${id}/${source}`;
    const body = `<AlarmStatus><almsStatus>${status}</almsStatus></AlarmStatus>`;
    try {
        const res = await DRMRest.put({ url, body, headers: { 'content-type': 'application/xml' } });
        return res.status == 200;
    } catch (e) {
        const appError = newAppError(`Error updating alert ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
}