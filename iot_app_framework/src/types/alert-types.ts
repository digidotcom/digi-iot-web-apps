/**
 * Interface representing an Alert definition in the v1/alerts APIs.
 */
export interface IAlert {
    id?: number | string;
    customer_id?: number;
    type: string;
    name?: string;
    description?: string;
    enabled?: boolean;
    priority?: string;
    scope: {
        type: string;
        value?: string;
    };
    fire?: {
        parameters?: {
            disconnectCount?: string;
            disconnectWindow?: string;
            thresholdValue?: string;
            type?: string;
            operator?: string;
            timeout?: string;
            timeUnit?: string;
            svcId?: string;
            unit?: string;
            metric?: string;
            readingTimeUnit?: string;
            uploadTimeUnit?: string;
            uploadInterval?: string;
            readingInterval?: string;
            reconnectWindowDuration?: string;
        };
        disabled: boolean;
    };
    reset?: {
        parameters?: {
            reconnectWindow?: string;
            thresholdValue?: string;
            type?: string;
            operator?: string;
            timeout?: string;
            timeUnit?: string;
        };
        disabled: boolean;
    }
}

/**
 * Interface representing an Alert Summary in the v1/alerts APIs.
 */
export interface IAlertSummary {
    customer_id?: number;
    id: number;
    enabled?: boolean;
    description?: string;
    last_update?: string;
    maintenance_mode?: string;
    name?: string;
    notes?: string;
    priority?: string;
    serial_number?: string;
    public_ip?: string;
    ip?: string;
    group?: string;
    firmware_version?: string;
    severity?: string;
    source?: string;
    status?: string;
    type?: string;
    device_name?: string;
}
