import { APP_GROUPS, DEFAULT_SAMPLES_NUMBER, MONITOR_DATA_POINTS, MONITOR_DEVICES } from '@configs/app-config';
import { STATUS_ERROR, STATUS_LOADED, STATUS_LOADING, STATUS_NOT_LOADED } from '@configs/app-constants';
import { GROUP_BUSES } from '@configs/buses-config';
import { IDevice, IoTDeviceInterface, IoTDevicesGroup } from '@customTypes/device-types';
import { DataPointMonitorSample, DevicesMonitorSample } from '@customTypes/monitor-types';
import { IStream } from '@customTypes/stream-types';
import { AppError } from '@models/AppError';
import { Bus } from '@models/Bus';
import { IoTDevice } from '@models/IoTDevice';
import { getDevices } from '@services/drm/devices';
import { getStreams } from '@services/drm/streams';
import MonitorsManager from '@services/monitors-manager';
import RoutesManager from '@services/routes-manager';
import { newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

// Variables.
const log = logLevel.getLogger('devices-manager');

class DevicesManager {
    // Variables.
    private static instance: DevicesManager;

    private deviceGroups: IoTDevicesGroup[] = [];
    private statusListeners: ((status: string) => void)[] = [];
    private deviceListeners: ((devices: IoTDevice[]) => void)[] = [];
    private groupListeners: { [groupId: string]: ((devices: IoTDevice[]) => void)[] } = {};
    private _status: string = STATUS_NOT_LOADED;
    private _errorMessage: string | undefined = undefined;

    // Private constructor to ensure singleton pattern
    private constructor() {
        // Bind the callbacks to ensure the correct `this` context.
        this.devicesMonitorCallback = this.devicesMonitorCallback.bind(this);
        this.datapointsMonitorCallback = this.datapointsMonitorCallback.bind(this);
    }

    // Public method to get the singleton instance
    public static getInstance(): DevicesManager {
        if (!DevicesManager.instance) {
            DevicesManager.instance = new DevicesManager();
        }
        return DevicesManager.instance;
    }

    // Getter for status.
    get status(): string {
        return this._status;
    }

    // Getter for error message.
    get errorMessage(): string | undefined {
        return this._errorMessage;
    }

    // Getter for groups.
    get groups(): IoTDevicesGroup[] {
        return this.deviceGroups;
    }

    // Getter for devices.
    get devices(): IoTDevice[] | undefined {
        return this.deviceGroups.flatMap(group => group.devices);
    }

    /**
     * Initialize the DevicesManager by fetching devices from cloud and setting up monitoring.
     * 
     * @throws An {@link AppError} if there is any error initializing devices.
     */
    public async initialize(): Promise<void> {
        // Sanity check.
        if (this.status === STATUS_LOADED || this.status === STATUS_LOADING) {
            return;
        }

        // Update status.
        this.notifyStatusListeners(STATUS_LOADING);
        this._errorMessage = undefined;
        // Create the groups.
        this.createGroups();
        // Fetch devices from the cloud.
        try {
            const drmDevices: IDevice[] = await getDevices(APP_GROUPS);
            // Build the device objects.
            drmDevices.forEach(device => {
                // Create the IoT device and add it to its group.
                this.createDevice(device);
            });
            // Build the streams query.
            const streamsQuery = this.deviceGroups.flatMap(group =>
                group.devices.flatMap(device => `id startsWith '${device.id}'`
            )).join(" or ");
            // Fetch streams from the cloud.
            const streams: IStream[] = streamsQuery ? await getStreams(streamsQuery) : [];
            // Initialize the device properties with the information read from the streams.
            this.initDeviceProperties(streams);
            try {
                // Initialize the monitors.
                await this.initMonitors();
            } catch (error) {
                throw error;
            } finally {
                // Update status.
                this.notifyStatusListeners(STATUS_LOADED);
                // Notify listeners.
                this.notifyDeviceListeners();
                this.deviceGroups.forEach(group => this.notifyGroupListeners(group.id));
            }
        } catch (error) {
            const appError = newAppError("Failed to initialize DevicesManager", error as any);
            log.error(appError.message);
            this._errorMessage = appError.message;
            // Update status.
            this.notifyStatusListeners(STATUS_ERROR);
            throw appError;
        }
    }

    /**
     * Extracts device data from the given DRM device.
     *
     * @param drmDevice The DRM device to extract data from.
     * 
     * @returns An object containing the extracted device data.
     */
    private extractDeviceData(drmDevice: IDevice) {
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
        return {
            id: drmDevice.id,
            name: name,
            type: drmDevice.type,
            group: group,
            connected: connected,
            maintenance: maintenance,
            position: position,
            lastUpdate: lastUpdate
        }
    }

    /**
     * Creates an IoT Device instance from the given device data.
     *
     * @param drmDevice The DRM device data to create the device from.
     * 
     * @return The created IoT device, undfined if no device was created.
     */
    private createDevice(drmDevice: IDevice) {
        // Extract device information.
        const deviceData: IoTDeviceInterface = this.extractDeviceData(drmDevice);
        // Build the object.
        const iotDevice = new IoTDevice(deviceData);
        // Create the final device and add it to its group.
        if (iotDevice.group === GROUP_BUSES) {
            const bus = new Bus(iotDevice);
            this.deviceGroups.find(group => group.id === GROUP_BUSES)?.devices.push(bus);

            return bus;
        }

        return undefined;
    }

    /**
     * Creates the list of groups.
     */
    private createGroups() {
        APP_GROUPS.forEach(group => {
            this.deviceGroups.push({id: group, devices: []});
        });
    }

    /**
     * Initializes device properties using the provided streams.
     *
     * @param streams The list of streams to update device properties.
     */
    private initDeviceProperties(streams: IStream[]) {
        this.deviceGroups.forEach(group =>
            group.devices.forEach(device =>
                device.properties?.forEach(property => {
                    const stream = streams.find(stream => stream.id === property.stream);
                    if (stream) {
                        property.value = stream.value ?? "";
                        property.units = stream.units ?? property.units;
                        property.lastUpdate = stream.timestamp ?? new Date(0);
                        // Check if this property provides the route information.
                        if (device.routePropertyID && device.routePropertyID === property.id) {
                            const route = RoutesManager.routes?.filter(route =>
                                route.types.includes(device.type)).find(route =>
                                    route.id == property.value?.toString());
                            if (route) {
                                device.route = route;
                            }
                        }
                    }
                }
        )));
    }

    /**
     * Updates an existing device or creates a new one if it does not exist
     * using the given device monitor sample.
     *
     * @param deviceMonitorSample The device data used to update or create the
     *                              device.
     * 
     * @return The updated or created IoT device, undfined if no device was updated or created.
     */
    private updateDeviceFromDeviceMonitor(deviceMonitorSample: DevicesMonitorSample) {
        // If the type is empty, the device has been probably removed from the account, so do not continue.
        if (!deviceMonitorSample.type) {
            return undefined;
        }
        // Create intermediate IDevice object.
        const drmDevice: IDevice = {
            id: deviceMonitorSample.id,
            device_id: deviceMonitorSample.id,
            name: deviceMonitorSample.name,
            type: deviceMonitorSample.type,
            group: deviceMonitorSample.group,
            last_update: deviceMonitorSample.last_update,
            geoposition: deviceMonitorSample.location ? {
                coordinates: deviceMonitorSample.location
            } : undefined,
            connection_status: deviceMonitorSample.status == "connected" ? "connected" : "disconnected",
            in_maintenance_window: deviceMonitorSample.maintenance,
            // Below values are required in the interface but not used by us.
            customer_id: 0,
            last_connect: "",
            capabilities: {}
        };
        // Look for the device to update.
        let device = this.deviceGroups.find(group =>
            group.id === deviceMonitorSample.group)?.devices.find(device =>
                device.id === deviceMonitorSample.id);
        // If the device already exists, update it.
        if (device) {
            // Extract device information.
            const deviceData: IoTDeviceInterface = this.extractDeviceData(drmDevice);
            device.updateData(deviceData);
        } else {
            // Device is new, create it and store in its group.
            device = this.createDevice(drmDevice);
        }

        return device;
    }

    /**
     * Updates an existing device using the given data point monitor sample.
     *
     * @param monitorSample The data point data used to update the device.
     * 
     * @return The updated IoT device, undefined if data did not match any device.
     */
    private updateDeviceFromDataPointMonitor(monitorSample: DataPointMonitorSample) {
        // Look for the device to update.
        let device = this.deviceGroups.find(group =>
            group.id === monitorSample.group)?.devices.find(device =>
                device.id === monitorSample.stream.split("/")[0]);
        if (device) {
            // Look for the property to update.
            const property = device.properties?.find(property => property.stream === monitorSample.stream)
            if (property) {
                property.value = monitorSample.value;
                property.lastUpdate = monitorSample.timestamp;
                // Check if the sample should be added to the array.
                if (property.samplesHistory && property.samplesHistoryRead) {
                    // Append the new sample to the history
                    property.samplesHistory.unshift({
                        value: monitorSample.value,
                        timeStamp: monitorSample.timestamp
                    });
                    // Ensure that we do not exceed the max size.
                    if (property.samplesHistory.length > DEFAULT_SAMPLES_NUMBER) {
                        property.samplesHistory.pop(); // Remove the oldest sample (last element in the array)
                    }
                }
                // Check if this property provides the route information and it changed.
                if (device.routePropertyID && device.routePropertyID === property.id) {
                    const route = RoutesManager.routes?.filter(route =>
                        route.types.includes(device?.type || "")).find(route =>
                            route.id == property.value?.toString());
                    if (route && device.route !== route) {
                        device.route = route;
                    }
                }

                return device;
            }
        }

        return undefined;
    }

    /**
     * Called when the devices monitor receives data.
     * 
     * @param data Received data in JSON format.
     * @param error Received error string.
     */
    private async devicesMonitorCallback(data?: object, error?: string) {
        // Sanity check.
        if (error) {
            log.error(`Error received from devices monitor: ${error}`);
            return;
        }
        // Ensure data is an array.
        if (!Array.isArray(data)) {
            log.error('Invalid data received from devices monitor. Expected an array but got: ', data);
            return;
        }
        // Transform data.
        const monitorSamples = data as DevicesMonitorSample[];
        if (!monitorSamples || monitorSamples.length == 0) {
            return;
        }
        // Track modified groups.
        const updatedGroups: string[] = [];
        // Iterate the list of devices.
        monitorSamples.forEach(async monitorSample => {
            const device = this.updateDeviceFromDeviceMonitor(monitorSample);
            if (device && !updatedGroups.includes(device.group)) {
                updatedGroups.push(device.group);
            }
        });
        // Notify listeners. Call it only once after all data is processed.
        this.notifyDeviceListeners();
        updatedGroups.forEach(group => this.notifyGroupListeners(group));
    };

    /**
     * Called when the data points monitor receives data.
     * 
     * @param data Received data in JSON format.
     * @param error Received error string.
     */
    private async datapointsMonitorCallback(data?: object, error?: string) {
        // Sanity check.
        if (error) {
            log.error(`Error received from data points monitor: ${error}`);
            return;
        }
        // Ensure data is an array.
        if (!Array.isArray(data)) {
            log.error('Invalid data received from data points monitor. Expected an array but got: ', data);
            return;
        }
        // Transform data.
        const monitorSamples = data as DataPointMonitorSample[];
        if (!monitorSamples || monitorSamples.length == 0) {
            return;
        }
        // Track modified groups.
        const updatedGroups: string[] = [];
        // Iterate the list of data points.
        monitorSamples.forEach(async monitorSample => {
            const device = this.updateDeviceFromDataPointMonitor(monitorSample);
            if (device && !updatedGroups.includes(device.group)) {
                updatedGroups.push(device.group);
            }
        });
        // Notify listeners. Call it only once after all data is processed.
        this.notifyDeviceListeners();
        updatedGroups.forEach(group => this.notifyGroupListeners(group));
    };

    /**
     * Initializes monitors for devices and data points if they do not already exist.
     */
    private async initMonitors() {
        if (!MonitorsManager.monitorExists(MONITOR_DEVICES)) {
            await MonitorsManager.createMonitor(MONITOR_DEVICES);
            MonitorsManager.registerMonitorCallback(MONITOR_DEVICES, this.devicesMonitorCallback);
        }
        if (!MonitorsManager.monitorExists(MONITOR_DATA_POINTS)) {
            await MonitorsManager.createMonitor(MONITOR_DATA_POINTS);
            MonitorsManager.registerMonitorCallback(MONITOR_DATA_POINTS, this.datapointsMonitorCallback);
        }
    }

    /**
     * Returns the device group with the given ID.
     * 
     * @param groupID ID of the group to retrieve.
     * 
     * @returns The group with the given ID.
     */
    getGroup(groupID: string) {
        return this.deviceGroups.find(group => group.id === groupID);
    }

    /**
     * Clears the list of devices.
     */
    clear() {
        // Remove all devices.
        this.deviceGroups.forEach(group => group.devices = []);
        // Notify listeners.
        this.notifyDeviceListeners();
        this.deviceGroups.forEach(group => this.notifyGroupListeners(group.id));
        // Update status.
        this.notifyStatusListeners(STATUS_NOT_LOADED);
    }

    /**
     * Retrieves the devices for the specified group.
     *
     * @param groupID The ID of the group to find devices for.
     * 
     * @returns An array of IoT devices or undefined if the group is not found.
     */
    public getDevices(groupID: string): IoTDevice[] | undefined {
        return this.deviceGroups.find(group => group.id === groupID)?.devices;
    }

    /**
     * Adds a listener for status changes.
     *
     * @param listener The function to be called with the status update.
     */
    subscribeStatus(listener: (status: string) => void) {
        this.statusListeners.push(listener);
    }

    /**
     * Adds a listener for device list changes.
     *
     * @param listener The function to be called when the devices list changes.
     */
    subscribeDevices(listener: (devices: IoTDevice[]) => void) {
        this.deviceListeners.push(listener);
    }

    /**
     * Adds a listener for changes within a specific group of devices.
     *
     * @param groupId The ID of the group to subscribe to.
     * @param listener The function to be called when the group changes.
     */
    subscribeToGroup(groupId: string, listener: (devices: IoTDevice[]) => void) {
        if (!this.groupListeners[groupId]) {
            this.groupListeners[groupId] = [];
        }
        this.groupListeners[groupId].push(listener);
    }

    /**
     * Removes a listener from the status listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeStatus(listener: (status: string) => void) {
        this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    }

    /**
     * Removes a listener from the device listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeDevices(listener: (devices: IoTDevice[]) => void) {
        this.deviceListeners = this.deviceListeners.filter((l) => l !== listener);
    }

    /**
     * Removes a group-level listener from a specific group.
     *
     * @param groupId The ID of the group.
     * @param listener The listener function to be removed.
     */
    unsubscribeFromGroup(groupId: string, listener: (devices: IoTDevice[]) => void) {
        if (this.groupListeners[groupId]) {
            this.groupListeners[groupId] = this.groupListeners[groupId].filter((l) => l !== listener);
        }
    }

    /**
     * Sets the given status and notifies it to all status listeners.
     *
     * @param newStatus The new status to set and notify.
     */
    private notifyStatusListeners(newStatus: string) {
        this._status = newStatus;
        this.statusListeners.forEach((listener) => listener(this._status));
    }

    /**
     * Notifies all devices of a change in the devices list.
     */
    private notifyDeviceListeners() {
        this.deviceListeners.forEach((listener) => listener(this.devices ?? []));
    }

    /**
     * Notifies all listeners of a specific group when that group changes.
     *
     * @param groupId The ID of the group to notify listeners for.
     */
    private notifyGroupListeners(groupId: string) {
        if (this.groupListeners[groupId]) {
            this.groupListeners[groupId].forEach((listener) =>
            listener(this.deviceGroups.find(group => group.id === groupId)?.devices ?? []));
        }
    }
}

// Export the singleton instance
const devicesManager = DevicesManager.getInstance();
export default devicesManager;
