export class AppError extends Error {
    public status: number;
    public details?: any;

    constructor(message: string, status: number = 500, details?: any) {
        super(message);
        this.name = this.constructor.name; // Assign class name to the error's name property
        this.status = status; // HTTP status code or custom status code
        this.details = details; // Additional error details
        Error.captureStackTrace(this, this.constructor); // Capture stack trace
    }
}