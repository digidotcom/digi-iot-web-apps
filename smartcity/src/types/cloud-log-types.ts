import { Method, QueryMetadata } from "@customTypes/query-types";

/**
 * Interface representing an entry of the cloud log.
 */
export interface CloudLogItem {
    id?: number;
    method: Method;
    url: string;
    fullUrl?: string;
    params?: QueryMetadata | Record<string, any>;
    status: number;
    time: Date;
    requestBody?: string;
    requestType?: string;
    responseBody?: string;
    responseType?: string;
}

/**
 * Callback used to be notified when a new cloud log item is recorded.
 */
export type CloudLogCallback = (item: CloudLogItem) => void;