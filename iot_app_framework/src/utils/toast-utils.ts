import { toast } from 'react-toastify';

/**
 * Displays an error notification with a custom message.
 * 
 * @param message The error message to display.
 * @param duration Duration (in ms) for the toast to auto-close.
 * @param args Additional toast options.
 */
export const showError = (message: string, duration?: number, args?: {}) => {
    toast.error(message, {autoClose: duration, ...args});
}

/**
 * Displays a success notification with a custom message.
 * 
 * @param message The success message to display.
 * @param duration Duration (in ms) for the toast to auto-close.
 * @param args Additional toast options.
 */
export const showSuccess = (message: string, duration?: number, args?: {}) => {
    toast.success(message, {autoClose: duration, ...args});
}

/**
 * Displays a warning notification with a custom message.
 * 
 * @param message The warning message to display.
 * @param duration Duration (in ms) for the toast to auto-close.
 * @param args Additional toast options.
 */
export const showWarning = (message: string, duration?: number, args?: {}) => {
    toast.warn(message, {autoClose: duration, ...args});
}

/**
 * Displays an information notification with a custom message.
 * 
 * @param message The information message to display.
 * @param duration Duration (in ms) for the toast to auto-close.
 * @param args Additional toast options.
 */
export const showInfo = (message: string, duration?: number, args?: {}) => {
    toast.info(message, {autoClose: duration, ...args});
}