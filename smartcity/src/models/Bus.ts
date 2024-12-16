import { BUS_FA_ICON, BUS_MARKER_IMAGE, BUSES_PROPERTIES, BUS_PROPERTY_LINE, BUS_PROPERTY_PASSENGERS, BUS_PROPERTY_POWER, BUS_PROPERTY_PRESSURE, BUS_PROPERTY_TEMPERATURE } from '@configs/buses-config';
import { BusInterface, BusLine } from '@customTypes/bus-types';
import { IoTDevice } from '@models/IoTDevice';

// Class implementing the Bus interface with getter logic.
export class Bus extends IoTDevice implements BusInterface {

    /**
     * Class constructor. Instantiates a new Bus object with the given
     * parameters.
     * 
     * @param device The IoTDevice the Bus object will be based on.
     */
    constructor(device: IoTDevice) {
        super(device, BUS_FA_ICON, BUS_MARKER_IMAGE, BUSES_PROPERTIES, BUS_PROPERTY_LINE);
    }

    // Getter for passengers property.
    get passengers(): number {
        return parseInt(this.getPropertyValue(BUS_PROPERTY_PASSENGERS)?? "0");
    }

    // Getter for power level property.
    get power(): number {
        return parseFloat(this.getPropertyValue(BUS_PROPERTY_POWER)?? "0");
    }

    // Getter for temperature property.
    get temperature(): number {
        return parseFloat(this.getPropertyValue(BUS_PROPERTY_TEMPERATURE)?? "0");
    }

    // Getter for pressure property.
    get pressure(): number {
        return parseFloat(this.getPropertyValue(BUS_PROPERTY_PRESSURE)?? "0");
    }

    // Getter for line property.
    get line(): BusLine {
        return this.route as BusLine ?? undefined;
    }
}