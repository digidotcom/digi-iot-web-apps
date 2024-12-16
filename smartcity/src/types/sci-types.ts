export interface DeviceRequest {
    payload?: any;
    targetName: string;
}

export interface SCIRequestParams {
    operation: string;
    deviceIds: string | string[];
    options?: string;
    source?: string;
}

export interface SCIRequestParamsWithHeaders {
    headers?: Record<string, string>;
    [key: string]: any;
}

export interface SCIResponse {
    body: (parse: boolean) => Promise<string>;
    timingPhases?: any;
}