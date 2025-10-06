import { BASE_PATH } from '@configs/app-config';
import { STATUS_ERROR, STATUS_LOADED, STATUS_LOADING, STATUS_NOT_LOADED } from '@configs/app-constants';
import { TYPE_BUS } from '@configs/buses-config';
import { BusLine } from '@customTypes/bus-types';
import { IoTRoute } from '@customTypes/device-types';
import { AppError } from '@models/AppError';
import { newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

// Variables.
const log = logLevel.getLogger('routes-manager');

class RoutesManager {
    // Variables.
    private static instance: RoutesManager;

    private _routes: IoTRoute[] = [];
    private statusListeners: ((status: string) => void)[] = [];
    private routeListeners: ((routes: IoTRoute[]) => void)[] = [];
    private _status: string = STATUS_NOT_LOADED;
    private _errorMessage: string | undefined = undefined;

    // Private constructor to ensure singleton pattern
    private constructor() {}

    // Public method to get the singleton instance
    public static getInstance(): RoutesManager {
        if (!RoutesManager.instance) {
            RoutesManager.instance = new RoutesManager();
        }
        return RoutesManager.instance;
    }

    // Getter for status.
    get status(): string {
        return this._status;
    }

    // Getter for error message.
    get errorMessage(): string | undefined {
        return this._errorMessage;
    }

    // Getter for devices.
    get routes(): IoTRoute[] | undefined {
        return this._routes;
    }

    /**
     * Initialize the RoutesManager by reading the routes.
     * 
     * @throws An {@link AppError} if there is any error initializing routes.
     */
    public async initialize(): Promise<void> {
        // Sanity check.
        if (this.status === STATUS_LOADED || this.status === STATUS_LOADING) {
            return;
        }

        // Update status.
        this.notifyStatusListeners(STATUS_LOADING);
        this._errorMessage = undefined;

        try {
            const response = await fetch(`${BASE_PATH}/api/routes`);
            if (!response.ok) {
                throw new Error('Failed to fetch routes from API');
            }
            const loadedRoutes = await response.json();
            this.parseRoutes(loadedRoutes);
            // Update status.
            this.notifyStatusListeners(STATUS_LOADED);
            // Notify listeners.
            this.notifyRouteListeners();
        } catch (error) {
            const appError = newAppError("Error loading routes", error as any);
            log.error(appError.message);
            // Update status.
            this._errorMessage = appError.message;
            this.notifyStatusListeners(STATUS_ERROR);
        }
    }

    /**
     * Parses and adds routes to the internal list.
     *
     * @param routes Array of route objects to be parsed.
     */
    private parseRoutes(routes: any[]) {
        routes.forEach(route => {
            // Create the base route object.
            let iotRoute: IoTRoute = {
                id: route.id,
                name: route.name,
                types: route.types,
                color: route.color,
                coordinates: route.coordinates,
            };
            // Route-specific properties.
            if (route.types.includes(TYPE_BUS)) {
                iotRoute = {
                    ...iotRoute,
                    number: route.number,
                    start: route.start,
                    stop: route.stop,
                    maxBuses: route.max_buses,
                    stops: route.stops
                } as BusLine;
            }
            // Add route to the list.
            this._routes.push(iotRoute);
        });
    }

    /**
     * Clears the list of routes.
     */
    clear() {
        // Remove all routes.
        this._routes = [];
        // Notify listeners.
        this.notifyRouteListeners();
        // Update status.
        this.notifyStatusListeners(STATUS_NOT_LOADED);
    }

    /**
     * Adds a listener for status changes.
     *
     * @param listener The function to be called with the status update.
     */
    subscribeStatus(listener: (status: string) => void) {
        this.statusListeners.push(listener);
    }

    /**
     * Adds a listener for routes list changes.
     *
     * @param listener The function to be called when the routes list changes.
     */
    subscribeRoutes(listener: (devices: IoTRoute[]) => void) {
        this.routeListeners.push(listener);
    }
    /**
     * Removes a listener from the status listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeStatus(listener: (status: string) => void) {
        this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    }

    /**
     * Removes a listener from the reoutes listeners list.
     *
     * @param listener The listener function to be removed.
     */
    unsubscribeRoutes(listener: (devices: IoTRoute[]) => void) {
        this.routeListeners = this.routeListeners.filter((l) => l !== listener);
    }

    /**
     * Sets the given status and notifies it to all status listeners.
     *
     * @param newStatus The new status to set and notify.
     */
    private notifyStatusListeners(newStatus: string) {
        this._status = newStatus;
        this.statusListeners.forEach((listener) => listener(this._status));
    }

    /**
     * Notifies all route listeners of a change in the routes list.
     */
    private notifyRouteListeners() {
        this.routeListeners.forEach((listener) => listener(this._routes ?? []));
    }
}

// Export the singleton instance
const devicesManager = RoutesManager.getInstance();
export default devicesManager;
