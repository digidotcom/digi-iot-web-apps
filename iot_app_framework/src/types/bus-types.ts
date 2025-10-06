import { IoTRoute } from '@customTypes/device-types';
import { IoTDevice } from '@models/IoTDevice';

/**
 * Interface representing a Bus.
 */
export interface BusInterface extends IoTDevice {
    passengers: number;
    power: number;
    temperature: number;
    pressure: number;
    line?: BusLine;
}

/**
 * Interface representing a Bus line.
 */
export interface BusLine extends IoTRoute {
    number: number
    start: string,
    stop: string,
    maxBuses: number,
    stops: []
}
