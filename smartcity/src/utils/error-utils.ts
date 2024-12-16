import xml2js from 'xml2js';

import HttpError from "@models/HttpError";
import { AppError } from '@models/AppError';
import { XML2JS_OPTIONS } from "@utils/xml-utils";

export const ERROR_BODY_UNDEFINED = "Response body is undefined";

// Overloaded function signatures
export function newAppError(message: string): AppError;
export function newAppError(message: string, status: number): AppError;
export function newAppError(message: string, status: number, error: Error | HttpError): AppError;
export function newAppError(message: string, error: Error | HttpError): AppError;

/**
 * Creates and returns an AppError with the given information.
 * 
 * The error is logged if a logger is provided.
 * 
 * @param message Message for the error.
 * @param status Error status.
 * @param error Error that originated the error.
 * 
 * @returns The generated {@link AppError}.
 */
export function newAppError(message: string, statusOrError?: number | Error | HttpError, error?: Error | HttpError): AppError {
    let status: number = 500; // Default status
    let finalError: Error | HttpError | undefined;
    let appError: AppError;
    let errorMessage = message;

    // Determine if the second argument is status or error
    if (typeof statusOrError === 'number') {
        status = statusOrError;
    } else if (statusOrError instanceof Error || statusOrError instanceof HttpError) {
        finalError = statusOrError;
    }

    // Assign the third argument (if present) to finalError
    if (error instanceof Error) {
        finalError = error;
    }

    // Generate the error.
    if (finalError instanceof AppError) {
        errorMessage = finalError.message ? `${message}: ${finalError.message}` : message;
        appError = new AppError(errorMessage, status, finalError.details);
    } else if (finalError instanceof HttpError) {
        status = finalError.status;
        errorMessage = `${message}: ${finalError.statusText}`;
        appError = new AppError(errorMessage, status, finalError.data);
    } else if (finalError) {
        errorMessage = `${message}: ${finalError.message ? finalError.message : "Unknown error"}`;
        appError = new AppError(errorMessage, status, finalError);
    } else {
        appError = new AppError(errorMessage, status);
    }

    return appError;
};

/**
 * Handles an unknown error and returns it as an HttpError instance.
 *
 * @param error - The unknown error object to handle.
 *
 * @returns An HttpError object representing the handled error.
 */
export function handleHttpError(error: unknown): HttpError {
    if (error instanceof HttpError) {
        return error;
    }
    if (error instanceof Error) {
        return { status: 500, statusText: error.message, data: null };
    }
    return { status: 500, statusText: JSON.stringify(error), data: null };
};

/**
 * Parses an XML error response and converts it into an `HttpError` object.
 *
 * @param responseBody - The XML response body to be parsed.
 * 
 * @returns An `HttpError` object if an error is found in the response, `null` otherwise.
 */
export function parseXMLError(responseBody: string): HttpError | null {
    let httpError: HttpError | null = null;

    xml2js.parseString(responseBody, XML2JS_OPTIONS, (err, result) => {
        const errObj = { status: 500, statusText: 'Internal server error', data: result };

        if (err) {
            errObj.data = err;
            httpError = new HttpError(errObj);
        } else if (result.error?.desc) {
            errObj.statusText = result.error.desc;
            httpError = new HttpError(errObj);
        } else if (result.sci_reply?.error) {
            errObj.statusText = result.sci_reply.error;
            httpError = new HttpError(errObj);
        } else if (result.sci_reply?.file_system?.error) {
            errObj.statusText = result.sci_reply.file_system.error;
            httpError = new HttpError(errObj);
        } else if (result.sci_reply?.send_message?.device?.error) {
            errObj.data = [result.sci_reply.send_message.device];
            errObj.statusText = result.sci_reply.send_message.device.error.desc;
            httpError = new HttpError(errObj);
        } else if (result.sci_reply?.send_message?.device?.length) {
            errObj.data = result.sci_reply.send_message.device.filter((device: any) => device.error);
            errObj.statusText = 'One or more devices failed to receive the message';
            httpError = new HttpError(errObj);
        }
    });

    return httpError;
}