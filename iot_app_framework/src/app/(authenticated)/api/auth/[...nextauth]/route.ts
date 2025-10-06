import { BASE_PATH } from '@configs/app-config';
import { IUserInfo } from '@customTypes/next-auth';
import HttpError from '@models/HttpError';
import axios from 'axios';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextRequest, NextResponse } from 'next/server';

const defaultScheme = process.env.UI_DEFAULT_SCHEME || 'https';
const defaultHost = process.env.UI_DEFAULT_HOST || 'remotemanager.digi.com';

// Interface needed to use an advanced initialization of next-auth using app router.
// See https://github.com/nextauthjs/next-auth/issues/8243
interface RouteHandlerContext {
    params: { nextauth: string[] }
}

// Create the axios instance to communicate with DRM.
const axiosInstance = axios.create({
    baseURL: process.env.DRM_ADDRESS,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
    },
    withCredentials: false
});

/**
 * Fetches the user info with the provided DRM username and password.
 * 
 * @param username DRM username.
 * @param password DRM password.
 * @param ip IP where the request comes from.
 * 
 * @returns The user information.
 * 
 * @throws An {@link HttpError} if something is wrong in the process.
 */
const fetchUserInfo = async (username: string, password: string, ip: string) => {
    // Build the API auth credentials based on the given username and password.
    const apiAuth = Buffer.from(`${username}:${password}`).toString('base64');
    const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
        Authorization: `Basic ${apiAuth}`
    };
    if (ip) {
        headers['User-IP'] = ip;
    }

    // Call the DRM API to get the user info.
    const response = await axiosInstance.get('/ws/UserInfo/.json?size=1', { headers });
    if (response.status < 200 || response.status >= 300) {
        throw new HttpError({ status: response.status, statusText: 'Unknown or unavailable user' });
    }

    const userInfo = await response.data.items[0] as IUserInfo;
    if (!userInfo) {
        throw new HttpError({ status: 500, statusText: 'Unable to retrieve user info' });
    }

    const cstId = parseInt(userInfo.cstId, 10);
    return {
        username: userInfo.usrUserName,
        email: userInfo.usrEmail,
        customerId: cstId,
        role: userInfo.role,
        roleReadOnly: userInfo.roleReadOnly,
        roleAdmin: userInfo.roleAdmin,
        roleWebUi: userInfo.roleWebUi,
        firstName: userInfo.usrFirstName,
        lastName: userInfo.usrLastName,
        companyName: userInfo.cstCompanyName,
        apiAuth
    };
};

/**
 * Returns the authentication options.
 * 
 * @param userIp IP where the request comes from.
 * 
 * @returns The authentication options.
 */
const getAuthOptions = (userIp: string) => ({
    pages: {
        signIn: `${BASE_PATH}/login`,
        signOut: `${BASE_PATH}/logout`,
        error: `${BASE_PATH}/logout`,
    },
    callbacks: {
        async session({ session, token }) {
            return { ...session, user: { ...token } };
        },
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
        async redirect({ url, baseUrl }) {
            let newUrl = null;
            if (url.startsWith('/')) {
                newUrl = new URL(`${baseUrl.replace(BASE_PATH, '')}${BASE_PATH}${url.replace(BASE_PATH, '')}`);
            } else {
                newUrl = new URL(url);
            }
            if (newUrl.origin !== baseUrl) {
                return baseUrl;
            }

            const { searchParams } = newUrl;
            if (searchParams.has('callbackUrl')) {
                return `${newUrl.origin}${newUrl.pathname}?${searchParams.toString()}`;
            }
            return newUrl.toString();
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: process.env.SESSION_MAX_AGE ? Number(process.env.SESSION_MAX_AGE) : undefined,
    },
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: process.env.DRM_ADDRESS,
            type: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text', placeholder: '<username>' },
                password: { label: 'Password', type: 'password', placeholder: '<password>' }
            },
            async authorize(credentials) {
                if (credentials) {
                    try {
                        // Validate the user credentials by trying to fetch the user info.
                        // If they are invalid, the next call will throw an error.
                        const user = await fetchUserInfo(credentials.username, credentials.password, userIp);
                        // Credentials are valid, so return the user info.
                        return {
                            ...user,
                            id: user.username,
                            email: user.email,
                            name: user.username,
                        };
                    } catch (err) {
                        if (err instanceof HttpError) {
                            throw new Error(err.statusText);
                        }
                        throw new Error('Invalid credentials');
                    }
                }
                return null;
            }
        })
    ]
}) as AuthOptions;

// Authentication handler.
const handler = async (req: NextRequest, context: RouteHandlerContext) => {
    // @ts-ignore
    const protocol = req?.headers?.get('x-forwarded-proto') || defaultScheme;
    // @ts-ignore
    const host = req?.headers?.get('host') || defaultHost;
    if (req.url?.includes('api/auth/error')) {
        const incomingUrl = new URL(req.url);
        const logoutUrl = `${protocol}://${host}${BASE_PATH}/logout${incomingUrl.search}`;
        return NextResponse.redirect(logoutUrl);
    }

    const userIp = req?.ip || '';
    const authOptions = getAuthOptions(userIp);

    return await NextAuth(req, context, authOptions);
};

export { handler as GET, handler as POST };
