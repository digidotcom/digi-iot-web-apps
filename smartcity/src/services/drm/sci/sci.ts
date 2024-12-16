import xml2js from 'xml2js';

import { SCIRequestParams, SCIRequestParamsWithHeaders, SCIResponse } from '@customTypes/sci-types';
import HttpError from '@models/HttpError';
import DRMRest from '@services/drm/drm-rest';
import DataService from '@services/drm/sci/data-service';
import { handleHttpError, parseXMLError } from '@utils/error-utils';
import appLog from '@utils/log-utils';
import { XML2JS_OPTIONS } from '@utils/xml-utils';

const log = appLog.getLogger('devicecloud-sci');

const _defaultSCIResponseProcessor = async (response: SCIResponse): Promise<any> => {
    const parseOptions = XML2JS_OPTIONS;
    log.debug('response timingPhases: ', JSON.stringify(response.timingPhases));

    try {
        const responseBody = await response.body(false);
        const parsedString = await xml2js.parseStringPromise(responseBody, parseOptions);
        return parsedString;
    } catch (err) {
        throw handleHttpError(err);
    }
};

class SCIBase {}

class SCIBaseWithMixins extends DataService(SCIBase) {}

class SCI extends SCIBaseWithMixins {
    getSCIXMLWrapper({ operation, deviceIds, options = '', source = 'drm-ui' }: SCIRequestParams): [string, string] {
        const _deviceIds = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
        let targetList = '';
        _deviceIds.forEach((deviceId) => {
            targetList += `<device id="${deviceId}"/>`;
        });
        const sciStart = `
            <sci_request version="1.0">
                <${operation} ${(options || '')}>
                    <source>${source}</source>
                    <targets>
                        ${targetList}
                    </targets>`;
                    const sciEnd = `
                </${operation}>
            </sci_request>`;

        return [sciStart, sciEnd];
    }

    async doDeviceSciCommand(req: SCIRequestParamsWithHeaders) {
        try {
            return await DRMRest.post({
                ...req,
                url: '/ws/sci',
                headers: {
                    'content-type': 'application/xml',
                    ...req.headers,
                },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                throw parseXMLError((error as HttpError).statusText);
            }
            throw handleHttpError(error);
        }
    }

    async sendSCI(
        operation: string,
        deviceIds: string | string[],
        payload: string,
        options: string = '',
        source: string = 'drm-ui',
        reqParams: SCIRequestParamsWithHeaders = {},
        agent: any = null,
        responseProcessor: (response: SCIResponse) => Promise<any> = _defaultSCIResponseProcessor
      ) {
        const [sciStart, sciEnd] = this.getSCIXMLWrapper({ operation, deviceIds, options, source });
        const req: SCIRequestParamsWithHeaders = {
            body: [sciStart, (payload || ''), sciEnd].join(''),
            params: reqParams,
        };

        if (agent) {
            req.agent = agent;
        }

        const response = await this.doDeviceSciCommand(req);
        return responseProcessor(response);
    }
}

export default SCI;
