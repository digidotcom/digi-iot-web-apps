'use-client';

import { STATUS_LOADED, STATUS_LOADING } from '@configs/app-constants';
import { IAlertSummary } from '@customTypes/alert-types';
import { AppError } from '@models/AppError';
import alertsManager from '@services/alerts-manager';
import { showError } from '@utils/toast-utils';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the context interface.
interface AlertsContextType {
    alerts: IAlertSummary[];
    isLoading: boolean;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Create a provider component.
export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { status } = useSession();
    const [alerts, setAlerts] = useState<IAlertSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(alertsManager.status !== STATUS_LOADED);

    useEffect(() => {
        if (status === 'authenticated') {
            // Define an async function to initialize alerts.
            const initializeAlerts = async () => {
                try {
                    await alertsManager.initialize();
                } catch (error) {
                    showError((error as AppError).message);
                }
            };

            // Subscribe to changes in status.
            alertsManager.subscribeStatus(handleStatusChange);
            // Subscribe to changes in alerts.
            alertsManager.subscribeAlerts(handleAlertsChange);
            // Initialize alerts.
            initializeAlerts();

            // Called when component in unmounted.
            return () => {
                alertsManager.unsubscribeStatus(handleStatusChange);
                alertsManager.unsubscribeAlerts(handleAlertsChange);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
     * Handles a change in alerts by updating the state.
     *
     * @param alerts The new list of alerts.
     */
    const handleAlertsChange = (alerts: IAlertSummary[]) => {
        setAlerts([...alerts]);
    };

    return (
        <AlertsContext.Provider value={{ alerts, isLoading }}>
            {children}
        </AlertsContext.Provider>
    );
};

// Custom hook to use the AlertsContext.
export const useAlertsContext = (): AlertsContextType => {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlertsContext must be used within a AlertsProvider');
    }
    return context;
};