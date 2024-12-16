// this file must be available on both client and server
import HttpError from '@models/HttpError';
import _ from 'lodash';
import { signOut } from 'next-auth/react';

import appLog from '@utils/log-utils';
import { BASE_PATH, THROTTLE_ERROR_DELAY } from '@configs/app-config';
import { RestRequest, RestResponse } from '@customTypes/query-types';
import CloudLogManager from '@services/cloud-log-manager';
import { showWarning } from '@utils/toast-utils';

const log = appLog.getLogger('use-rest');

const basePath = process.env.BASE_PATH ?? '';

const bodyFunction = (response: Response) => (as: 'object' | 'stream' | 'text' | boolean = true) => {
    switch (as) {
        case 'stream':
            return new Promise((resolve) => { resolve(response.body); });
        case 'text':
        case false:
            return response.text();
        case 'object':
        default:
            return response.json();
    }
};

const TYPE_BINARY = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const buildUrl = (path: string, params?: Record<string, any>) => {
    let url = '';
    if (path) {
        url += (path.startsWith('/') ? path : (`/${path}`));
    }

    if (params && _.isPlainObject(params) && !_.isEmpty(params)) {
        const queryParamKeys = Object.keys(params);
        const queryParamsFormatted = queryParamKeys.map((key) => `${key}=${encodeURIComponent(params[key])}`);
        url += `?${queryParamsFormatted.join('&')}`;
    }

    return url;
};

const convertHeaders = (headers: Headers) => {
    const converted: Record<string, string> = {};
    headers.forEach((v, k) => { converted[k.toLowerCase()] = v; });
    return converted;
};

const isBinaryResponse = (response: RestResponse) => response.headers['content-type'] === TYPE_BINARY;

class DRMRest {
    constructor() {
        this.get = this.get.bind(this);
        this.put = this.put.bind(this);
        this.post = this.post.bind(this);
        this.del = this.del.bind(this);
    }

    async request({ method, url, headers, params, body: data, ...rest }: RestRequest): Promise<RestResponse> {
        const requestHeaders = new Headers(headers);
        requestHeaders.set('X-Requested-With', 'XMLHttpRequest');
        if (!requestHeaders.has('accept')) {
            requestHeaders.set('accept', 'application/json');
        }
        // @ts-ignore
        if (_.isObject(data) && data.customer_id) {
            // @ts-ignore
            delete data.customer_id;
        }

        let body: any;
        if (method !== 'GET' && method !== 'DELETE') {
            const contentType = headers ? headers['content-type'] : undefined;
            body = (typeof data === 'object' && (contentType === undefined || contentType !== "application/octet-stream")) ? JSON.stringify(data) : data;
            if (!contentType) {
                requestHeaders.set('content-type', 'application/json');
            }
        }

        const finalUrl = buildUrl(`${basePath}/api${url}`, params);
        const req = {
            method,
            headers: requestHeaders,
            body,
        };
        if (log.getLevel() >= log.levels.DEBUG) {
            // Slight optimization for when we don't need to log
            log.debug(`Rest ${method} ${finalUrl} ${Array.from(requestHeaders.entries()).map((e) => e.join('=')).join(', ')}`);
        }
        const response = await fetch(finalUrl, req);

        const cloneRespone = response.clone();
        const logItem = {
            method,
            url,
            fullUrl: buildUrl(url, params),
            params,
            status: response.status,
            time: new Date(),
            requestBody: req.body,
            requestType: req.headers.get("content-type") ?? undefined,
            responseBody: await cloneRespone.text(),
            responseType: cloneRespone.headers.get("content-type") ?? undefined
        };
        CloudLogManager.addLogItem(logItem);

        if (response.status === 401) {
            const responseText = await response.text();
            const errorObj = JSON.parse(responseText);
            const errorMessage = errorObj.error ?? "Authentication required";
            signOut({ callbackUrl: `${window.location.origin}${BASE_PATH}/login?error=${encodeURIComponent(errorMessage)}`, redirect: false });
            throw new HttpError({ status: response.status, statusText: response.statusText });
        }

        // Check if the recived response is a "too many requests" error. In that case, retry with a small delay.
        if (response.status === 429) {
            showWarning("Requests are being submitted faster than your account allows. Retrying...", THROTTLE_ERROR_DELAY);
            await new Promise((resolve) => setTimeout(resolve, THROTTLE_ERROR_DELAY));
            return await this.request({method, url, headers, params, body: data, ...rest});
        }

        if (response.status < 200 || response.status >= 300 || response.status === 207) {
            let error;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                error = await response.json();
            } else {
                error = { error_message: await response.text() };
            }
            throw new HttpError({ status: response.status, statusText: response.statusText, data: error });
        }

        return {
            status: response.status,
            statusText: response.statusText,
            headers: convertHeaders(response.headers),
            body: bodyFunction(response)
        };
    }

    async get(config: Omit<RestRequest, 'method' | 'body'>) {
        return this.request({
            ...config,
            method: 'GET',
        });
    }

    async put(config: Omit<RestRequest, 'method'>) {
        return this.request({
            ...config,
            method: 'PUT',
        });
    }

    async post(config: Omit<RestRequest, 'method'>) {
        const response = await this.request({
            ...config,
            method: 'POST',
        });

        if (isBinaryResponse(response) && typeof response.body === 'string') {
            return {
                ...response,
                data: Buffer.from(response.body, 'binary').toString('base64'),
            };
        }

        return response;
    }

    async del(config: Omit<RestRequest, 'method' | 'body'>) {
        return this.request({
            ...config,
            method: 'DELETE',
        });
    }
}

const instance = new DRMRest();

export default instance;
