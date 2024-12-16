/**
 * Interface representing a Template in the v1/configs APIs.
 */
export interface ITemplate {
    id: number;
    customer_id?: number;
    created?: string;
    last_update?: string;
    name: string;
    vendor_id: number;
    type: string;
    firmware_version: string;
    description: string;
    product_id?: string;
    firmware_id?: string;
    enabled?: boolean;
    alert?: boolean;
    remediate?: boolean;
    device_fileset?: string;
    groups?: Array<string>;
    on_remediate?: {
        reboot: boolean;
        automation_name?: string
    };
    on_scan?: {
        automation_name?: string
    };
    on_success?: {
        automation_name?: string
    };
    scan_settings?: boolean;
    scan_files?: boolean;
    scan_python?: boolean;
    scan_frequency: string;
    xbee_profile?: string;
    retry_on_disconnect?: number;
    maintenance_window_handling?: string
    last_scan?: string;
}

/**
 * Interface representing a new Template in the v1/configs APIs.
 */
export interface INewTemplate {
    name: string;
    description?: string;
    groups: string[];
    vendor_id: number;
    type: string;
    firmware_version: string;
    maintenance_window_handling?: string;
    scan_frequency: string;
    enabled: boolean;
    device_fileset?: string;
    alert?: boolean;
    remediate?: boolean;
}

/**
 * Interface representing an updated Template in the v1/configs APIs.
 */
export interface IUpdateTemplate {
    name?: string;
    description?: string;
    groups?: string[];
    maintenance_window_handling?: string;
    scan_frequency?: string;
    enabled?: boolean;
    device_fileset?: string;
    scan_files?: boolean;
}
