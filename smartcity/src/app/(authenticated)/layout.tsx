'use client';

import 'react-toastify/dist/ReactToastify.css';

import { useSession } from 'next-auth/react';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import CloudLog from '@components/cloud-log/cloud-log';
import Sidebar from '@components/navigation/sidebar';
import Loading from '@components/widgets/loading';
import { TOAST_CONFIG } from '@configs/app-config';
import { AlertsProvider } from '@contexts/alerts-provider';
import { DevicesProvider } from '@contexts/devices-provider';
import { RoutesProvider } from '@contexts/routes-provider';
import appState from '@services/app-state';

const COMPRESSED_WIDTH = 768;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession();

    React.useEffect(() => {
        const resize = () => {
            const small = window.innerWidth < COMPRESSED_WIDTH;
            const { layout } = appState.get();
            layout.set({ smallView: small, sidebarVisible: !small });
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // Display a loading indicator until authentication is confirmed.
    if (status === 'loading' || status === 'unauthenticated') {
        return <Loading fullscreen text="Checking authentication status..." />;
    }

    return (
        <RoutesProvider>
            <DevicesProvider>
                <AlertsProvider>
                    <Sidebar/>
                    <div className="page-layout c-wrapper">
                        <div className="main position-relative">
                            <div id="main-content" className="absolute-layout-container container-fluid">
                                {children}
                            </div>
                        </div>
                    </div>
                    <CloudLog/>
                    <ToastContainer {...TOAST_CONFIG}/>
                </AlertsProvider>
            </DevicesProvider>
        </RoutesProvider>
    );
};

export default MainLayout;