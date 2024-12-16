/** @type {import('next').NextConfig} */
const BASE_PATH = "/iot-fleet-management-demo";

const cspPolicies = `
    default-src 'self';
    script-src 'self'  https://maps.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://maps.gstatic.com 'unsafe-eval' https://*.appcues.com https://*.appcues.net https://edge.fullstory.com https://rs.fullstory.com 'unsafe-inline';
    connect-src 'self'  https://maps.googleapis.com https://www.googleapis.com https://*.appcues.com https://*.appcues.net wss://*.appcues.net wss://*.appcues.com https://edge.fullstory.com https://rs.fullstory.com;
    img-src 'self' data: https://maps.google.com https://www.google-analytics.com https://*.googleapis.com https://raw.githubusercontent.com https://maps.gstatic.com https://cdn.mxpnl.com/ data: blob: res.cloudinary.com twemoji.maxcdn.com https://rs.fullstory.com;
    style-src 'self' https://fonts.googleapis.com https://*.appcues.com https://*.appcues.net https://fonts.googleapis.com https://fonts.google.com 'unsafe-inline';
    frame-ancestors 'self';
    form-action 'none';
    font-src 'self' data: https://fonts.gstatic.com https://*.appcues.com;
    worker-src 'self' blob:;
`;

const nextConfig = {
    basePath: BASE_PATH,
    env: {
        BASE_PATH
    },
    reactStrictMode: false,
    experimental: {
        proxyTimeout: 180000,
        instrumentationHook: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspPolicies.replace(/\n/g, ''),
                    },
                ],
            }
        ];
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: `/login`,
                permanent: true,
            },
            {
                basePath: false,
                source: '/',
                destination: `${BASE_PATH}/login`,
                permanent: true,
            }
        ];
    }
};

export default nextConfig;
