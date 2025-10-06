import { ALERT_PARAMS_TYPE_NUMERIC, ALERT_PARAMS_TYPE_STRING, ALERT_PARAMS_UNIT_MINUTES, ALERT_PARAMS_UNIT_SECONDS, ALERT_SCOPE_TYPE_GROUP, ALERT_SCOPE_TYPE_RESOURCE, ALERT_TYPE_DATAPOINT, ALERT_TYPE_DEVICE_OFFLINE, ALERT_TYPE_MISSING_DATAPOINT, APP_PREFIX } from '@configs/app-constants';
import { ColorStyles } from '@configs/style-constants';import { IAlert } from '@customTypes/alert-types';
import { IoTDevicePropertyDef, IoTMarkerImage } from '@customTypes/device-types';

// Group name.
export const GROUP_BUSES = "Buses";

// Device types.
export const TYPE_BUS = "bus";

export const BUSES_TYPES = [
    TYPE_BUS
];

// Device icon.
export const BUS_FA_ICON = "fa-solid fa-bus-simple";

// Device marker.
export const BUS_MARKER_IMAGE: IoTMarkerImage = {
    connected: "/images/marker_bus_connected.png",
    disconnected: "/images/marker_bus_disconnected.png",
    maintenance: "/images/marker_bus_connected_maint.png",
    incidence: "/images/marker_bus_incidence.png"
}

// Streams.
const STREAM_LINE = "line";
const STREAM_PASSENGERS = "passengers";
const STREAM_PRESSURE = "pressure";
const STREAM_TEMPERATURE = "temperature";
const STREAM_POWER_LEVEL = "power_level";
const STREAM_INCIDENCE = "incidence";

export const BUSES_STREAMS: string[] = [
    STREAM_LINE,
    STREAM_PASSENGERS,
    STREAM_PRESSURE,
    STREAM_TEMPERATURE,
    STREAM_POWER_LEVEL,
    STREAM_INCIDENCE
];

// Properties.
export const BUS_PROPERTY_LINE = "line";
export const BUS_PROPERTY_PASSENGERS = "passengers";
export const BUS_PROPERTY_POWER = "power";
export const BUS_PROPERTY_PRESSURE = "pressure";
export const BUS_PROPERTY_TEMPERATURE = "temperature";
export const BUS_PROPERTY_INCIDENCE = "incidence";

export const BUSES_PROPERTIES: IoTDevicePropertyDef[] = [
    {
        id: BUS_PROPERTY_PASSENGERS,
        name: "Number of passengers",
        stream: STREAM_PASSENGERS,
        faIcon: "fa-solid fa-user",
        color: "#3D71AF",
        units: "PAX"
    },
    {
        id: BUS_PROPERTY_POWER,
        name: "Power level",
        stream: STREAM_POWER_LEVEL,
        faIcon: "fa-solid fa-battery-half",
        color: "#99562C"
    },
    {
        id: BUS_PROPERTY_PRESSURE,
        name: "Tire pressure",
        stream: STREAM_PRESSURE,
        faIcon: "fa-solid fa-gauge",
        color: "#287732"
    },
    {
        id: BUS_PROPERTY_TEMPERATURE,
        name: "Engine temperature",
        stream: STREAM_TEMPERATURE,
        faIcon: "fa-solid fa-temperature-three-quarters",
        color: "#6B3A8D"
    },
    {
        id: BUS_PROPERTY_LINE,
        name: "Line",
        stream: STREAM_LINE,
        faIcon: "fa-solid fa-route",
        color: "#fc6f03"
    },
    {
        id: BUS_PROPERTY_INCIDENCE,
        name: "Incidence",
        stream: STREAM_INCIDENCE,
        faIcon: "fa-solid fa-exclamation-triangle",
        color: ColorStyles.warningYellow,
        visible: false
    },
]

// Alerts.
const ALERT_TRESHOLD_TEMPERATURE = "100";
const ALERT_TRESHOLD_PRESSURE = "7.5";
const ALERT_TRESHOLD_POWER_LEVEL = "20";
const ALERT_TRESHOLD_INCIDENCE = "0";

