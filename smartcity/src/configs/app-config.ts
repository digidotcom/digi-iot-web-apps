import { Bounce, ToastPosition, Theme } from 'react-toastify';

import { APP_PREFIX } from '@configs/app-constants';
import { GROUP_BUSES, BUSES_TYPES, BUSES_ALERTS, BUSES_STREAMS } from '@configs/buses-config';
import { IAlert } from '@customTypes/alert-types';
import { IoTMarkerImage } from '@customTypes/device-types';
import { AppMonitorDef } from '@customTypes/monitor-types';

// Base path.
export const BASE_PATH = process.env.BASE_PATH || '';

// Groups.
export const APP_GROUPS: string[] = [
    GROUP_BUSES
];

// Types.
export const APP_TYPES: string[] = [
    ...BUSES_TYPES
];

// Alerts.
export const APP_ALERTS: IAlert[] = [
    ...BUSES_ALERTS
];

// Streams.
export const APP_STREAMS: string[] = [
    ...BUSES_STREAMS
];

// Data requests.
export const MESSAGE_REQUEST_TARGET = "display-msg";
export const MESSAGE_REQUEST_SRC = "iot-demo";

// Data samples.
export const DEFAULT_SAMPLES_NUMBER = 50;

// Default device icon.
export const DEFAULT_FA_ICON = "fa-solid fa-microchip";

// Default device marker.
export const DEFAULT_MARKER_IMAGE: IoTMarkerImage = {
    connected: "/images/marker_device_connected.png",
    disconnected: "/images/marker_device_disconnected.png",
    maintenance: "/images/marker_device_connected_maint.png"
}

// Application paths.
export const ROUTES_PATH = "/data/routes/";

// Milliseconds to wait before attempting a new DRM request when throttle error is reached.
export const THROTTLE_ERROR_DELAY = 5000;

// Monitors.
export const MONITOR_ALERTS = "alerts";
export const MONITOR_DEVICES = "devices";
export const MONITOR_DATA_POINTS = "dataPoints";

export const APP_MONITORS: AppMonitorDef[] = [
    {
        id: MONITOR_ALERTS,
        description: `${APP_PREFIX} - Alerts`,
        topics: ["alert_status"],
        schema: `[
                    {{#each this}}
                        {{#if @index}},{{/if}}
                        {
                            "id": {{alert_status.id}},
                            "device_name": "{{alert_status.device_name}}",
                            "group": "{{alert_status.group}}",
                            "source": "{{alert_status.source}}",
                            "status": "{{alert_status.status}}",
                            "last_update": "{{alert_status.last_update}}"
                        }
                    {{/each}}
                ]`,
        batchDuration: 10,
        batchSize: 10
    },
    {
        id: MONITOR_DEVICES,
        topics: [`[group=${APP_GROUPS.join(",")}]devices`],
        description: `${APP_PREFIX} - Devices`,
        schema: `[
                    {{#each this}}
                        {{#if @index}},{{/if}}
                        {
                            "id": "{{device.id}}",
                            "name": "{{device.name}}",
                            "type": "{{device.type}}",
                            "group": "{{device.group}}",
                            "status": "{{device.connection_status}}",
                            "last_update": "{{device.last_update}}",
                            {{#if device.geoposition.coordinates}}
                                "location": {{device.geoposition.coordinates}},
                            {{/if}}
                            "maintenance": "{{device.in_maintenance_window}}",
                            "alerts": "{{device.alerts}}"
                        }
                    {{/each}}
                ]`,
        batchDuration: 10,
        batchSize: 15
    },
    {
        id: MONITOR_DATA_POINTS,
        topics: ["DataPoint"],
        description: `${APP_PREFIX} - DataPoints`,
        schema: `[${APP_STREAMS.map(stream => (`
                    {{#eachFiltered this}}
                        {{#endsWith DataPoint.streamId "${stream}"}}
                            {
                                "stream": "{{DataPoint.streamId}}",
                                "group": "{{group}}",
                                "value": "{{DataPoint.data}}",
                                "timestamp": {{DataPoint.timestamp}}
                            },
                        {{/endsWith}}
                    {{/eachFiltered}}`)).join('')}
                    {"end": 1}]`,
        batchDuration: 15,
        batchSize: 100
    }
]

// Toastify configuration.
export const TOAST_CONFIG = {
    position: "top-right" as ToastPosition,
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: "colored" as Theme,
    transition: Bounce
}