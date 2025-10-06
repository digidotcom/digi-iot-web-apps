import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { BASE_PATH } from '@configs/app-config';
import appLog from '@utils/log-utils';

const log = appLog.getLogger('middleware');

const platform = process.env.DRM_ADDRESS;

const convertUrl = (url: string) => {
    // Adjust URL if it starts with BASE_PATH
    const adjustedUrl = url.startsWith(BASE_PATH) ? url.slice(BASE_PATH.length) : url;
    return new URL(adjustedUrl.substring(adjustedUrl.indexOf('/api/') + '/api'.length), platform);
};

const copyHeaders = (names: string[], from: Headers, to: Headers) => {
    const headerLog: { [key: string]: string | string[] | undefined } = {};
    names.forEach((name) => {
        const header = from.get(name);
        if (header) {
            to.append(name, header);
            headerLog[name] = header;
        }
    });
    return headerLog;
};

/**
 * Middleware to handle authentication for requests. It will redirect the user to
 * the login page if no token is found.
 *
 * @param request The incoming NextRequest.
 * 
 * @returns The modified response.
 */
export default async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        // No valid token, return 401 Unauthorized for API calls
        return NextResponse.json({ error: 'Requires Authentication' }, { status: 401, statusText: 'Not Authenticated' });
    }

    const { url, method } = request;
    const headers = new Headers();
    const fetchUrl = convertUrl(url);

    const { username, customerId, apiAuth } = token;
    headers.set('Authorization', `Basic ${apiAuth}`);
    const headerSimple = copyHeaders(['Accept', 'Content-Type'], request.headers, headers);
    const ip = request.ip ?? request.headers.get('x-forwarded-for');

    if (ip) headers.set('User-IP', ip);
    if (url.indexOf('/ws/v1/monitors') >= 0 && method === 'GET') {
        headers.set('External-User-Request', 'true');
    }

    if (log.getLevel() >= log.levels.DEBUG) {
        // Slight optimization for when we don't need to log
        log.debug(`API ${username} ${customerId} ${request.method} ${fetchUrl} ${JSON.stringify(headerSimple)}`);
    }

    return NextResponse.rewrite(fetchUrl, {
        headers
    });
}

/**
 * Path prefixes to intercept.
 */
export const config = {
    matcher: ['/api/ws/:path*'],
};
