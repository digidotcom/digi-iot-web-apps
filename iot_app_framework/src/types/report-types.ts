/**
 * Interface representing a Device Summary Status report in the v1/reports/devices/connection_status API.
 */
export interface DevicesSummaryStatus {
    value: string;
    count: number;
}

/**
 * Interface representing a Vendor ID and Type report in the v1/reports/devices/vendor_id_and_type API.
 */
export interface VendorIdAndType {
    values: {
        vendor_id: string;
        type: string;
    };
    count: number;
}