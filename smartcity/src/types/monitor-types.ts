/**
 * Interface representing a Monitor in the v1/monitors APIs.
 */
export interface IMonitor {
    [key: string]: undefined | boolean | number | string | string[];
    status: string;
    id: number
    customer_id: number;
    type: string;
    persistent: boolean;
    topics: string[];
    method: string;
    format: string;
    url: string;
    last_connect: string;
    last_sent: string;
    description: string;
    batch_duration: number;
    batch_size: number;
    compression: string;
    auth_token: string;
    auth_token_set: boolean;
    auth_token_set_by_user: boolean;
    headers?: string[];
    schema_type: string;
    schema: string;
    last_sent_uuid: string;
    connect_timeout: number;
    response_timeout: number;
    acknowledgement: string;
}

/**
 * Interface representing a new Monitor in the v1/monitors APIs.
 */
export interface INewMonitor {
    type: string;
    topics: string[];
    description?: string;
    format?: string;
    persistent?: boolean;
    batch_duration?: number;
    batch_size?: number;
    schema_type?: string;
    schema?: string;
};

/**
 * Interface representing an application monitor.
 */
export interface AppMonitor {
    id: string;
    monID: number;
    topics: string[];
    reader?: ReadableStreamDefaultReader;
    callbacks: Array<(data?: object, error?: string) => void>;
}

/**
 * Interface representing an application monitor definition.
 */
export interface AppMonitorDef {
    id: string;
    description?: string;
    topics: string[];
    schema?: string;
    batchDuration?: number;
    batchSize?: number;
}

/**
 * Interface representing a devices monitor sample definition.
 */
export interface DevicesMonitorSample {
    id: string;
    name: string;
    type: string;
    group?: string;
    status: string;
    last_update: string;
    location?: [number, number];
    maintenance: string;
    alerts: number;
}

/**
 * Interface representing a DataPoint monitor sample definition.
 */
export interface DataPointMonitorSample {
    stream: string;
    group: string;
    value: string;
    timestamp: Date;
}