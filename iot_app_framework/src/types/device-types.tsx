import { IoTDevice } from '@models/IoTDevice';

/**
 * Interface representing a device in the v1/devices APIs.
 */
export interface IDevice {
    id: string;
    device_id: string;
    customer_id: number;
    name?: string;
    description?: string;
    type: string;
    vendor_id?: number;
    firmware_id?: string;
    firmware_version?: string;
    product_id?: string;
    ip?: string;
    iccid?: string;
    iccid2?: string;
    apn?: string;
    apn2?: string;
    public_ip?: string;
    group?: string;
    serial_number?: string;
    cellular_modem_version?: string;
    cellular_modem2_version?: string;
    cellular_modem_id?: string;
    cellular_modem2_id?: string;
    phone_number?: string;
    phone_number2?: string;
    maintenance_mode?: string;
    in_maintenance_window: string;
    capabilities: Record<string, boolean>;
    connection_status: 'connected' | 'disconnected';
    authenticated_connection?: boolean;
    health_status?: 'normal' | 'error' | string;
    compliant?: 'yes' | 'no' | string;
    connection_type?: string;
    geoposition?: {
        coordinates: [number, number];
    };
    last_connect: string;
    last_disconnect?: string;
    last_disconnect_reason?: string;
    last_update?: string;
    last_compliant?: string;
    last_noncompliant?: string;
    ipsec_status?: string;
    ipsec_status2?: string;
    ipsec_status3?: string;
    ipsec_status4?: string;
    mac?: string;
    last_config_name?: string;
    last_sm_udp_check_in?: string;
    registration_date?: string;
    sku?: string;
    tags?: string[];
    notes?: string;
}

/**
 * Interface representing a IoT device.
 */
export interface IoTDeviceInterface {
    id: string;
    name: string;
    type: string;
    group: string;
    connected: boolean;
    maintenance: boolean;
    position?: google.maps.LatLngLiteral;
    lastUpdate: Date;
    incidence?: boolean;
    incidenceDate?: Date;
}

/**
 * Interface representing a marker image.
 */
export interface IoTMarkerImage {
    connected: string;
    disconnected: string;
    maintenance: string;
    incidence: string;
}

/**
 * Interface representing a property.
 */
export interface IoTDeviceProperty {
    id: string;
    name: string;
    value: string;
    lastUpdate?: Date;
    units?: string;
    faIcon?: string;
    stream: string;
    color?: string;
    samplesHistory?: IoTSample[];
    samplesHistoryRead: boolean;
    visible: boolean;
}

/**
 * Interface representing a property definition.
 */
export interface IoTDevicePropertyDef {
    id: string;
    name: string;
    stream: string;
    faIcon?: string;
    color?: string;
    units?: string;
    visible?: boolean;
}

/**
 * Interface representing a data sample.
 */
export interface IoTSample {
    value: string;
    timeStamp: Date;
}

/**
 * Interface representing a route.
 */
export interface IoTRoute {
    id: string;
    name: string;
    coordinates: [];
    types: string[];
    color: string;
}

/**
 * Interface representing a group of devices.
 */
export interface IoTDevicesGroup {
    id: string;
    devices: IoTDevice[];
}
