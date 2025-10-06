import { INewTemplate, ITemplate, IUpdateTemplate } from '@customTypes/template-types';
import { AppError } from '@models/AppError';
import { TEMPLATES_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

const log = logLevel.getLogger("templates-functions");

/**
 * Returns the list of templates that target the given group. If no group is provided,
 * all templates are returned.
 * 
 * @param group The group all templates target to.
 * 
 * @returns The list of templates.
 */
export const getTemplates = async (group?: string) => {
    const queryParams = {
        ...(group && { query: `groups='${group}'` })
    };
    try {
        const res = await DRMRest.get({ url: TEMPLATES_INVENTORY, params: queryParams });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: ITemplate[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError("Error getting templates", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Enables or disables the template with the given ID.
 * 
 * @param id ID of the template to enable or disable.
 * @param enable `true` to enable the template, `false` to disable it.
 * 
 * @throws An {@link AppError} if there is any error enabling or disabling the template.
 */
export const enableTemplate = async (id: number, enable: boolean) => {
    try {
        await DRMRest.put({ url: `${TEMPLATES_INVENTORY}/${id}`, body: JSON.stringify({ enabled: enable }) });
    } catch (e) {
        const appError = newAppError(`Error updating template with ID ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Creates the given template.
 * 
 * @param template Template to create.
 * 
 * @returns The created template.
 * 
 * @throws An {@link AppError} if there is any error creating the template.
 */
export const createTemplate = async (template: INewTemplate) => {
    try {
        const res = await DRMRest.post({ url: TEMPLATES_INVENTORY, body: template });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true) as ITemplate;
    } catch (e) {
        const appError = newAppError("Error creating template", e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Updates the template with the given ID.
 * 
 * @param id ID of the template to update.
 * @param template Updates of the template.
 * 
 * @returns The updated template.
 * 
 * @throws An {@link AppError} if there is any error updating the template.
 */
export const updateTemplate = async (id: number, template: IUpdateTemplate) => {
    try {
        const res = await DRMRest.put({ url: `${TEMPLATES_INVENTORY}/${id}`, body: template });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true) as ITemplate;
    } catch (e) {
        const appError = newAppError(`Error updating template with ID ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Deletes the template with the given ID.
 * 
 * @param id ID of the template to delete.
 * 
 * @throws An {@link AppError} if there is any error deleting the template.
 */
export const deleteTemplate = async (id: number) => {
    try {
        await DRMRest.del({ url: `${TEMPLATES_INVENTORY}/${id}` });
    } catch (e) {
        const appError = newAppError(`Error deleting template with ID ${id}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};