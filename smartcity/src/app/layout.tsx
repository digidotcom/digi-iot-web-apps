'use client';

import '@public/style.scss';
import 'font-awesome/css/font-awesome.min.css';
import 'simple-line-icons/css/simple-line-icons.css';

import { Source_Sans_3 as ss3 } from 'next/font/google';
import React from 'react';

import TopBar from '@components/navigation/topbar';
import AuthProvider from '@contexts/auth-provider';
import { BASE_PATH } from '@configs/app-config';

const font = ss3({
    variable: '--font-ss3',
    subsets: ['latin'],
    style: ['normal', 'italic'],
    weight: ['200', '300', '400', '600', '700', '900']
});

const RootLayout = ({ children }: React.PropsWithChildren): React.ReactNode => (
    <html lang="en" className={font.variable}>
        <head>
            <title>Digi IoT Fleet Management Demo for Smart City</title>
            <link rel="shortcut icon" href={`${BASE_PATH}/images/favicon.ico`} />
        </head>
        <body>
            <AuthProvider>
                <TopBar />
                {children}
            </AuthProvider>
        </body>
    </html>
);

export default RootLayout;
