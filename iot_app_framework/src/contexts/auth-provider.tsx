'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Loading from '@components/widgets/loading';
import { BASE_PATH } from '@configs/app-config';
import { getRouteUrl } from '@utils/url-utils';

export const Auth = ({ children }: React.PropsWithChildren) => {
    const { status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [wasAuthenticated, setWasAuthenticated] = useState(false);

    useEffect(() => {
        // Update wasAuthenticated when the user is authenticated
        if (status === 'authenticated') {
            setWasAuthenticated(true);
        }

        if (status === 'unauthenticated' && !pathname.includes("/login") && !pathname.includes("/logout")) {
            router.push(getRouteUrl("/logout", { callbackUrl: pathname, error: wasAuthenticated ? 'Session expired' : 'Login required' }));
        }
    }, [status, router, pathname, wasAuthenticated]);

    if (status === 'loading') {
        return <Loading fullscreen text="Checking login status..." />;
    }

    return <>{children}</>;
};

const AuthProvider = ({ children }: React.PropsWithChildren) => {
    return (
        <SessionProvider
            basePath={`${BASE_PATH}/api/auth`}
            refetchOnWindowFocus={true}
        >
            <Auth>
                {children}
            </Auth>
        </SessionProvider>
    );
};

export default AuthProvider;
