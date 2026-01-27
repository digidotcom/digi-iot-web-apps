import { GROUP_BUSES } from "@configs/buses-config";
import { Bus } from "@models/Bus";
import { IDevice, IoTDeviceInterface, IoTDevicesGroup } from '@customTypes/device-types';
import { IoTDevice } from "@models/IoTDevice";

/**
 * Creates an IoT Device instance from the given device data.
 *
 * @param drmDevice The DRM device data to create the device from.
 * 
 * @return The created IoT device, undfined if no device was created.
 */
export function createDevice(drmDevice: IDevice, deviceGroups: IoTDevicesGroup[]): IoTDevice | undefined {
    const deviceData: IoTDeviceInterface = extractDeviceData(drmDevice);

    if (deviceData.group === GROUP_BUSES) {
        const bus = new Bus(deviceData);
        deviceGroups.find(g => g.id === GROUP_BUSES)?.devices.push(bus);
        return bus;
    }

    return undefined;
}

/**
 * Extracts device data from the given DRM device.
 *
 * @param drmDevice The DRM device to extract data from.
 * 
 * @returns An object containing the extracted device data.
 */
export function extractDeviceData(drmDevice: IDevice) {
    const name = drmDevice.name ?? "";
    const group = drmDevice.group ?? "";
    const coordinates = drmDevice.geoposition?.coordinates;
    const position = coordinates && coordinates.length > 1 ? {
        lat: coordinates[1],
        lng: coordinates[0]
    } : undefined;
    const lastUpdate = drmDevice.last_update ? new Date(drmDevice.last_update) : new Date();
    const connected = drmDevice.connection_status == 'connected';
    const maintenance = drmDevice.in_maintenance_window == "yes";
    const firmwareVersion = drmDevice.firmware_version ?? "";
    const vendorId = drmDevice.vendor_id ?? 0;
    return {
        id: drmDevice.id,
        name: name,
        type: drmDevice.type,
        group: group,
        connected: connected,
        maintenance: maintenance,
        firmwareVersion: firmwareVersion,
        vendorId: vendorId,
        position: position,
        lastUpdate: lastUpdate
    }
}