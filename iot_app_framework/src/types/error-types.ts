/**
 * Interface representing an HTTP error data.
 */
export interface HttpErrorData {
    list?: { error_message: string }[];
    error_message?: string;
    error_status?: number;
}

/**
 * Interface representing an error response.
 */
export interface ErrorResponse {
    status: number;
    statusText?: string;
    data?: HttpErrorData;
}