const ALERT_TIMEOUT_DATAPOINTS_SECS = "1";
const ALERT_TIMEOUT_OFFLINE_MINS = "1";
const ALERT_TIMEOUT_MISSING_DP_MINS = "30";

const ALERT_BUS_TEMPERATURE: IAlert = {
    name: "Engine temperature high",
    description: APP_PREFIX,
    type: ALERT_TYPE_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: `*/${STREAM_TEMPERATURE}`
    },
    fire: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_TEMPERATURE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: ">",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    },
    reset: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_TEMPERATURE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: "<=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    }
};

const ALERT_BUS_PRESSURE: IAlert = {
    name: "Tire pressure low",
    description: APP_PREFIX,
    type: ALERT_TYPE_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: `*/${STREAM_PRESSURE}`
    },
    fire: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_PRESSURE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: ">",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    },
    reset: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_PRESSURE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: "<=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    }
};

const ALERT_BUS_POWER_LEVEL: IAlert = {
    name: "Power level low",
    description: APP_PREFIX,
    type: ALERT_TYPE_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: `*/${STREAM_POWER_LEVEL}`
    },
    fire: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_POWER_LEVEL,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: ">",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    },
    reset: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_POWER_LEVEL,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: "<=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    }
};

const ALERT_BUS_OUT_OF_ROUTE: IAlert = {
    name: "Bus out of route",
    description: APP_PREFIX,
    type: ALERT_TYPE_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: "*/management/events/in_maintenance_window"
    },
    fire: {
        disabled: false,
        parameters: {
            thresholdValue: "{\"status\":\"true\"}",
            type: ALERT_PARAMS_TYPE_STRING,
            operator: "=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    },
    reset: {
        disabled: false,
        parameters: {
            thresholdValue: "{\"status\":\"false\"}",
            type: ALERT_PARAMS_TYPE_STRING,
            operator: "=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    }
};

const ALERT_BUS_MISSING_LOCATION: IAlert = {
    name: "Missing bus location",
    description: APP_PREFIX,
    type: ALERT_TYPE_MISSING_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: "*/metrics/sys/location"
    },
    fire: {
        disabled: false,
        parameters: {
            readingTimeUnit: ALERT_PARAMS_UNIT_MINUTES,
            uploadTimeUnit: ALERT_PARAMS_UNIT_MINUTES,
            uploadInterval: ALERT_TIMEOUT_MISSING_DP_MINS,
            readingInterval: ALERT_TIMEOUT_MISSING_DP_MINS
        }
    },
    reset: {
        disabled: false
    }
};

const ALERT_BUS_OFFLINE: IAlert = {
    name: "Bus offline",
    description: APP_PREFIX,
    type: ALERT_TYPE_DEVICE_OFFLINE,
    scope: {
        type: ALERT_SCOPE_TYPE_GROUP,
        value: GROUP_BUSES
    },
    fire: {
        disabled: false,
        parameters: {
            reconnectWindowDuration: ALERT_TIMEOUT_OFFLINE_MINS
        }
    },
    reset: {
        disabled: false
    }
};

const ALERT_BUS_INCIDENCE: IAlert = {
    name: "Bus incidence",
    description: APP_PREFIX,
    type: ALERT_TYPE_DATAPOINT,
    scope: {
        type: ALERT_SCOPE_TYPE_RESOURCE,
        value: `*/${STREAM_INCIDENCE}`
    },
    fire: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_INCIDENCE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: "<>",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    },
    reset: {
        disabled: false,
        parameters: {
            thresholdValue: ALERT_TRESHOLD_INCIDENCE,
            type: ALERT_PARAMS_TYPE_NUMERIC,
            operator: "=",
            timeout: ALERT_TIMEOUT_DATAPOINTS_SECS,
            timeUnit: ALERT_PARAMS_UNIT_SECONDS
        }
    }
};

export const BUSES_ALERTS: IAlert[] = [
    ALERT_BUS_TEMPERATURE,
    ALERT_BUS_PRESSURE,
    ALERT_BUS_POWER_LEVEL,
    ALERT_BUS_OUT_OF_ROUTE,
    ALERT_BUS_MISSING_LOCATION,
    ALERT_BUS_OFFLINE,
    ALERT_BUS_INCIDENCE
];