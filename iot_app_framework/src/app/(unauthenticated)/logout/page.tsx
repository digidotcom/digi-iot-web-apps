'use client';

import { NextComponentType } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';
import { useSWRConfig } from 'swr';

import Loading from '@components/widgets/loading';
import AlertsManager from '@services/alerts-manager';
import CloudLogManager from '@services/cloud-log-manager';
import DevicesManager from '@services/devices-manager';
import MonitorsManager from '@services/monitors-manager';
import RoutesManager from '@services/routes-manager';

const SignOut: NextComponentType = () => {
    const router = useRouter();
    const search = useSearchParams();
    const { status: sessionStatus } = useSession();
    const { mutate, cache } = useSWRConfig();

    /**
     * Cleans up all necessary resources when the use logs out.
     */
    const cleanUp = React.useCallback(async () => {
        // Disconnect and remove all monitors.
        MonitorsManager.tearDownMonitors();
        // Clear the devices list.
        DevicesManager.clear();
        // Clear the routes list.
        RoutesManager.clear();
        // Clear the cloud log.
        CloudLogManager.clearLog();
        // Clear the alerts list.
        AlertsManager.clear();
        await Promise.all([...cache.keys()].map((key) => mutate(key, undefined, { revalidate: false })));
    }, [cache, mutate]);

    // Handle authentication status changes
    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            // Expired sessions will follow this path, so ensure a cleanup is performed here too.
            cleanUp().then(() => {
                router.push(`/login?${search.toString()}`);
            });
        }

        if (sessionStatus === 'authenticated') {
            cleanUp().then(() => {
                signOut({ callbackUrl: `/login?${search.toString()}`, redirect: false });
            });
        }
    }, [sessionStatus, search, router, cleanUp]);

    return (
        <Loading fullscreen text="Logging out..." />
    );
};

const Page = () => (
    <Suspense>
        <SignOut />
    </Suspense>
);

export default Page;
