'use-client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { STATUS_LOADING, STATUS_LOADED } from '@configs/app-constants';
import { AppError } from '@models/AppError';
import { IoTDevice } from '@models/IoTDevice';
import DevicesManager from '@services/devices-manager';
import { showError } from '@utils/toast-utils';

// Define the context interface.
interface DevicesContextType {
    devices: IoTDevice[];
    isLoading: boolean;
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

// Create a provider component.
export const DevicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { status } = useSession();
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(DevicesManager.status !== STATUS_LOADED);

    useEffect(() => {
        if (status === 'authenticated') {
            // Define an async function to initialize devices.
            const initializeDevices = async () => {
                try {
                    await DevicesManager.initialize();
                } catch (error) {
                    showError((error as AppError).message);
                }
            };

            // Subscribe to changes in status.
            DevicesManager.subscribeStatus(handleStatusChange);
            // Subscribe to changes in devices.
            DevicesManager.subscribeDevices(handleDevicesChange);
            // Initialize devices.
            initializeDevices();

            // Called when component in unmounted.
            return () => {
                DevicesManager.unsubscribeStatus(handleStatusChange);
                DevicesManager.unsubscribeDevices(handleDevicesChange);
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
     * Handles a change in devices by updating the state.
     *
     * @param devices The new list of IoT devices.
     */
    const handleDevicesChange = (devices: IoTDevice[]) => {
        setDevices(devices);
    };

    return (
        <DevicesContext.Provider value={{ devices, isLoading }}>
            {children}
        </DevicesContext.Provider>
    );
};

// Custom hook to use the DevicesContext.
export const useDevicesContext = (): DevicesContextType => {
    const context = useContext(DevicesContext);
    if (!context) {
        throw new Error('useDevicesContext must be used within a DevicesProvider');
    }
    return context;
};
