export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'Monitor';

export type BodyFunction = (as: 'object' | 'stream' | 'text' | boolean) => Promise<any>;

export interface CommonParams {
    size?: number;
    orderby?: string;
    query?: string;
    cursor?: string;
    start_time?: string;
    end_time?: string;
}

export interface QueryMetadata extends CommonParams {
    [key: string]: string | number | boolean | string[] | number[] | boolean[] | undefined
}

export interface RestRequest {
    url: string;
    method: Method;
    params?: QueryMetadata | Record<string, any>;
    headers?: Record<string, string>;
    body?: string | object;
}

export interface RestResponse {
    status: number;
    statusText: string;
    headers: Record<string, string | string[]>;
    body: BodyFunction;
}