'use-client';

import React, { createContext, useContext, useMemo } from 'react';

import { GROUP_BUSES } from '@configs/buses-config';
import { useDevicesContext } from '@contexts/devices-provider';
import { Bus } from '@models/Bus';

// Define the context interface.
interface BusesContextValue {
    buses: Bus[];
    isLoading: boolean;
}

const BusesContext = createContext<BusesContextValue | undefined>(undefined);

export const BusesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { devices, isLoading: devicesLoading } = useDevicesContext();

    // Filter the list of devices to get only those belonging to the "buses" group.
    const buses = useMemo(() => devices.filter((device): device is Bus => device.group === GROUP_BUSES), [devices]);

    return (
        <BusesContext.Provider value={{ buses, isLoading: devicesLoading }}>
            {children}
        </BusesContext.Provider>
    );
};

// Custom hook to use BusesContext
export const useBusesContext = () => {
    const context = useContext(BusesContext);
    if (!context) {
        throw new Error('useBusesContext must be used within a BusesProvider');
    }
    return context;
};