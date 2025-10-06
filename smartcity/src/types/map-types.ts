import { ReactNode } from 'react';

import { IoTDevice } from '@models/IoTDevice';
import { IoTRoute } from '@customTypes/device-types';

/**
 * Interface representing a an IoT device Marker.
 */
export interface DeviceMarker {
    device: IoTDevice;
    visible: boolean;
    opacity: number;
    popover?: ReactNode;
    zIndex?: number;
}

/**
 * Interface representing an IoT route Path.
 */
export interface RoutePath {
    route: IoTRoute;
    visible: boolean;
    opacity: number;
}