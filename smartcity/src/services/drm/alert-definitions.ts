import _ from 'lodash';

import { APP_PREFIX } from '@configs/app-constants';
import { APP_ALERTS } from '@configs/app-config';
import { IAlert } from '@customTypes/alert-types';
import { AppError } from '@models/AppError';
import { ALERTS_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import appLog from '@utils/log-utils';

const log = appLog.getLogger("alert-definitions-functions");

const ALERT_VALUES = ["description", "fire", "reset", "name", "scope", "type"];

/**
 * Checks if the defined alert definitions are already created in the DRM account
 * and are exactly the same as defined. If not, create or update them accordingly.
 */
export const checkAlertDefinitions = async () => {
    const missingAlerts: IAlert[] = [...APP_ALERTS];
    try {
        // Get all alert definitions for the demo.
        const alerts = await getAlertDefinitions();
        for (const alert of alerts) {
            await checkAlertDefinition(alert, APP_ALERTS.find(appAlert => appAlert.name === alert.name), missingAlerts);
        }
    } catch (e) {
        // Do not generate an error here, just let the application regenerate the alerts.
        log.error("Error checking alerts, regenerating...", e);
    }
    // Create missing alerts.
    for (const alert of missingAlerts) {
        try {
            await createAlertDefinition(alert);
        } catch (e) {
            /* Just capture the exception with no-op to let the app
               continue creating the remaining alert definitions*/
        }
    }
};

/**
 * Checks whether the given alert definition matches the given template alert definition.
 * If not, updates it or, if it's disabled, enables it.
 * 
 * @param alert Alert definition to check.
 * @param templateAlert Template alert definition.
 * @param allAlerts List of all alert definition.
 * 
 * @throws An {@link AppError} if there is any error checking the alert definitions.
 */
const checkAlertDefinition = async (alert: IAlert, templateAlert: IAlert | undefined, allAlerts: IAlert[]) => {
    if (!alert.id || !templateAlert)
        return;
    // Check if the alert needs to be updated or enabled.
    if (!_.isEqual(templateAlert, _.pick(alert, ALERT_VALUES))) {
        const updatedAlert = _.clone(templateAlert);
        updatedAlert.enabled = true;
        await updateAlertDefinition(alert.id, updatedAlert);
    } else if (!alert.enabled) {
        await enableAlertDefinition(alert.id);
    }
    // Remove it from the list so that it's not created later.
    allAlerts.splice(allAlerts.indexOf(templateAlert), 1);
};

/**
 * Returns the list of alert definitions that match the `ALERTS_QUERY` query.
 * 
 * @returns The list of alert definitions
 * 
 * @throws An {@link AppError} if there is any error reading the alert definitions.
 */
const getAlertDefinitions = async () => {
    try {
        const res = await DRMRest.get({ url: ALERTS_INVENTORY, params: { query: `description startswith '${APP_PREFIX}'` } });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list } = await res.body(true);
        return list as IAlert[];
    } catch (e) {
        const appError = newAppError("Error reading alert definitions", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Returns the alert definition with the given ID.
 * 
 * @param id ID of the alert definition to retrieve.
 * 
 * @returns The alert definition.
 * 
 * @throws An {@link AppError} if there is any error reading the alert definition.
 */
export const getAlertDefinition = async (id: number) => {
    try {
        const res = await DRMRest.get({ url: `${ALERTS_INVENTORY}/${id}` });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true) as IAlert;
    } catch (e) {
        const appError = newAppError(`Error reading alert definition ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Creates an alert definition based on the given alert.
 * 
 * @param alert Alert definition to create.
 * 
 * @returns The created alert definition.
 * 
 * @throws An {@link AppError} if there is any error creating the alert definition.
 */
const createAlertDefinition = async (alert: IAlert) => {
    try {
        const res = await DRMRest.post({ url: ALERTS_INVENTORY, body: alert });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true);
    } catch (e) {
        const appError = newAppError(`Error creating alert definition for ${alert.name}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Updates the alert definition with the given ID.
 * 
 * @param id ID of the alert definition to update.
 * @param alert Updated alert definition.
 * 
 * @returns The updated alert definition.
 * 
 * @throws An {@link AppError} if there is any error updating the alert definition.
 */
const updateAlertDefinition = async (id: number | string, alert: IAlert) => {
    try {
        const res = await DRMRest.put({ url: `${ALERTS_INVENTORY}/${id}`, body: alert });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const al: IAlert = await res.body(true);
        return al;
    } catch (e) {
        const appError = newAppError(`Error updating alert definition ${id} for ${alert.name}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Enables the alert definition with the given ID.
 * 
 * @param id ID of the alert definition to enable.
 * 
 * @returns The updated alert definition.
 * 
 * @throws An {@link AppError} if there is any error enabling the alert definition.
 */
const enableAlertDefinition = async (id: number | string) => {
    try {
        const res = await DRMRest.put({ url: `${ALERTS_INVENTORY}/${id}`, body: { enabled: true } });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const alert: IAlert = await res.body(true);
        return alert;
    } catch (e) {
        const appError = newAppError(`Error enabling alert definition ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};