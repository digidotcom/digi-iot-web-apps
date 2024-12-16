import { DEFAULT_MARKER_IMAGE, DEFAULT_FA_ICON } from '@configs/app-config';
import { IoTDeviceInterface, IoTMarkerImage, IoTRoute, IoTDeviceProperty, IoTDevicePropertyDef } from '@customTypes/device-types';

// Class implementing the IoTDevice interface with generic methods.
export class IoTDevice implements IoTDeviceInterface {
    
    // Variables (from interface).
    id: string;
    name: string;
    type: string;
    group: string;
    connected: boolean;
    maintenance: boolean;
    position?: google.maps.LatLngLiteral;
    lastUpdate: Date;

    // Variables (for the class)
    faIcon: string;
    markerImage: IoTMarkerImage;
    route?: IoTRoute;
    properties?: IoTDeviceProperty[];
    routePropertyID?: string; // The ID of the property that contains the route ID.

    /**
     * Class constructor. Instantiates a new IoTDevice object with the given
     * parameters.
     * 
     * @param device The IoTDeviceInterface the IoTDevice object will be based on.
     * @param faIcon The FA icon to use for this device.
     * @param markerImage The marker image to use for this device.
     * @param propertyDefs List of property definitions for this IoT device.
     */
    constructor(device: IoTDeviceInterface, faIcon?: string, markerImage?: IoTMarkerImage,
            propertyDefs?: IoTDevicePropertyDef[], routePropertyID?: string) {
        this.id = device.id;
        this.name = device.name;
        this.type = device.type;
        this.group = device.group;
        this.connected = device.connected;
        this.maintenance = device.maintenance;
        this.position = device.position;
        this.lastUpdate = device.lastUpdate;

        this.faIcon = faIcon || DEFAULT_FA_ICON;
        this.markerImage = markerImage || DEFAULT_MARKER_IMAGE;
        this.route = undefined;
        this.properties = [];
        this.routePropertyID = routePropertyID;

        // Create properties.
        propertyDefs?.forEach(propertyDef => {
            this.properties?.push(
                {
                    id: propertyDef.id,
                    name: propertyDef.name,
                    units: propertyDef.units ? propertyDef.units : "",
                    faIcon: propertyDef.faIcon,
                    value: "",
                    lastUpdate: undefined,
                    stream: `${this.id}/${propertyDef.stream}`,
                    color: propertyDef.color,
                    samplesHistoryRead: false
                }
            );
        });
    }

    /**
     * Retrieves the IoTProperty with the given ID.
     * 
     * @param propertyId The ID of the property to get.
     * 
     * @returns The IoTProperty with the given ID, 'undefined' if not found.
     */
    getProperty(propertyId: string): IoTDeviceProperty | undefined {
        return this.properties?.find(prop => prop.id === propertyId);
    }

    /**
     * Retrieves the value of the IoTProperty with the given ID.
     * 
     * @param propertyId The ID of the property to get its value.
     * 
     * @returns The value of the IoTProperty with the given ID as string, '' if not found.
     */
    getPropertyValue(propertyId: string): string {
        const property = this.getProperty(propertyId);

        return property ? property.value : "";
    }

    /**
     * Updates the current device data with the provided values.
     *
     * @param deviceData The new data to update the device with.
     */
    updateData(deviceData: IoTDeviceInterface) {
        this.name = deviceData.name;
        this.type = deviceData.type;
        this.group = deviceData.group;
        this.connected = deviceData.connected;
        this.maintenance = deviceData.maintenance;
        this.position = deviceData.position;
        this.lastUpdate = deviceData.lastUpdate;
    }
}