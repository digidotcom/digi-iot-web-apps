'use-client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import Loading from '@components/widgets/loading';
import { STATUS_LOADING, STATUS_LOADED } from '@configs/app-constants';
import { IoTRoute } from '@customTypes/device-types';
import { AppError } from '@models/AppError';
import RoutesManager from '@services/routes-manager';
import logLevel from '@utils/log-utils';
import { showError } from '@utils/toast-utils';

const log = logLevel.getLogger('routes-context');

// Define the context interface.
interface RoutesContextType {
    routes: IoTRoute[];
    isLoading: boolean;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

export const RoutesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState<IoTRoute[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(RoutesManager.status !== STATUS_LOADED);

    useEffect(() => {
        // Define an async function to initialize routes.
        const initializeRoutes = async () => {
            try {
                await RoutesManager.initialize();
            } catch (error) {
                showError((error as AppError).message);
            }
        };

        // Subscribe to changes in status.
        RoutesManager.subscribeStatus(handleStatusChange);
        // Subscribe to changes in routes.
        RoutesManager.subscribeRoutes(handleRoutesChange);
        // Initialize routes.
        initializeRoutes();

        // Called when component in unmounted.
        return () => {
            RoutesManager.unsubscribeStatus(handleStatusChange);
            RoutesManager.unsubscribeRoutes(handleRoutesChange);
        };
    }, []);

    /**
     * Handles a change in status by updating the state.
     *
     * @param status The new status value.
     */
    const handleStatusChange = (status: string) => {
        setIsLoading(status === STATUS_LOADING);
    };

    /**
     * Handles a change in routes by updating the state.
     *
     * @param routes The new list of IoT routes.
     */
    const handleRoutesChange = (routes: IoTRoute[]) => {
        setRoutes(routes);
    };

    if (isLoading) {
        return <Loading fullscreen text="Loading routes information..." />;
    }

    return (
        <RoutesContext.Provider value={{ routes, isLoading }}>
            {!isLoading && children}
        </RoutesContext.Provider>
    );
};

// Custom hook to use the RoutesContext
export const useRoutesContext = (): RoutesContextType => {
    const context = useContext(RoutesContext);
    if (!context) {
        throw new Error('useRoutesContext must be used within a RoutesProvider');
    }
    return context;
};