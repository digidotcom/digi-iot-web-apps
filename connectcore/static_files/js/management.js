/*
 * Copyright 2022, 2023, Digi International Inc.
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
const ID_REBOOT_BUTTON = "reboot_button";
const ID_CANCEL_FIRMWARE_UPDATE_BUTTON = "cancel_update_firmware_button";
const ID_FILESET_ITEMS_CONTAINER = "fileset_items_container";
const ID_FIRMWARE_TAB_FILESET = "firmware_tab_fileset";
const ID_FIRMWARE_TAB_FILESET_HEADER = "firmware_tab_fileset_header";
const ID_FIRMWARE_TAB_REPOSITORY = "firmware_tab_repository";
const ID_FIRMWARE_TAB_REPOSITORY_HEADER = "firmware_tab_repository_header";
const ID_FIRMWARE_TAB_UPLOAD = "firmware_tab_upload";
const ID_FIRMWARE_TAB_UPLOAD_HEADER = "firmware_tab_upload_header";
const ID_FIRMWARE_PRODUCTION_FIELD = "fw_production";
const ID_FIRMWARE_RELEASE_NOTES_FIELD = "fw_release_notes";
const ID_FIRMWARE_RELEASE_NOTES_ERROR_FIELD = "fw_release_notes_error";
const ID_FIRMWARE_SECURITY_FIELD = "fw_security";
const ID_FIRMWARE_VERSION_FIELD = "fw_version";
const ID_FIRMWARE_VERSION_ERROR_FIELD = "fw_version_error";
const ID_NUM_SAMPLES_UPLOAD_ERROR = "samples_buffer_error";
const ID_REPOSITORY_ITEMS_CONTAINER = "repository_items_container";
const ID_SAMPLE_RATE_ERROR = "sample_rate_error";
const ID_SAVE_BUTTON = "save_button";
const ID_SELECT_FIRMWARE_BUTTON = "select_firmware_button";
const ID_UPDATE_FIRMWARE_BUTTON = "update_firmware_button";
const ID_UPDATE_FIRMWARE_FILE = "firmware_file";
const ID_UPDATE_FIRMWARE_FILE_LABEL = "firmware_file_label";
const ID_UPDATE_FIRMWARE_PROGRESS = "update_firmware_progress";
const ID_UPDATE_FIRMWARE_PROGRESS_BAR = "update_firmware_progress_bar";
const ID_UPDATE_FIRMWARE_PROGRESS_MESSAGE = "update_firmware_progress_message";
const ID_UPDATE_FIRMWARE_PROGRESS_TITLE = "update_firmware_progress_title";
const ID_UPDATE_RUNNING = "update_running";
const ID_UPLOAD_FIRMWARE_FILESET = "fileset_fw_file";
const ID_UPLOAD_FIRMWARE_FILESET_BUTTON = "upload_fileset_button";

const CLASS_FIRMWARE_TAB = "firmware-tab";
const CLASS_FIRMWARE_TAB_HEADER = "firmware-tab-header";
const CLASS_FIRMWARE_TAB_HEADER_ACTIVE = "firmware-tab-header-active";
const CLASS_FILESET_ENTRY_NAME = "fileset-entry-name";
const CLASS_FILESET_ENTRY_PATH = "fileset-entry-path";
const CLASS_FILESET_ENTRY_SELECTED = "fileset-entry-selected";
const CLASS_MANAGEMENT_BUTTON_DISABLED = "management-button-disabled";
const CLASS_PROGRESS_BAR_ERROR = "update-firmware-progress-bar-error";
const CLASS_PROGRESS_BAR_INFO = "update-firmware-progress-bar-info";
const CLASS_PROGRESS_BAR_SUCCESS = "update-firmware-progress-bar-success";
const CLASS_REPOSITORY_ENTRY_VERSION = "repository-entry-version";
const CLASS_REPOSITORY_ENTRY_SELECTED = "repository-entry-selected";

const ERROR_FIELD_FW_RELEASE_NOTES = "Release notes link must be a valid URL";
const ERROR_FIELD_FW_VERSION = "Enter a valid 4-part firmware version number";
const ERROR_FIELD_NUMBER = "Value must be a positive number";
const ERROR_FIELD_POSITIVE = "Value must be greater than 0";

const TITLE_CONFIRM_CANCEL_UPDATE = "Cancel firmware update";
const TITLE_CONFIRM_FIRMWARE_UPDATE = "Confirm firmware update";
const TITLE_CONFIRM_REBOOT = "Confirm reboot";
const TITLE_DEVICE_REBOOTING = "Device Rebooting";
const TITLE_FILE_UPLOAD_ERROR = "File upload failed!";
const TITLE_FILE_UPLOAD_IN_PROGRESS = "File upload in progress...";
const TITLE_FILE_UPLOAD_SUCCESS = "File upload succeeded!";
const TITLE_FIRMWARE_UPDATE_ERROR = "Firmware update failed!";
const TITLE_FIRMWARE_UPDATE_IN_PROGRESS = "Firmware update in progress...";
const TITLE_FIRMWARE_UPDATE_SUCCESS = "Firmware update succeeded!";

const MESSAGE_CANCELING_FIRMWARE_UPDATE = "Canceling firmware update...";
const MESSAGE_CHECKING_FIRMWARE_UPDATE_STATUS = "Checking firmware update...";
const MESSAGE_CONFIRM_CANCEL_UPDATE = "This action will cancel the ongoing firmware update process. Do you want to continue?";
const MESSAGE_CONFIRM_FIRMWARE_UPDATE = "This action will update the device firmware. Do you want to continue?";
const MESSAGE_CONFIRM_REBOOT = "This action will reboot the device and connection will be lost. Do you want to continue?";
const MESSAGE_DEVICE_REBOOTING = "The device is rebooting. Please wait...";
const MESSAGE_LOADING_INFORMATION = "Loading device information...";
const MESSAGE_LOADING_FILES = "Loading files...";
const MESSAGE_NO_FILE_SELECTED = "No file selected";
const MESSAGE_SAVING_SYSTEM_MONITOR = "Saving system monitor settings...";
const MESSAGE_SENDING_FIRMWARE_UPDATE_REQUEST = "Sending firmware update request...";
const MESSAGE_SENDING_REBOOT = "Sending reboot request...";
const MESSAGE_SENDING_UPLOAD_REQUEST = "Sending firmware upload request...";
const MESSAGE_SYSTEM_MONITOR_SAVED = "System monitor settings saved successfully";
const MESSAGE_UPLOAD_COMPLETE = "Firmware file upload complete";
const MESSAGE_UPDATING_FIRMWARE = "Updating firmware...";
const MESSAGE_UPLOADING_FIRMWARE = "Uploading firmware file...";

const REGEX_INTEGER = '^[0-9]+$';
const REGEX_FW_VERSION = '^([0-9]{1,3}\.){3}[0-9]{1,3}$';
const REGEX_URL = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

const UPDATE_ERROR = "error";
const UPDATE_INFO = "info";
const UPDATE_SUCCESS = "success";

const DEMO_FILE_SET = "ConnectCoreDemo";

const TEMPLATE_FILESET_FILE = "" +
    "<div id='file_{0}' class='fileset-entry' title='{1}' onclick='selectFilesetEntry(\"file_{2}\")'>" +
    "    <div class='fas fa-file fa-lg fileset-entry-icon'></div>" +
    "    <div class='fileset-entry-name'>{3}</div>" +
    "    <div class='fileset-entry-path'>{4}</div>" +
    "    <div class='fileset-entry-size'>{5}</div>" +
    "    <div class='fileset-entry-last-modified'>{6}</div>" +
    "</div>";

const TEMPLATE_REPOSITORY_FILE = "" +
    "<div id='file_{0}' class='repository-entry' title='{1}' onclick='selectRepositoryEntry(\"file_{2}\")'>" +
    "    <div class='fas fa-file fa-lg repository-entry-icon'></div>" +
    "    <div class='repository-entry-version'>{3}</div>" +
    "    <div class='fas {4} fa-lg repository-entry-production'></div>" +
    "    <div class='fas {5} fa-lg repository-entry-security'></div>" +
    "    <div class='repository-entry-name'>{6}</div>" +
    "    <div class='repository-entry-size'>{7}</div>" +
    "    <div class='repository-entry-info'><a href='{8}' target='_blank'>{9}</a></div>" +
    "</div>";

const FIRMWARE_UPDATE_CHECK_INTERVAL = 10000;

// Variables.
var readingManagementInfo = false;
var deviceRebooting = false;
var updatingFirmware = false;
var firmwareUpdateTimer = null;
var uploadProgressSocket = null;
var uploadFirmwareAjaxRequest = null;
var filesLoaded = false;
var fwLoaded = false;
var selectedFilesetEntry = null;
var selectedRepositoryEntry = null;

// Initializes the management page.
function initializeManagementPage() {
    // Sanity checks.
    if (!isManagementShowing())
        return;

    // Read management information.
    readDeviceInfoManagement();
}

// Gets the information of the device.
function readDeviceInfoManagement() {
    // Execute only in the management page.
    if (!isManagementShowing() || readingManagementInfo)
        return;
    // Unset device rebooting variable.
    deviceRebooting = false;
    // Flag reading variable.
    readingManagementInfo = true;
    // Hide the info popup.
    showInfoPopup(false);
    // Hide the firmware progress.
    showFirmwareUpdateProgress(false);
    // Show the loading popup.
    showLoadingPopup(true, MESSAGE_LOADING_INFORMATION);
    // Send request to retrieve device information.
    $.post(
        "../ajax/get_device_info",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            if (!isManagementShowing())
                return;
            // Process device information answer.
            processDeviceInfoManagementResponse(data);
        }
    ).fail(function(response) {
        // Flag reading variable.
        readingManagementInfo = false;
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide the loading panel.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the device info request.
function processDeviceInfoManagementResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Fill device info.
        fillDeviceInfo(response);
        // Read system monitor information.
        readSystemMonitorInfo();
    } else {
        readingManagementInfo = false;
        // Hide the loading panel.
        showLoadingPopup(false);
    }
}

// Gets the information of the system monitor.
function readSystemMonitorInfo() {
    // Execute only in the management page.
    if (!isManagementShowing())
        return;
    // Hide the info popup.
    showInfoPopup(false);
    // Show the loading popup.
    showLoadingPopup(true, MESSAGE_LOADING_INFORMATION);
    // Send request to retrieve device information.
    $.post(
        "../ajax/get_sample_rate",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            readingManagementInfo = false;
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide the loading panel.
            showLoadingPopup(false);
            // Process device information answer.
            processSystemMonitorInfoResponse(data);
        }
    ).fail(function(response) {
        // Flag reading variable.
        readingManagementInfo = false;
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide the loading panel.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the system monitor info request.
function processSystemMonitorInfoResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Fill system monitor info.
        fillSystemMonitorInfo(response);
        // Check if there is a firmware update running.
        checkFirmwareUpdateRunning();
    }
}

// Fills device information.
function fillDeviceInfo(deviceData) {
    // Set firmware version.
    updateFieldValue(ID_FW_VERSION, deviceData[ID_FW_VERSION]);
    // Set DEY version.
    updateFieldValue(ID_DEY_VERSION, deviceData[ID_DEY_VERSION]);
    // Set Kernel version.
    updateFieldValue(ID_KERNEL_VERSION, deviceData[ID_KERNEL_VERSION]);
    // Set U-Boot version.
    updateFieldValue(ID_UBOOT_VERSION, deviceData[ID_UBOOT_VERSION]);
}

// Fills system monitor information.
function fillSystemMonitorInfo(response) {
    // Initialize variables.
    var sampleRateInput = document.getElementById(ID_SAMPLE_RATE);
    var samplesBufferInput = document.getElementById(ID_NUM_SAMPLES_UPLOAD);
    // Set the sample rate.
    if (sampleRateInput != null && sampleRateInput != "undefined")
        sampleRateInput.value = response[ID_SAMPLE_RATE];
    // Set the number of samples to upload.
    if (samplesBufferInput != null && samplesBufferInput != "undefined")
        samplesBufferInput.value = response[ID_NUM_SAMPLES_UPLOAD];
    // Validate system monitor.
    validateSystemMonitor();
}

// Validates the system monitor values.
function validateSystemMonitor() {
    // Initialize vars.
    var saveButton = document.getElementById(ID_SAVE_BUTTON);
    var sampleRateValid = validateSystemMonitorField(ID_SAMPLE_RATE, ID_SAMPLE_RATE_ERROR);
    var samplesBufferValid = validateSystemMonitorField(ID_NUM_SAMPLES_UPLOAD, ID_NUM_SAMPLES_UPLOAD_ERROR);
    // Check errors.
    if (!sampleRateValid || !samplesBufferValid) {
        if (!saveButton.classList.contains(CLASS_CONFIG_BUTTON_DISABLED))
            saveButton.classList.add(CLASS_CONFIG_BUTTON_DISABLED);
    } else {
        if (saveButton.classList.contains(CLASS_CONFIG_BUTTON_DISABLED))
            saveButton.classList.remove(CLASS_CONFIG_BUTTON_DISABLED);
    }
}

// Validates the given system monitor field.
function validateSystemMonitorField(fieldID, errorID) {
    // Initialize vars.
    var field = document.getElementById(fieldID);
    var fieldError = document.getElementById(errorID);
    var valid = true;
    var error = "";
    // Sanity checks.
    if (field == null || fieldError == null)
        return false;
    // Check if value is valid.
    var value = field.value;
    if (value.length == 0) {
        valid = false;
        error = ERROR_FIELD_EMPTY;
    } else if (!value.match(REGEX_INTEGER)) {
        valid = false;
        error = ERROR_FIELD_NUMBER;
    } else if (parseInt(value) <= 0) {
        valid = false;
        error = ERROR_FIELD_POSITIVE;
    }
    updateControlsAfterValidation(valid, error, field, fieldError);

    return valid;
}

// Saves the system monitor settings.
function saveSystemMonitor() {
    // Initialize vars.
    var sampleRateInput = document.getElementById(ID_SAMPLE_RATE);
    var samplesBufferInput = document.getElementById(ID_NUM_SAMPLES_UPLOAD);
    // Sanity checks.
    if (sampleRateInput == null || samplesBufferInput == null)
        return;
    // Execute only in the management page.
    if (!isManagementShowing())
        return;
    // Hide the info popup.
    showInfoPopup(false);
    // Show the loading popup.
    showLoadingPopup(true, MESSAGE_SAVING_SYSTEM_MONITOR);
    // Send request to set system monitor settings.
    $.post(
        "../ajax/set_sample_rate",
        JSON.stringify({
            "device_id": getDeviceID(),
            "sample_rate": sampleRateInput.value,
            "num_samples_upload": samplesBufferInput.value
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide the loading panel.
            showLoadingPopup(false);
            // Process device information answer.
            processSaveSystemMonitorResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide the loading panel.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the save system monitor request response.
function processSaveSystemMonitorResponse(response) {
    if (!checkErrorResponse(response, false))
        toastr.success(MESSAGE_SYSTEM_MONITOR_SAVED);
}

// Asks the user to confirm the reboot action.
function askReboot() {
    showConfirmDialog(TITLE_CONFIRM_REBOOT, MESSAGE_CONFIRM_REBOOT,
        function() {
            // Execute the reboot.
            rebootDevice();
        },
        function() {
            // Do nothing.
        }
    );
}

// Reboots the device.
function rebootDevice() {
    // Hide the info popup.
    showInfoPopup(false);
    // Show the loading popup.
    showLoadingPopup(true, MESSAGE_SENDING_REBOOT);
    // Send request to reboot the device.
    $.post(
        "../ajax/reboot_device",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide the loading panel.
            showLoadingPopup(false);
            // Process reboot device answer.
            processRebootDeviceResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide the loading panel.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the reboot device request.
function processRebootDeviceResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Show info dialog.
        showInfoPopup(true, TITLE_DEVICE_REBOOTING, MESSAGE_DEVICE_REBOOTING);
        deviceRebooting = true;
        // TODO: This should not be necessary when implementing device connection monitor.
        prevDeviceConnectionStatus = false;
    }
}

// Opens the firmware file browser.
function openFirmwareBrowser(id) {
    document.getElementById(id).click();
}

// Reads the device status.
function firmwareFileChanged(id) {
    // Execute only in the management page.
    if (!isManagementShowing())
        return;

    var firmwareFileElement = document.getElementById(id);
    var firmwareFile = firmwareFileElement.files[0];
    var firmwareFileLabelElement;

    if (id == ID_UPDATE_FIRMWARE_FILE)
        firmwareFileLabelElement = document.getElementById(ID_UPDATE_FIRMWARE_FILE_LABEL);

    showFirmwareUpdateProgress(false);
    if (firmwareFileElement.files.length == 0) {
        if (id == ID_UPDATE_FIRMWARE_FILE)
            firmwareFileLabelElement.innerHTML = MESSAGE_NO_FILE_SELECTED;
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
        return;
    }

    if (id == ID_UPDATE_FIRMWARE_FILE)
        firmwareFileLabelElement.innerHTML = firmwareFile.name;

    var activeTab = getActiveFirmwareUpdateTab();
    if (activeTab == ID_FIRMWARE_TAB_UPLOAD)
        validateFwVersionInfo();
    else if (activeTab == ID_FIRMWARE_TAB_FILESET)
        uploadFirmwareFileToFileSet();
    else
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, true);
}

// Validates the firmware version information.
function validateFwVersionInfo() {
    var fwVersionValid = validateFwVersionField();
    var fwReleaseNotesValid = validateFwReleaseNotesField();
    var fwFileElement = document.getElementById(ID_UPDATE_FIRMWARE_FILE);

    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON,
                           fwVersionValid && fwReleaseNotesValid && fwFileElement.files.length > 0);
}

// Validates the firmware version field.
function validateFwVersionField() {
    var field = document.getElementById(ID_FIRMWARE_VERSION_FIELD);
    var fieldError = document.getElementById(ID_FIRMWARE_VERSION_ERROR_FIELD);
    var valid = true;
    var error = "";

    if (field == null || fieldError == null)
        return false;
    var value = field.value;
    if (value.length == 0) {
        valid = false;
        error = ERROR_FIELD_EMPTY;
    } else if (!value.match(REGEX_FW_VERSION)) {
        valid = false;
        error = ERROR_FIELD_FW_VERSION;
    }
    updateControlsAfterValidation(valid, error, field, fieldError);

    return valid;
}

// Validates the firmware release notes field.
function validateFwReleaseNotesField() {
    var field = document.getElementById(ID_FIRMWARE_RELEASE_NOTES_FIELD);
    var fieldError = document.getElementById(ID_FIRMWARE_RELEASE_NOTES_ERROR_FIELD);
    var valid = true;
    var error = "";

    if (field == null || fieldError == null)
        return false;
    var value = field.value;
    if (value.length == 0) {
        valid = false;
        error = ERROR_FIELD_EMPTY;
    } else if (!value.match(REGEX_URL)) {
        valid = false;
        error = ERROR_FIELD_FW_RELEASE_NOTES;
    }
    updateControlsAfterValidation(valid, error, field, fieldError);

    return valid;
}

function updateControlsAfterValidation(valid, error, field, fieldError) {
    if (valid) {
        if (field.classList.contains(CLASS_INPUT_ERROR))
            field.classList.remove(CLASS_INPUT_ERROR);
        fieldError.innerHTML = "&nbsp;";
        fieldError.style.display = "none";
    } else {
        if (!field.classList.contains(CLASS_INPUT_ERROR))
            field.classList.add(CLASS_INPUT_ERROR);
        fieldError.innerHTML = error;
        fieldError.style.display = "block";
    }
}

// Asks the user to confirm the firmware update action.
function askUpdateFirmware() {
    showConfirmDialog(TITLE_CONFIRM_FIRMWARE_UPDATE, MESSAGE_CONFIRM_FIRMWARE_UPDATE,
        function() {
            // Sanity checks.
            var activeTab = getActiveFirmwareUpdateTab();
            if (activeTab == null)
                return;
            // Flag updating variable.
            updatingFirmware = true;
            // Hide the info popup.
            showInfoPopup(false);
            // Hide the loading popup.
            showLoadingPopup(false);
            // Disable firmware update button.
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
            // Show progress bar.
            showFirmwareUpdateProgress(true);
            // Disable management page controls.
            enableManagementPageControls(false);
            // Enable cancel button.
            enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
            // Check active tab.
            if (activeTab == ID_FIRMWARE_TAB_UPLOAD) {
                // Upload firmware.
                uploadFirmwareFile();
            } else if (activeTab == ID_FIRMWARE_TAB_REPOSITORY) {
                // Build file path.
                var repoEntryElement = document.getElementById(selectedRepositoryEntry);
                var fwVersion = repoEntryElement.getElementsByClassName(CLASS_REPOSITORY_ENTRY_VERSION)[0].innerHTML;
                // Update firmware.
                updateFirmware(fwVersion);
            } else if (activeTab == ID_FIRMWARE_TAB_FILESET) {
                // Build file path.
                var filesetEntryElement = document.getElementById(selectedFilesetEntry);
                var fileName = filesetEntryElement.getElementsByClassName(CLASS_FILESET_ENTRY_NAME)[0].innerHTML;
                var filePath = filesetEntryElement.getElementsByClassName(CLASS_FILESET_ENTRY_PATH)[0].innerHTML;
                // Update firmware.
                updateFirmwareFromFileSet(DEMO_FILE_SET + "/" + filePath + "/" + fileName);
            }
        },
        function() {
            // Do nothing.
        }
    );
}

// Attempts to upload the given firmware file.
function uploadFirmwareFile() {
    // Initialize variables.
    var firmwareFileElement = document.getElementById(ID_UPDATE_FIRMWARE_FILE);
    var firmwareFile = firmwareFileElement.files[0];
    var fwVersion = document.getElementById(ID_FIRMWARE_VERSION_FIELD).value;
    var prodEnabled = document.getElementById(ID_FIRMWARE_PRODUCTION_FIELD).checked;
    var secMode = document.getElementById(ID_FIRMWARE_SECURITY_FIELD).value;
    var releaseNotes = document.getElementById(ID_FIRMWARE_RELEASE_NOTES_FIELD).value;

    // Update upload status.
    setFirmwareUpdateProgressInfo(0, MESSAGE_UPLOADING_FIRMWARE);
    // Prepare data.
    var formData = new FormData();
    formData.append("device_type", getDeviceName());
    formData.append("firmware_version", fwVersion);
    formData.append("production", prodEnabled);
    formData.append("deprecated", false);
    formData.append("security_related", secMode);
    formData.append("information_link", releaseNotes);
    formData.append("file_name", firmwareFile.name);
    formData.append("file", firmwareFile);
    // Register websocket to receive upload progress.
    subscribeUploadFileProgress(firmwareFile.name);
    // Send request
    uploadFirmwareAjaxRequest = $.ajax({
        type: 'POST',
        url: "../ajax/upload_firmware",
        data: formData,
        cache: false,
        async: true,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            // Reset request variable.
            uploadFirmwareAjaxRequest = null;
            // Close progress socket.
            if (uploadProgressSocket != null && uploadProgressSocket != "undefined")
                uploadProgressSocket.close();
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process answer.
            processUploadFirmwareFileResponse(response);
        },
        error: function(response) {
            // Reset request variable.
            uploadFirmwareAjaxRequest = null;
            // Close progress socket.
            if (uploadProgressSocket != null && uploadProgressSocket != "undefined")
                uploadProgressSocket.close();
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process error.
            error = processAjaxErrorResponse(response);
            // Update upload status.
            setFirmwareUpdateProgressError(error);
            // Flag updating variable.
            updatingFirmware = false;
            // Enable the management page controls.
            enableManagementPageControls(true);
        }
    });
}

// Processes the upload firmware file response.
function processUploadFirmwareFileResponse(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        error = getErrorFromResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Flag updating variable.
        updatingFirmware = false;
        // Enable the management page controls.
        enableManagementPageControls(true);
    } else {
        // Update upload status.
        setFirmwareUpdateProgressInfo(100, MESSAGE_UPLOAD_COMPLETE);
        updateFirmware(document.getElementById(ID_FIRMWARE_VERSION_FIELD).value);
    }
}

// Attempts to upload the given firmware file.
function uploadFirmwareFileToFileSet() {
    // Initialize variables.
    var firmwareFileElement = document.getElementById(ID_UPLOAD_FIRMWARE_FILESET);
    var firmwareFile = firmwareFileElement.files[0];

    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
    enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, false);
    showFirmwareUpdateProgress(true);
    enableManagementPageControls(false);

    // Update upload status.
    setFileUploadProgressInfo(0, MESSAGE_UPLOADING_FIRMWARE);
    // Prepare data.
    var formData = new FormData();
    formData.append("file_set", DEMO_FILE_SET);
    formData.append("path", getDeviceID());
    formData.append("file_name", firmwareFile.name);
    formData.append("file", firmwareFile);
    // Register websocket to receive upload progress.
    subscribeUploadFileProgress(firmwareFile.name);
    // Send request
    uploadFirmwareAjaxRequest = $.ajax({
        type: 'POST',
        url: "../ajax/upload_firmware_to_fileset",
        data: formData,
        cache: false,
        async: true,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            // Reset request variable.
            uploadFirmwareAjaxRequest = null;
            // Close progress socket.
            if (uploadProgressSocket != null && uploadProgressSocket != "undefined")
                uploadProgressSocket.close();
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process answer.
            processUploadFirmwareFileToFileSetResponse(response);
        },
        error: function(response) {
            // Reset request variable.
            uploadFirmwareAjaxRequest = null;
            // Close progress socket.
            if (uploadProgressSocket != null && uploadProgressSocket != "undefined")
                uploadProgressSocket.close();
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process error.
            error = processAjaxErrorResponse(response);
            // Update upload status.
            setFileUploadProgresssError(error);
            // Flag updating variable.
            updatingFirmware = false;
            // Enable the management page controls.
            enableManagementPageControls(true);
            showFirmwareUpdateProgress(false);
        }
    });
}

// Processes the upload firmware file response.
function processUploadFirmwareFileToFileSetResponse(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        error = getErrorFromResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Flag updating variable.
        updatingFirmware = false;
        // Enable the management page controls.
        enableManagementPageControls(true);
    } else {
        // Update upload status.
        setFileUploadProgressInfo(100, MESSAGE_UPLOAD_COMPLETE);
        showFirmwareUpdateProgress(false);
        enableManagementPageControls(true);
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, filesLoaded && selectedFilesetEntry != null);
        refreshFilesetFiles();
    }
}

// Subscribes to firmware update progress.
function subscribeUploadFileProgress(fileName) {
    // Create the web socket.
    var socketPrefix = window.location.protocol == "https:" ? "wss" : "ws";
    uploadProgressSocket = new WebSocket(socketPrefix + "://" + window.location.host + getAppPath() +  "ws/file_upload_progress/" + fileName);
    // Define the callback to be notified when firmware update progress is received.
    uploadProgressSocket.onmessage = function(e) {
        // Process only in the management page.
        if (!isManagementShowing()) {
            // Close the socket.
            uploadProgressSocket.close();
            return;
        }
        // Update progress.
        var data = JSON.parse(e.data);
        setFileUploadProgressInfo(data[ID_PROGRESS], MESSAGE_UPLOADING_FIRMWARE);
    }
}

// Updates the firmware of the device.
function updateFirmware(version) {
    // Update status.
    setFirmwareUpdateProgressInfo(0, MESSAGE_SENDING_UPLOAD_REQUEST);
    // Disable the cancel button.
    enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, false);
    // Send request to update the firmware.
    $.post(
        "../ajax/update_firmware",
        JSON.stringify({
            "device_id": getDeviceID(),
            "firmware_version": version
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process update firmware answer.
            processUpdateFirmwareResponse(data);
        }
    ).fail(function(response) {
        // Flag updating variable.
        updatingFirmware = false;
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Process error.
        error = processAjaxErrorResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Enable the management page controls.
        enableManagementPageControls(true);
    });
}

// Processes the response of the update firmware request.
function processUpdateFirmwareResponse(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        error = getErrorFromResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Flag updating variable.
        updatingFirmware = false;
        // Enable the page controls.
        enableManagementPageControls(true);
    } else {
        // Enable the cancel button.
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
        // Update progress status.
        setFirmwareUpdateProgressInfo(100, MESSAGE_SENDING_FIRMWARE_UPDATE_REQUEST);
        // Start timer to check firmware update status periodically.
        startFirmwareUpdateTimer();
        // Check first firmware update status in 2 seconds.
        window.setTimeout(function () {
            checkFirmwareUpdateStatus();
        }, 2000);
    }
}

// Updates the firmware of the device.
function updateFirmwareFromFileSet(filePath) {
    // Update status.
    setFirmwareUpdateProgressInfo(0, MESSAGE_SENDING_UPLOAD_REQUEST);
    // Disable the cancel button.
    enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, false);
    // Send request to update the firmware.
    $.post(
        "../ajax/update_firmware_from_fileset",
        JSON.stringify({
            "device_id": getDeviceID(),
            "file": filePath
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process update firmware answer.
            processUpdateFirmwareFromFileSetResponse(data);
        }
    ).fail(function(response) {
        // Flag updating variable.
        updatingFirmware = false;
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Process error.
        error = processAjaxErrorResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Enable the management page controls.
        enableManagementPageControls(true);
    });
}

// Processes the response of the update firmware request.
function processUpdateFirmwareFromFileSetResponse(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        error = getErrorFromResponse(response);
        // Update upload status.
        setFirmwareUpdateProgressError(error);
        // Flag updating variable.
        updatingFirmware = false;
        // Enable the page controls.
        enableManagementPageControls(true);
    } else {
        // Enable the cancel button.
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
        // Update progress status.
        setFirmwareUpdateProgressInfo(100, MESSAGE_SENDING_FIRMWARE_UPDATE_REQUEST);
        // Start timer to check firmware update status periodically.
        startFirmwareUpdateTimer();
        // Check first firmware update status in 2 seconds.
        window.setTimeout(function () {
            checkFirmwareUpdateStatus();
        }, 2000);
    }
}

// Starts a timer to check the firmware update status.
function startFirmwareUpdateTimer() {
    // Sanity checks
    if (!isManagementShowing() || firmwareUpdateTimer != null)
        return;
    // Start timer to check firmware update status.
    firmwareUpdateTimer = setInterval(checkFirmwareUpdateStatus, FIRMWARE_UPDATE_CHECK_INTERVAL);
}

// Stops the timer to check the firmware update status.
function stopFirmwareUpdateTimer() {
    // Stop timer.
    if (firmwareUpdateTimer != null && firmwareUpdateTimer != "undefined") {
        clearInterval(firmwareUpdateTimer);
        firmwareUpdateTimer = null;
    }
}

// Checks the firmware update status.
function checkFirmwareUpdateStatus() {
    // Sanity checks
    if (!isManagementShowing()) {
        // Stop timer.
        stopFirmwareUpdateTimer();
        return;
    }
    // Send request to check firmware update status.
    $.post(
        "../ajax/check_firmware_update_status",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process check firmware update status answer.
            processCheckFirmwareUpdateStatusResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the check firmware update status request.
function processCheckFirmwareUpdateStatusResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Check if the firmware update is running.
        if (response[ID_STATUS] == VALUE_ACTIVE) {
            // Check the firmware update progress.
            checkFirmwareUpdateProgress();
        } else if (response[ID_STATUS] == VALUE_FAILED || response[ID_STATUS] == VALUE_SUCCESSFUL || response[ID_STATUS] == VALUE_CANCELED) {
            // Stop timer.
            stopFirmwareUpdateTimer();
            // Flag the update variable.
            updatingFirmware = false;
            // Enable page controls.
            enableManagementPageControls(true);
            // Update the firmware update progress.
            if (response[ID_STATUS] == VALUE_FAILED || response[ID_STATUS] == VALUE_CANCELED)
                setFirmwareUpdateProgressError(ERROR_TITLE + ": " + response[ID_MESSAGE]);
            else {
                // Set update as successful.
                setFirmwareUpdateProgressSuccess(response[ID_MESSAGE]);
            }
        }
    }
}

// Checks if there is a firmware update running.
function checkFirmwareUpdateRunning() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Hide the info popup.
    showInfoPopup(false);
    // Show the loading popup.
    showLoadingPopup(true, MESSAGE_CHECKING_FIRMWARE_UPDATE_STATUS);
    // Send request to check firmware update running.
    $.post(
        "../ajax/check_firmware_update_running",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide the loading popup.
            showLoadingPopup(false);
            // Process check firmware update status answer.
            processCheckFirmwareUpdateRunningResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide the loading popup.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the check firmware update running request.
function processCheckFirmwareUpdateRunningResponse(response) {
    // Check if the firmware update is running.
    if (response[ID_UPDATE_RUNNING] == true) {
        // Flag the update variable.
        updatingFirmware = true;
        // Disable page controls.
        enableManagementPageControls(false);
        // Enable cancel button.
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
        // Show firmware update progress.
        showFirmwareUpdateProgress(true);
        // Update the firmware update progress.
        setFirmwareUpdateProgressInfo(0, "");
        // Check the firmware update progress.
        checkFirmwareUpdateProgress();
        // Subscribe timer.
        startFirmwareUpdateTimer();
    }
}

// Checks the firmware update progress.
function checkFirmwareUpdateProgress() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Hide the info popup.
    showInfoPopup(false);
    // Hide the loading popup.
    showLoadingPopup(false);
    // Send request to check firmware update progress.
    $.post(
        "../ajax/check_firmware_update_progress",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Process check firmware update progress answer.
            processCheckFirmwareUpdateProgressResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the firmware update progress.
function processCheckFirmwareUpdateProgressResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Update the firmware update progress.
        setFirmwareUpdateProgressInfo(response[ID_PROGRESS], response[ID_MESSAGE]);
    }
}

// Asks user to cancel the firmware update process
function askCancelFirmwareUpdate() {
    showConfirmDialog(TITLE_CONFIRM_CANCEL_UPDATE, MESSAGE_CONFIRM_CANCEL_UPDATE,
        function() {
            cancelFirmwareUpdate();
        },
        function() {
            // Do nothing.
        }
    );
}

// Cancels an ongoing firmware update.
function cancelFirmwareUpdate() {
    // Sanity checks
    if (!isManagementShowing() || !updatingFirmware)
        return;
    // Check the type of the firmware update.
    if (uploadFirmwareAjaxRequest != null)
        cancelFirmwareUploadProcess();
    else
        cancelFirmwareUpdateProcess();
}

// Cancels the firmware upload process.
function cancelFirmwareUploadProcess() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Send request to cancel firmware upload.
    uploadProgressSocket.send("cancel");
    // Abort AJAX request.
    uploadFirmwareAjaxRequest.abort();
    uploadFirmwareAjaxRequest = null;
    // Flag the update variable.
    updatingFirmware = false;
    // Enable page controls.
    enableManagementPageControls(true);
    // Hide he firmware update progress.
    showFirmwareUpdateProgress(false);
}

// Cancels the remote firmware update process.
function cancelFirmwareUpdateProcess() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Disable cancel button.
    enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, false);
    // Show loading popup.
    showLoadingPopup(true, MESSAGE_CANCELING_FIRMWARE_UPDATE);
    // Send request to cancel firmware update.
    $.post(
        "../ajax/cancel_firmware_update",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide loading popup.
            showLoadingPopup(false);
            // Process cancel firmware update answer.
            processCancelFirmwareUpdateResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide loading popup.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
        // Enable cancel button again.
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
    });
}

// Processes the response of the cancel firmware update request.
function processCancelFirmwareUpdateResponse(response) {
    // Check if there was any error in the request.
    if (checkErrorResponse(response, false)) {
        // Enable cancel button again.
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, true);
    } else {
        // Flag the update variable.
        updatingFirmware = false;
        // Enable page controls.
        enableManagementPageControls(true);
        // Hide firmware update progress.
        showFirmwareUpdateProgress(false);
        // Stop the firmware update timer.
        stopFirmwareUpdateTimer();
    }
}

// Clears the fileset file list.
function clearFilesetList() {
    // Initialize variables.
    var filesetEntriesContainerElement = document.getElementById(ID_FILESET_ITEMS_CONTAINER);
    // Clear the fileset file list.
    if (filesetEntriesContainerElement != null && filesetEntriesContainerElement != "undefined") {
        while (filesetEntriesContainerElement.firstChild)
            filesetEntriesContainerElement.removeChild(filesetEntriesContainerElement.lastChild);
    }
}

// Clears the repository file list.
function clearRepositoryList() {
    // Initialize variables.
    var repoEntriesContainerElement = document.getElementById(ID_REPOSITORY_ITEMS_CONTAINER);
    // Clear the repository file list.
    if (repoEntriesContainerElement != null && repoEntriesContainerElement != "undefined") {
        while (repoEntriesContainerElement.firstChild)
            repoEntriesContainerElement.removeChild(repoEntriesContainerElement.lastChild);
    }
}

// Refresh the fileset list of files.
function refreshFilesetFiles() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Flag files loaded.
    filesLoaded = false;
    // Reset fileset files.
    listFilesetFiles(DEMO_FILE_SET);
}

// Refresh the repository list of files.
function refreshRepositoryFiles() {
    // Sanity checks
    if (!isManagementShowing())
        return;
    // Flag files loaded.
    fwLoaded = false;
    // Reset repository files.
    listRepositoryFiles(getDeviceName());
}

// Lists all the files of a fileset.
function listFilesetFiles(fileSet) {
    // Sanity checks
    if (!isManagementShowing() || filesLoaded)
        return;
    // Unselect all fileset entries.
    unselectFilesetEntries();
    // Clear the fileset list.
    clearFilesetList();
    // Show loading popup.
    showLoadingPopup(true, MESSAGE_LOADING_FILES);
    // Send request to list files.
    $.post(
        "../ajax/list_fileset_files",
        JSON.stringify({
            "file_set": fileSet
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide loading popup.
            showLoadingPopup(false);
            // Process answer.
            processListFilesetFilesResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide loading popup.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Lists all the files of a device type.
function listRepositoryFiles(deviceType) {
    // Sanity checks
    if (!isManagementShowing() || fwLoaded)
        return;
    // Unselect all repository entries.
    unselectRepositoryEntries();
    // Clear the repository list.
    clearRepositoryList();
    // Show loading popup.
    showLoadingPopup(true, MESSAGE_LOADING_FILES);
    // Send request to list files.
    $.post(
        "../ajax/list_repo_files",
        JSON.stringify({
            "device_type": deviceType
        }),
        function(data) {
            // Process only in the management page.
            if (!isManagementShowing())
                return;
            // Hide loading popup.
            showLoadingPopup(false);
            // Process answer.
            processListRepositoryFilesResponse(data);
        }
    ).fail(function(response) {
        // Process only in the management page.
        if (!isManagementShowing())
            return;
        // Hide loading popup.
        showLoadingPopup(false);
        // Process error.
        processAjaxErrorResponse(response);
    });
}

// Processes the response of the list fileset files request.
function processListFilesetFilesResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Parse the files contained in the fileset.
        var files = response[ID_FILES];
        // Add the files to the list.
        if (files != null && files != "undefined") {
            var filesetEntriesContainerElement = document.getElementById(ID_FILESET_ITEMS_CONTAINER);
            for (var entry of response[ID_FILES]) {
                var name = entry[ID_NAME];
                var entryDiv = document.createElement("div");
                entryDiv.innerHTML = TEMPLATE_FILESET_FILE.format(name, name, name, name, entry[ID_PATH],
                        sizeToHumanRead(entry[ID_SIZE]), transformDate(entry[ID_LAST_MODIFIED]));
                filesetEntriesContainerElement.appendChild(entryDiv);
            }
        }
        // Flag fileset list variable.
        filesLoaded = true;
    }
}

function getSecurityIcon(securityLevel) {
    if (securityLevel == "not-identified")
        return "fa-question";
    if (securityLevel == "none")
        return "fa-times";
    if (securityLevel == "low")
        return "fa-angle-down";
    if (securityLevel == "medium")
        return "fa-angle-up";
    if (securityLevel == "high")
        return "fa-angle-exclamation";
    if (securityLevel == "critical")
        return "fa-ban";
    return "fa-question";
}

// Processes the response of the list repository files request.
function processListRepositoryFilesResponse(response) {
    // Check if there was any error in the request.
    if (!checkErrorResponse(response, false)) {
        // Parse the files contained in the repository.
        var files = response[ID_FILES];
        // Add the files to the list.
        if (files != null && files != "undefined") {
            var repoEntriesContainerElement = document.getElementById(ID_REPOSITORY_ITEMS_CONTAINER);
            for (var entry of response[ID_FILES]) {
                var version = entry[ID_FW_VERSION];
                var entryDiv = document.createElement("div");
                entryDiv.innerHTML = TEMPLATE_REPOSITORY_FILE.format(version, version, version, version,
                        entry[ID_PRODUCTION] ? "fa-check" : "fa-times", getSecurityIcon(entry[ID_SECURITY]),
                        entry[ID_NAME], sizeToHumanRead(entry[ID_SIZE]), entry[ID_INFO], entry[ID_INFO]);
                repoEntriesContainerElement.appendChild(entryDiv);
            }
        }
        // Flag repository list variable.
        fwLoaded = true;
    }
}

// Selects a file from the fileset list
function selectFilesetEntry(entryID) {
    // Unselect all entries.
    unselectFilesetEntries();
    // Set selected style to the selected div.
    var entryElement = document.getElementById(entryID)
    if (entryElement != null) {
        entryElement.classList.add(CLASS_FILESET_ENTRY_SELECTED);
        selectedFilesetEntry = entryID;
        // Enable update firmware button.
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, true);
        // Hide firmware update progress.
        showFirmwareUpdateProgress(false);
    }
}

// Selects a file from the repository list
function selectRepositoryEntry(entryID) {
    // Unselect all entries.
    unselectRepositoryEntries();
    // Set selected style to the selected div.
    var entryElement = document.getElementById(entryID)
    if (entryElement != null) {
        entryElement.classList.add(CLASS_REPOSITORY_ENTRY_SELECTED);
        selectedRepositoryEntry = entryID;
        // Enable update firmware button.
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, true);
        // Hide firmware update progress.
        showFirmwareUpdateProgress(false);
    }
}

// Unselects all the fileset entries.
function unselectFilesetEntries() {
    // Initialize variables.
    var fileSystemEntriesDiv = document.getElementById(ID_FILESET_ITEMS_CONTAINER);
    var children = fileSystemEntriesDiv.children;
    // Remove selected class from all entries.
    for (var i = 0; i < children.length; i++) {
        var entry = children[i].children[0];
        entry.classList.remove(CLASS_FILESET_ENTRY_SELECTED);
    }
    selectedFilesetEntry = null;
    // Disable firmware update button.
    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
}

// Unselects all the repository entries.
function unselectRepositoryEntries() {
    // Initialize variables.
    var fileSystemEntriesDiv = document.getElementById(ID_REPOSITORY_ITEMS_CONTAINER);
    var children = fileSystemEntriesDiv.children;
    // Remove selected class from all entries.
    for (var i = 0; i < children.length; i++) {
        var entry = children[i].children[0];
        entry.classList.remove(CLASS_REPOSITORY_ENTRY_SELECTED);
    }
    selectedRepositoryEntry = null;
    // Disable firmware update button.
    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
}

// Enables/disables the management page controls.
function enableManagementPageControls(enable) {
    // Reboot button.
    enableManagementButton(ID_REBOOT_BUTTON, enable);
    // Update firmware button.
    var activeTab = getActiveFirmwareUpdateTab();
    if (activeTab == ID_FIRMWARE_TAB_UPLOAD) {
        var firmwareFileElement = document.getElementById(ID_UPDATE_FIRMWARE_FILE);
        if (firmwareFileElement.files.length == 0)
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
        else
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, enable);
    } else if (activeTab == ID_FIRMWARE_TAB_REPOSITORY) {
        if (!fwLoaded || selectedRepositoryEntry == null)
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
        else
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, enable);
    } else if (activeTab == ID_FIRMWARE_TAB_FILESET) {
        if (!filesLoaded || selectedFilesetEntry == null)
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
        else
            enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, enable);
    }
    // Cancel update button.
    if (isFirmwareUpdateRunning() && enable)
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, enable);
    else
        enableManagementButton(ID_CANCEL_FIRMWARE_UPDATE_BUTTON, false);
    // Tabs.
    var tabUploadElement = document.getElementById(ID_FIRMWARE_TAB_UPLOAD);
    var tabUploadHeaderElement = document.getElementById(ID_FIRMWARE_TAB_UPLOAD_HEADER);
    var tabFilesetElement = document.getElementById(ID_FIRMWARE_TAB_FILESET);
    var tabFilesetHeaderElement = document.getElementById(ID_FIRMWARE_TAB_FILESET_HEADER);
    var tabRepoElement = document.getElementById(ID_FIRMWARE_TAB_REPOSITORY);
    var tabRepoHeaderElement = document.getElementById(ID_FIRMWARE_TAB_REPOSITORY_HEADER);
    if (enable) {
        tabUploadElement.classList.remove((CLASS_DISABLED_DIV));
        tabUploadHeaderElement.classList.remove((CLASS_DISABLED_DIV));
        tabFilesetElement.classList.remove((CLASS_DISABLED_DIV));
        tabFilesetHeaderElement.classList.remove((CLASS_DISABLED_DIV));
        tabRepoElement.classList.remove((CLASS_DISABLED_DIV));
        tabRepoHeaderElement.classList.remove((CLASS_DISABLED_DIV));
    } else {
        tabUploadElement.classList.add((CLASS_DISABLED_DIV));
        tabUploadHeaderElement.classList.add((CLASS_DISABLED_DIV));
        tabFilesetElement.classList.add((CLASS_DISABLED_DIV));
        tabFilesetHeaderElement.classList.add((CLASS_DISABLED_DIV));
        tabRepoElement.classList.add((CLASS_DISABLED_DIV));
        tabRepoHeaderElement.classList.add((CLASS_DISABLED_DIV));
    }
}

// Enables/disables the given button ID
function enableManagementButton(buttonID, enable) {
    // Initialize variables.
    var buttonElement = document.getElementById(buttonID);
    if (buttonElement != null) {
        if (enable) {
            if (buttonElement.classList.contains(CLASS_MANAGEMENT_BUTTON_DISABLED))
                buttonElement.classList.remove(CLASS_MANAGEMENT_BUTTON_DISABLED);
        } else
            buttonElement.classList.add(CLASS_MANAGEMENT_BUTTON_DISABLED);
    }
}

// Returns the active firmware update tab.
function getActiveFirmwareUpdateTab() {
    // Initialize variables.
    var tabUploadHeaderElement = document.getElementById(ID_FIRMWARE_TAB_UPLOAD_HEADER);
    var tabFilesetHeaderElement = document.getElementById(ID_FIRMWARE_TAB_FILESET_HEADER);
    var tabRepoHeaderElement = document.getElementById(ID_FIRMWARE_TAB_REPOSITORY_HEADER);
    // Check the active tab.
    if (tabUploadHeaderElement.classList.contains(CLASS_FIRMWARE_TAB_HEADER_ACTIVE))
        return ID_FIRMWARE_TAB_UPLOAD;
    else if (tabFilesetHeaderElement.classList.contains(CLASS_FIRMWARE_TAB_HEADER_ACTIVE))
        return ID_FIRMWARE_TAB_FILESET;
    else if (tabRepoHeaderElement.classList.contains(CLASS_FIRMWARE_TAB_HEADER_ACTIVE))
        return ID_FIRMWARE_TAB_REPOSITORY;
    else
        return null;
}

// Returns whether the device is rebooting or not.
function isDeviceRebooting() {
    return deviceRebooting;
}

// Returns whether firmware update is running or not.
function isFirmwareUpdateRunning() {
    return updatingFirmware;
}

// Shows the given firmware tab
function showFirmwareTab(tabID) {
    // Initialize variables.
    var tabElement = document.getElementById(tabID);
    var tabHeaderElement = document.getElementById(tabID + "_header");
    if (tabElement != null && tabHeaderElement != null) {
        // Deselect all tab headers.
        var tabHeaders = document.getElementsByClassName(CLASS_FIRMWARE_TAB_HEADER);
        for (var i = 0; i < tabHeaders.length; i++) {
            var tabHeader = tabHeaders[i];
            if (tabHeader.classList.contains(CLASS_FIRMWARE_TAB_HEADER_ACTIVE))
                tabHeader.classList.remove(CLASS_FIRMWARE_TAB_HEADER_ACTIVE);
        }
        // Hide all the tabs.
        var tabs = document.getElementsByClassName(CLASS_FIRMWARE_TAB);
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            tab.style.display = "none";
        }
        // Show the selected tab.
        tabHeaderElement.classList.add(CLASS_FIRMWARE_TAB_HEADER_ACTIVE);
        tabElement.style.display = "block";
        // Disable firmware update button.
        enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, false);
        // Hide firmware update progress.
        showFirmwareUpdateProgress(false);
        // Perform additional actions on each tab.
        switch(tabID) {
            case ID_FIRMWARE_TAB_UPLOAD:
                validateFwVersionInfo();
                break;
            case ID_FIRMWARE_TAB_REPOSITORY:
                if (fwLoaded && selectedRepositoryEntry != null) {
                    // Enable firmware update button.
                    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, true);
                } else if (!fwLoaded) {
                    // Refresh repository entries.
                    listRepositoryFiles(getDeviceName());
                }
                break;
            case ID_FIRMWARE_TAB_FILESET:
                if (filesLoaded && selectedFilesetEntry != null) {
                    // Enable firmware update button.
                    enableManagementButton(ID_UPDATE_FIRMWARE_BUTTON, true);
                } else if (!filesLoaded) {
                    // Refresh fileset entries.
                    listFilesetFiles(DEMO_FILE_SET);
                }
                break;
        }
    }
}

// Shows/hides the firmware update progress section.
function showFirmwareUpdateProgress(visible) {
    // Initialize variables.
    var firmwareUpdateProgressElement = document.getElementById(ID_UPDATE_FIRMWARE_PROGRESS);
    if (firmwareUpdateProgressElement != null) {
        if (visible)
            firmwareUpdateProgressElement.style.display = "block";
        else
            firmwareUpdateProgressElement.style.display = "none";
    }
}

// Sets file upload progress.
function setFileUploadProgressInfo(progress, message=null) {
    updateProgress(UPDATE_INFO, progress, TITLE_FILE_UPLOAD_IN_PROGRESS, message);
}

// Sets file upload progress error.
function setFileUploadteProgressError(message=null) {
    updateProgress(UPDATE_ERROR, 100, TITLE_FILE_UPLOAD_ERROR, message);
}

// Sets file upload progress success.
function setFileUploadProgressSuccess(message=null) {
    updateProgress(UPDATE_SUCCESS, 100, TITLE_FILE_UPLOAD_SUCCESS, message);
}

// Sets the firmware update progress.
function setFirmwareUpdateProgressInfo(progress, message=null) {
    updateProgress(UPDATE_INFO, progress, TITLE_FIRMWARE_UPDATE_IN_PROGRESS, message);
}

// Sets the firmware update progress error.
function setFirmwareUpdateProgressError(message=null) {
    updateProgress(UPDATE_ERROR, 100, TITLE_FIRMWARE_UPDATE_ERROR, message);
}

// Sets the firmware update progress success.
function setFirmwareUpdateProgressSuccess(message=null) {
    updateProgress(UPDATE_SUCCESS, 100, TITLE_FIRMWARE_UPDATE_SUCCESS, message);
}

// Updates the progress.
function updateProgress(status, progress, title=null, message=null) {
    // Initialize variables.
    var firmwareUpdateProgressElement = document.getElementById(ID_UPDATE_FIRMWARE_PROGRESS);
    if (firmwareUpdateProgressElement != null) {
        // Update the progress bar.
        var progressBarElement = document.getElementById(ID_UPDATE_FIRMWARE_PROGRESS_BAR);
        if (progressBarElement != null) {
            // Update the progress bar status type.
            if (progressBarElement.classList.contains(CLASS_PROGRESS_BAR_INFO))
                progressBarElement.classList.remove(CLASS_PROGRESS_BAR_INFO);
            if (progressBarElement.classList.contains(CLASS_PROGRESS_BAR_ERROR))
                progressBarElement.classList.remove(CLASS_PROGRESS_BAR_ERROR);
            if (progressBarElement.classList.contains(CLASS_PROGRESS_BAR_SUCCESS))
                progressBarElement.classList.remove(CLASS_PROGRESS_BAR_SUCCESS);
            switch (status) {
                case UPDATE_INFO:
                    progressBarElement.classList.add(CLASS_PROGRESS_BAR_INFO);
                    break;
                case UPDATE_ERROR:
                    progressBarElement.classList.add(CLASS_PROGRESS_BAR_ERROR);
                    break;
                case UPDATE_SUCCESS:
                    progressBarElement.classList.add(CLASS_PROGRESS_BAR_SUCCESS);
                    break;
            }
            // Update the progress bar percent.
            progressBarElement.style.width = progress + "%";
            progressBarElement.innerHTML = progress + "%";
        }
        // Update the progress title.
        var progressTitleElement = document.getElementById(ID_UPDATE_FIRMWARE_PROGRESS_TITLE);
        if (progressTitleElement != null) {
            if (title != null)
                progressTitleElement.innerHTML = title;
            else
                progressTitleElement.innerHTML = "";
        }
        // Update the progress message.
        var progressMessageElement = document.getElementById(ID_UPDATE_FIRMWARE_PROGRESS_MESSAGE);
        if (progressMessageElement != null) {
            if (message != null)
                progressMessageElement.innerHTML = message;
            else
                progressMessageElement.innerHTML = "";
        }
    }
}