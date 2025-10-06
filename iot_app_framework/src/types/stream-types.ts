/**
 * Interface representing an Stream in the v1/streams APIs.
 */
export interface IStream {
    customer_id: number;
    stream_id: string;
    id: string;
    device_id?: string;
    type?: string;
    description?: string;
    units?: string;
    ttl?: number;
    rollup_ttl?: number;
    last_update?: string;
    forwards?: string[];
    history_uri?: string;
    timestamp?: Date;
    server_timestamp?: Date;
    value?: string;
}

/**
 * Interface representing a Data Point in the v1/streams APIs.
 */
export interface IDataPoint {
    id: string;
    stream_id: string;
    value: string;
    timestamp: Date;
    server_timestamp: Date;
    quality: number;
}