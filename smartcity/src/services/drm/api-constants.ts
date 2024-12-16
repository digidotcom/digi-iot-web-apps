const ALARMS_STATUS = '/ws/AlarmStatus';
const ALERTS_INVENTORY = '/ws/v1/alerts/inventory';
const ALERTS_SUMMARY = '/ws/v1/alerts/summary';
const DEVICE_INVENTORY = '/ws/v1/devices/inventory';
const FILES_INVENTORY = '/ws/v1/files/inventory';
const FIRMWARE_INVENTORY = '/ws/v1/firmware/inventory';
const MONITORS_INVENTORY = '/ws/v1/monitors/inventory';
const REPORTS = '/ws/v1/reports'
const REPORTS_CONNECTION_STATUS = REPORTS + '/devices/connection_status';
const REPORTS_MAINTENANCE_WINDOW = REPORTS + '/devices/maintenance_window';
const REPORTS_VENDOR_ID_DEVICE_TYPE = REPORTS + '/devices/vendor_id_and_type';
const STREAMS_HISTORY = '/ws/v1/streams/history';
const STREAMS_INVENTORY = '/ws/v1/streams/inventory';
const TEMPLATES_INVENTORY = '/ws/v1/configs/inventory';

export {
    ALARMS_STATUS,
    ALERTS_INVENTORY,
    ALERTS_SUMMARY,
    DEVICE_INVENTORY,
    FILES_INVENTORY,
    FIRMWARE_INVENTORY,
    MONITORS_INVENTORY,
    REPORTS_CONNECTION_STATUS,
    REPORTS_MAINTENANCE_WINDOW,
    REPORTS_VENDOR_ID_DEVICE_TYPE,
    STREAMS_HISTORY,
    STREAMS_INVENTORY,
    TEMPLATES_INVENTORY,
};
