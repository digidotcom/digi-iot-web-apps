/*
 * Copyright 2022, Digi International Inc.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

// Constants.
const CLASS_ADD_SENSOR_BUTTON_DISABLED = "add-sensor-button-disabled";
const CLASS_ADD_SENSOR_FIELD_ERROR = "add-sensor-field-error";
const CLASS_ADD_SENSOR_STATUS_ONLINE = "add-sensor-device-online";
const CLASS_ADD_SENSOR_STATUS_OFFLINE = "add-sensor-device-offline";
const CLASS_SENSOR_DATA_GREEN = "sensor-widget-value-green";
const CLASS_SENSOR_LOADING_PANEL = "xbee-sensor-loading";
const CLASS_SENSOR_LOADING_HIDE = "xbee-sensor-loading-hide";
const CLASS_SENSOR_ID_REFRESH_BUTTON = "fa-sync-alt";

const ERROR_ADD_NULL_SENSOR_DEVICE = "Could not add sensor, the XBee Cellular device of sensor was not defined.";
const ERROR_ADD_NULL_SENSOR_NAME = "Could not add sensor, sensor name was not defined.";
const ERROR_ADD_NULL_SENSOR_TYPE = "Could not add sensor, sensor type was not defined.";
const ERROR_NAME_EMPTY = "You must specify a name for the sensor.";
const ERROR_DEVICE_EMPTY = "You must select an XBee Cellular device from the list.";
const ERROR_TYPE_EMPTY = "You must specify the type of sensor.";

const FONT_FIT_FACTOR_UNITS_H = 0.1;  // Obtained through empirical tests.
const FONT_FIT_FACTOR_VALUE_H = 0.22; // Obtained through empirical tests.
const FONT_FIT_FACTOR_UNITS_V = 0.15; // Obtained through empirical tests.
const FONT_FIT_FACTOR_VALUE_V = 0.3;  // Obtained through empirical tests.

const ID_ADD_SENSOR_BUTTON = "add_sensor_button";
const ID_ADD_SENSOR_BUTTON_DIALOG = "add_sensor_button_dialog";
const ID_ADD_SENSOR_DEVICE = "add_sensor_device";
const ID_ADD_SENSOR_DIALOG = "add_sensor_dialog";
const ID_ADD_SENSOR_ERROR = "add_sensor_error";
const ID_ADD_SENSOR_NAME = "add_sensor_name";
const ID_ADD_SENSOR_TYPE = "add_sensor_type";
const ID_DASHBOARD = "dashboard";
const ID_DATA_STREAMS = "data_streams";
const ID_REFRESH_BUTTON = "refresh_sensors_button";
const ID_READ_DEVICES = "read_devices";
const ID_READ_SENSOR_TYPES = "read_sensor_types";
const ID_SENSOR_CODE = "sensor_code";
const ID_SENSOR_DEVICE = "sensor_device";
const ID_SENSOR_NAME = "sensor_code";
const ID_STREAM = "stream";
const ID_TYPE = "type";
const ID_VALUE = "value";
const ID_XBEE_SENSOR_PROMPT = "xbee_sensor_prompt";

const MESSAGE_ADDING_SENSOR = "Adding sensor...";
const MESSAGE_LOADING_DATA = "Loading data...";

const TEMPLATE_SENSOR = "" +
    "<div class='xbee-sensor'>" +
    "    <div class='xbee-sensor-header'>" +
    "        <div class='fas fa-info-circle xbee-sensor-button xbee-sensor-button-left' onclick='showSensorInfo(\"{0}\")'></div>" +
    "        <div class='fas fa-sync-alt xbee-sensor-button' style='left: 34px' onclick='refreshSensor(\"{0}\")'></div>" +
    "        <div class='xbee-sensor-title'>{1}</div>" +
    "        <div class='fas fa-times xbee-sensor-button xbee-sensor-button-right' onclick='closeSensor(\"{0}\")'></div>" +
    "    </div>" +
    "    <div class='xbee-sensor-widget'>" +
    "        {2}" +
    "    </div>" +
    "    <div class='xbee-sensor-loading xbee-sensor-loading-hide'>" +
    "        <img class='popup-item' src='/static_files/images/loading.gif' alt='Loading...' />" +
    "        <div class='popup-text'>Refreshing data...</div>" +
    "    </div>" +
    "</div>";
const TEMPLATE_SENSOR_ID = "{0}-{1}";

const XBEE_SENSOR_CLASSES = ["col-sm-6",
                             "col-md-6",
                             "col-lg-4",
                             "col-xl-3",
                             "xbee-sensor-box"];

// Variables.
var dialogDevicesLoaded = false;
var dialogSensorTypesLoaded = false;

var sensorDevice;
var sensorName;
var sensorType;
var sensorTypeList;

var sensorsList = new Map();

var dataPointsSocket;

// Shows/hides the "Add sensor" dialog.
function showAddSensorDialog(visible) {
    // Initialize variables.
    var addSensorDialogElement = document.getElementById(ID_ADD_SENSOR_DIALOG);
    var addSensorErrorElement = document.getElementById(ID_ADD_SENSOR_ERROR);
    var addSensorButtonDialogElement = document.getElementById(ID_ADD_SENSOR_BUTTON_DIALOG);
    // Enable/Disable the refresh button of the toolbar.
    document.getElementById(ID_REFRESH_BUTTON).disabled = visible;
    // Enable/Disable the 'Add sensor' button of the toolbar.
    document.getElementById(ID_ADD_SENSOR_BUTTON).disabled = visible;
    // Initialize error label.
    addSensorErrorElement.innerHTML = "&nbsp;";
    addSensorErrorElement.style.visibility = "hidden";
    // Disable the 'Add sensor' button of the dialog.
    if (!addSensorButtonDialogElement.classList.contains(CLASS_ADD_SENSOR_BUTTON_DISABLED))
        addSensorButtonDialogElement.classList.add(CLASS_ADD_SENSOR_BUTTON_DISABLED);
    // Apply visible state to the dialog.
    if (visible) {
        addSensorDialogElement.style.visibility = "visible";
        resetDialog();
        loadDialogData();
    } else {
        addSensorDialogElement.style.visibility = "hidden";
    }
}

// Returns whether the 'Add sensor' dialog is open or not.
function isSensorDialogShowing() {
    // Initialize variables.
    var addSensorDialogElement = document.getElementById(ID_ADD_SENSOR_DIALOG);
    if (addSensorDialogElement == null)
        return false
    // Return whether the dialog is showing or not.
    return addSensorDialogElement.style.visibility == "visible";
}

// Closes the 'Add sensor' dialog.
function closeSensorDialog() {
    showAddSensorDialog(false);
}

// Loads the dialog data.
function loadDialogData() {
    // Reset dialog data loaded var.
    dialogDevicesLoaded = false;
    dialogSensorTypesLoaded = false;
    // Show loading dialog.
    showLoadingPopup(true, MESSAGE_LOADING_DATA);
    listDevices();
    listSensorTypes();
}

// Lists XBee Cellular devices from DRM.
function listDevices() {
    // Send the request.
    $.post(
        "../ajax/get_devices",
        function(data) {
            // Hide the loading panel.
            if (dialogSensorTypesLoaded)
                showLoadingPopup(false);
            dialogDevicesLoaded = true;
            // Process answer.
            processListDevicesAnswer(data);
            // Validate the dialog.
            validateDialog();
        }
    ).fail(function(response) {
        // Hide the loading panel.
        if (dialogSensorTypesLoaded)
            showLoadingPopup(false);
        dialogDevicesLoaded = true;
        // Process error.
        processAjaxErrorResponse(response);
        // Validate the dialog.
        validateDialog();
    });
}

// Processes the answer of the list devices request.
function processListDevicesAnswer(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        // Do not continue.
        return;
    }
    // Get the devices from the JSON response.
    let readDevices = response[ID_READ_DEVICES];
    // Check if the list of devices contains any device.
    if (readDevices == null || readDevices.length == 0) {
        return;
    }
    // Process devices.
    var sensorDeviceElement = document.getElementById(ID_ADD_SENSOR_DEVICE);
    for (let device of readDevices) {
        // Add sensor type to the proper combo box.
        var opt = document.createElement('option');
        if (device.online)
            opt.classList.add(CLASS_ADD_SENSOR_STATUS_OFFLINE);
        else
            opt.classList.add(CLASS_ADD_SENSOR_STATUS_OFFLINE);
        opt.value = device.device_id;
        opt.innerHTML = device.device_id;
        sensorDeviceElement.appendChild(opt);
    }
}

// Lists XBee sensor types.
function listSensorTypes() {
    // Send the request.
    $.post(
        "../ajax/get_sensor_types",
        function(data) {
            // Hide the loading panel.
            if (dialogDevicesLoaded)
                showLoadingPopup(false);
            dialogSensorTypesLoaded = true;
            // Process answer.
            processListSensorTypesAnswer(data);
            // Validate the dialog.
            validateDialog();
        }
    ).fail(function(response) {
        // Hide the loading panel.
        if (dialogDevicesLoaded)
            showLoadingPopup(false);
        dialogSensorTypesLoaded = true;
        // Process error.
        processAjaxErrorResponse(response);
        // Validate the dialog.
        validateDialog();
    });
}

// Processes the answer of the list devices request.
function processListSensorTypesAnswer(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        // Do not continue.
        return;
    }
    // Get the sensor types from the JSON response.
    let readSensorTypes = response[ID_READ_SENSOR_TYPES];
    // Check if the list of sensor types contains any sensor.
    if (readSensorTypes == null || readSensorTypes.length == 0) {
        return;
    }
    // Save the list of sensors.
    sensorTypeList = readSensorTypes;
    // Process sensor types.
    var sensorTypeElement = document.getElementById(ID_ADD_SENSOR_TYPE);
    for (let sensor of readSensorTypes) {
        // Add sensor type to the proper combo box.
        var opt = document.createElement('option');
        opt.value = sensor.code;
        opt.innerHTML = sensor.name;
        sensorTypeElement.appendChild(opt);
    }
}

// Validates the 'Add sensor' dialog.
function validateDialog() {
    // Initialize variables.
    var error = null;
    var sensorNameElement = document.getElementById(ID_ADD_SENSOR_NAME);
    var sensorDeviceElement = document.getElementById(ID_ADD_SENSOR_DEVICE);
    var sensorTypeElement = document.getElementById(ID_ADD_SENSOR_TYPE);
    var addSensorErrorElement = document.getElementById(ID_ADD_SENSOR_ERROR);
    var addSensorButtonElement = document.getElementById(ID_ADD_SENSOR_BUTTON_DIALOG);
    // Check name field.
    if (sensorNameElement.value == null || sensorNameElement.value.length == 0) {
        if (!sensorNameElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
            sensorNameElement.classList.add(CLASS_ADD_SENSOR_FIELD_ERROR);
        error = ERROR_NAME_EMPTY;
    } else if (sensorNameElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR)) {
        sensorNameElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    }
    // Check device field.
    if (sensorDeviceElement.value == null) {
        if (!sensorDeviceElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
            sensorDeviceElement.classList.add(CLASS_ADD_SENSOR_FIELD_ERROR);
        error = ERROR_DEVICE_EMPTY;
    } else if (sensorDeviceElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR)) {
        sensorDeviceElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    }
    // Check sensor type field.
    if (sensorTypeElement.value == null) {
        if (!sensorTypeElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
            sensorTypeElement.classList.add(CLASS_ADD_SENSOR_FIELD_ERROR);
        error = ERROR_TYPE_EMPTY;
    } else if (sensorTypeElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR)) {
        sensorTypeElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    }
    // Update controls.
    if (error == null) {
        addSensorErrorElement.innerHTML = "&nbsp;";
        addSensorErrorElement.style.visibility = "hidden";
        if (addSensorButtonElement.classList.contains(CLASS_ADD_SENSOR_BUTTON_DISABLED))
            addSensorButtonElement.classList.remove(CLASS_ADD_SENSOR_BUTTON_DISABLED);
    } else {
        addSensorErrorElement.innerHTML = error;
        addSensorErrorElement.style.visibility = "visible";
        if (!addSensorButtonElement.classList.contains(CLASS_ADD_SENSOR_BUTTON_DISABLED))
            addSensorButtonElement.classList.add(CLASS_ADD_SENSOR_BUTTON_DISABLED);
    }
    // Configure sensor parameters.
    sensorName = sensorNameElement.value;
    sensorDevice = sensorDeviceElement.value;
    sensorType = getSensor(sensorTypeElement.value);
}

// Resets the 'Add sensor' dialog.
function resetDialog() {
    // Reset sensor parameters.
    sensorName = null;
    sensorDevice = null;
    sensorType = null;
    // Get dialog elements.
    var sensorNameElement = document.getElementById(ID_ADD_SENSOR_NAME);
    var sensorDeviceElement = document.getElementById(ID_ADD_SENSOR_DEVICE);
    var sensorTypeElement = document.getElementById(ID_ADD_SENSOR_TYPE);
    var addSensorErrorElement = document.getElementById(ID_ADD_SENSOR_ERROR);
    // Reset styles.
    if (sensorNameElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
        sensorNameElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    if (sensorDeviceElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
        sensorDeviceElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    if (sensorTypeElement.classList.contains(CLASS_ADD_SENSOR_FIELD_ERROR))
        sensorTypeElement.classList.remove(CLASS_ADD_SENSOR_FIELD_ERROR);
    // Reset error.
    addSensorErrorElement.innerHTML = "&nbsp;";
    addSensorErrorElement.style.visibility = "hidden";
    // Reset elements.
    sensorNameElement.value = "";
    var i, L = sensorDeviceElement.options.length - 1;
    for (i = L; i >= 0; i--)
        sensorDeviceElement.remove(i);
    var i, L = sensorTypeElement.options.length - 1;
    for (i = L; i >= 0; i--)
        sensorTypeElement.remove(i);
}

// Adds a sensor to the dashboard.
function addSensor() {
    // Display the loading popup.
    showLoadingPopup(true, MESSAGE_ADDING_SENSOR);
    closeSensorDialog();
    // Verify that all sensor parameters are set.
    var errorMessage = null;
    if (sensorName == null)
        errorMessage = ERROR_ADD_NULL_SENSOR_NAME;
    else if (sensorDevice == null)
        errorMessage = ERROR_ADD_NULL_SENSOR_DEVICE;
    else if (sensorType == null)
        errorMessage = ERROR_ADD_NULL_SENSOR_TYPE;
    if (errorMessage != null) {
        toastr.error(errorMessage);
        showLoadingPopup(false);
        return;
    }
    // Generate an ID for the sensor.
    var sensorID = TEMPLATE_SENSOR_ID.format(sensorDevice, sensorType.code);
    // Generate the sensor div element.
    var newSensorDiv = document.createElement("div");
    newSensorDiv.id = sensorID;
    // Add the sensor classes to the new div.
    for (let sensorClass of XBEE_SENSOR_CLASSES)
        newSensorDiv.classList.add(sensorClass);
    // Get the specific widget code.
    var widgetCode = sensorType.html_widget.format(sensorDevice);
    newSensorDiv.innerHTML = TEMPLATE_SENSOR.format(sensorID, sensorName, widgetCode);
    // Add the sensor element to the dashboard.
    var dashboardElement = document.getElementById(ID_DASHBOARD);
    var xbeeSensorPromptElement = document.getElementById(ID_XBEE_SENSOR_PROMPT);
    xbeeSensorPromptElement.before(newSensorDiv)
    // Save sensor data.
    sensorsList.set(sensorID, {[ID_SENSOR_NAME]: sensorName,
                               [ID_SENSOR_CODE]: sensorType.code,
                               [ID_SENSOR_DEVICE]: sensorDevice,
                               [ID_DATA_STREAMS]: sensorType.streams.map(ds => "{0}/{1}".format(sensorDevice, ds))})
    // Apply font fit factor to values and units.
    applyFontFitToSensors();
    // Close the loading popup.
    showLoadingPopup(false);
    // Refresh sensor values.
    refreshSensor(sensorID);
    // Refresh DataPoints monitor.
    refreshDataPointsMonitor();
}

// Returns the XBee sensor corresponding to the provided code.
function getSensor(sensorCode) {
    if (sensorTypeList == null || sensorTypeList.length === 0)
        return null;
    for (let sensor of sensorTypeList) {
        if (sensor.code.toString() === sensorCode)
            return sensor;
    }
    return null;
}

// Applies the font fit mechanism to all sensors.
function applyFontFitToSensors() {
    $(".sensor-widget-value-h").map(function() {
        jQuery(this).fitText(FONT_FIT_FACTOR_VALUE_H);
    });
    $(".sensor-widget-value-v").map(function() {
        jQuery(this).fitText(FONT_FIT_FACTOR_VALUE_V);
    });
    $(".sensor-widget-units-h").map(function() {
        jQuery(this).fitText(FONT_FIT_FACTOR_UNITS_H);
    })
    $(".sensor-widget-units-v").map(function() {
        jQuery(this).fitText(FONT_FIT_FACTOR_UNITS_V);
    })
}

// Removes the sensor with the given ID from the dashboard.
function closeSensor(sensorID) {
    var dashboardElement = document.getElementById(ID_DASHBOARD);
    if (dashboardElement == null)
        return;
    var sensorElement = document.getElementById(sensorID);
    if (sensorElement != null)
        dashboardElement.removeChild(sensorElement);
    sensorsList.delete(sensorID);
    // Refresh DataPoints monitor.
    refreshDataPointsMonitor();
}

// Refreshes the values of the sensor with the given ID.
function refreshSensor(sensorID) {
    // Disable the refresh all sensors button.
    enableRefreshAllSensorsButton(false);
    // Show the loading panel of the sensor.
    showSensorLoadingPopup(sensorID, true);
    // Send the request.
    var dataStreams = getSensorStreams(sensorID);
    $.post(
        "../ajax/get_data_streams",
        JSON.stringify({
            [ID_DATA_STREAMS]: dataStreams
        }),
        function(data) {
            // Hide the loading panel.
            showSensorLoadingPopup(sensorID, false);
            // Enable the refresh all sensors button.
            if (!isSensorDialogShowing())
                enableRefreshAllSensorsButton(true);
            // Process answer.
            processDataStreamsAnswer(data);
        }
    ).fail(function(response) {
        // Hide the loading panel.
        showSensorLoadingPopup(sensorID, false);
        // Enable the refresh all sensors button.
        if (!isSensorDialogShowing())
            enableRefreshAllSensorsButton(true);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Refreshes the values of all the sensors.
function refreshSensors() {
    var sensorIDs = Array.from(sensorsList.keys());
    var dataStreams = [];
    // Disable the refresh button from all sensors.
    for (sensorID of sensorIDs) {
        dataStreams.push.apply(dataStreams, sensorsList.get(sensorID).data_streams.map(st => st));
        showSensorLoadingPopup(sensorID, true);
        enableRefreshSensorButton(sensorID, false);
    }
    // Disable the refresh all sensors button.
    enableRefreshAllSensorsButton(false);
    $.post(
        "../ajax/get_data_streams",
        JSON.stringify({
            [ID_DATA_STREAMS]: dataStreams
        }),
        function(data) {
            // Hide the loading panel.
            for (sensorID of sensorIDs) {
                showSensorLoadingPopup(sensorID, false);
                enableRefreshSensorButton(sensorID, true);
            }
            // Enable the refresh all sensors button.
            if (!isSensorDialogShowing())
                enableRefreshAllSensorsButton(true);
            // Process answer.
            processDataStreamsAnswer(data);
        }
    ).fail(function(response) {
        // Hide the loading panel.
        for (sensorID of sensorIDs) {
            showSensorLoadingPopup(sensorID, false);
            enableRefreshSensorButton(sensorID, true);
        }
        // Enable the refresh all sensors button.
        if (!isSensorDialogShowing())
            enableRefreshAllSensorsButton(true);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Shows or hides the loading panel of the given sensor.
function showSensorLoadingPopup(sensorID, show) {
    var sensorElement = document.getElementById(sensorID);
    if (sensorElement == null)
        return;
    var sensorLoadingElement = sensorElement.getElementsByClassName(CLASS_SENSOR_LOADING_PANEL)[0];
    if (sensorLoadingElement == null)
        return;
    if (show && sensorLoadingElement.classList.contains(CLASS_SENSOR_LOADING_HIDE))
        sensorLoadingElement.classList.remove(CLASS_SENSOR_LOADING_HIDE);
    else if (!show && !sensorLoadingElement.classList.contains(CLASS_SENSOR_LOADING_HIDE))
        sensorLoadingElement.classList.add(CLASS_SENSOR_LOADING_HIDE);
}

// Returns the list of streams of the given sensor.
function getSensorStreams(sensorID) {
    if (sensorsList.get(sensorID) != null)
        return sensorsList.get(sensorID)[ID_DATA_STREAMS];
    return null;
}

// Enables or disables the refresh button of the given sensor.
function enableRefreshSensorButton(sensorID, enable) {
    var sensorElement = document.getElementById(sensorID);
    if (sensorElement == null)
        return;
    var sensorRefreshButtonElement = sensorElement.getElementsByClassName(CLASS_SENSOR_ID_REFRESH_BUTTON)[0];
    if (sensorRefreshButtonElement == null)
        return;
    sensorRefreshButtonElement.disabled = !enable;
}

// Enables or disables the refresh all sensors button.
function enableRefreshAllSensorsButton(enable) {
    document.getElementById(ID_REFRESH_BUTTON).disabled = !enable;
}

// Processes the data streams answer.
function processDataStreamsAnswer(data) {
    for (const [key, value] of Object.entries(data.data_streams))
        applyDataStream(key, value);
}

// Applies the data stream to the corresponding HTML element.
function applyDataStream(streamID, value) {
    // Sanity checks.
    if (streamID == null || value == null)
        return;
    var sensorDataElement = document.getElementById(streamID);
    if (sensorDataElement == null)
        return;
    if (sensorDataElement.innerHTML === value)
        return;
    // Apply value highlighting the HTML control.
    sensorDataElement.innerHTML = value;
    if (!sensorDataElement.classList.contains(CLASS_SENSOR_DATA_GREEN))
        sensorDataElement.classList.add(CLASS_SENSOR_DATA_GREEN);
    setTimeout( function() {
        if (sensorDataElement.classList.contains(CLASS_SENSOR_DATA_GREEN))
            sensorDataElement.classList.remove(CLASS_SENSOR_DATA_GREEN);
    }, 500);
}

// Subscribes to any datapoint change.
function subscribeDataPoints() {
    // Sanity checks.
    if (dataPointsSocket != null)
        return;
    var dataStreams = getAllDataStreams();
    if (dataStreams.length == 0)
        return;
    // Create the web socket.
    var socketPrefix = window.location.protocol == "https:" ? "wss" : "ws";
    dataPointsSocket = new WebSocket(socketPrefix + "://" + window.location.host + "/ws/datapoints/");
    // Define the callback to be notified when data is received in the web socket.
    dataPointsSocket.onmessage = function(e) {
        // Initialize variables.
        var event = JSON.parse(e.data);
        // Check if the message contains an error.
        if (event[ID_TYPE] != null && event[ID_TYPE] === ID_ERROR && event[ID_ERROR] != null && event[ID_ERROR]) {
            toastr.error(event[ID_ERROR]);
            return;
        }
        // Update the dataStream value.
        applyDataStream(event[ID_STREAM], event[ID_VALUE]);
    };
    // Send list of data streams to the web socket.
    dataPointsSocket.onopen = function(e) {
        dataPointsSocket.send(JSON.stringify(dataStreams));
    }
}

// Closes the data points socket.
function unsubscribeDataPointsSocket() {
    if (dataPointsSocket != null) {
        dataPointsSocket.close();
        dataPointsSocket = null;
    }
}

// Returns a list with the data streams of all the sensors.
function getAllDataStreams() {
    var dataStreams = []
    var sensorIDs = Array.from(sensorsList.keys());
    for (sensorID of sensorIDs) {
        var sensorStreams = getSensorStreams(sensorID);
        if (sensorStreams == null || sensorStreams.length == 0)
            continue;
        dataStreams.push.apply(dataStreams, sensorStreams);
    }
    return dataStreams;
}

// Refreshes the DataPoints monitor.
function refreshDataPointsMonitor() {
    // Close old datapoints monitor.
    unsubscribeDataPointsSocket();
    // Add a new datapoints monitor.
    subscribeDataPoints();
}