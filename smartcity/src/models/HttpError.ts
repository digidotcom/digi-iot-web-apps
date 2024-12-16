import { HttpErrorData, ErrorResponse } from '@customTypes/error-types';

export class HttpError {
    status: number;
    statusText: string;
    data: HttpErrorData | null;

    constructor(error: ErrorResponse | null) {
        this.status = 500;
        this.statusText = 'Unknown error';
        this.data = null;

        if (!error) {
            this.statusText = 'No response received';
        } else {
            const { data, status, statusText }: ErrorResponse = error;
            if (data) {
                if (data.list && Array.isArray(data.list)) {
                    const errorMessages = data.list
                        .filter((item) => item.error_message)
                        .map((item) => item.error_message);

                    this.statusText = errorMessages.join(', ');
                } else {
                    this.statusText = data?.error_message || statusText || this.statusText;
                }
                this.data = data;
                this.status = data.error_status || status;
            } else {
                this.status = error.status;
                this.statusText = error.statusText || this.statusText;
            }
        }
    }
}

export default HttpError;
