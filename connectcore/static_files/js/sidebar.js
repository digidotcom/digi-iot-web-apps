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
const ID_DEVICE_CONNECTION_STATUS = "device-connection-status";

const ERROR_DEVICE_NOT_CONNECTED_TITLE = "Device offline";
const ERROR_DEVICE_NOT_CONNECTED_MESSAGE = "The selected device is offline";

// Variables.
var deviceConnectionStatus = false;
var deviceSocket = null;

// Hide submenus
$("#body-row .collapse").collapse("hide");

// Collapse/Expand icon.
$("#collapse-icon").addClass("fa-angle-double-left");

// Select click.
$("#sections > a").click(function() {
    selectSection($(this));
});

// Collapse click.
$("[data-toggle=sidebar-collapse]").click(function() {
    sidebarCollapse();
});

$(".element-grayed").click(function(){return false;});

// Selects the given item in the sidebar.
function selectSection(selectedItem) {
    // Remove decorations of previously selected element.
    $("#sections .selected").removeClass(CLASS_SELECTED);

    // Decorate the selected element.
    selectedItem.toggleClass(CLASS_SELECTED);
}

// Collapses the sidebar to the left.
function sidebarCollapse() {
    $(".menu-collapsed").toggleClass("d-none");
    $(".sidebar-submenu").toggleClass("d-none");
    $(".submenu-icon").toggleClass("d-none");

    // Add/Remove right margin.
    $(".digi-menu-icon").toggleClass("mr-3 mr-0");

    $("#sidebar-container").toggleClass("sidebar-expanded sidebar-collapsed");

    // Treating d-flex/d-none on separators with title.
    var separatorTitle = $(".sidebar-separator-title");
    if (separatorTitle.hasClass("d-flex"))
        separatorTitle.removeClass("d-flex");
    else
        separatorTitle.addClass("d-flex");

    // Collapse/Expand icon.
    $("#collapse-icon").toggleClass("fa-angle-double-left fa-angle-double-right");

    // Make the cards the same height. Wait some time so size is
    // calculated after the content of the cards expands or collapses.
    window.setTimeout(function () {
        $(".adjust-card-height .card").matchHeight();
    }, 100);

    if (isDashboardShowing()) {
        let refreshPanelsInterval = window.setInterval(adjustImageSize, 10);
        window.setTimeout(function () {
           window.clearInterval(refreshPanelsInterval);
        }, 300);
    }
}

// Sets the selected section.
function setSelectedSection(element=null) {
    // First, unselect all the sections.
    $("#sections li").each(function(i, n) {
        n.children[0].classList.remove(CLASS_SELECTED);
    });
    // Select the corresponding section.
    if (element != null) {
        element.classList.add(CLASS_SELECTED);
    } else {
        $("#sections li").each(function(i, n) {
            if (window.location.pathname == n.children[0].pathname) {
                n.children[0].classList.add(CLASS_SELECTED);
                return false;
            }
        });
    }
    if (isDashboardShowing()) {
        window.setTimeout(function () {
           adjustImageSize();
        }, 300);
    }
}

// Verifies the given device parameters.
function verifyParameters() {
    let url = new URL(window.location.href);
    let device_id = url.searchParams.get("device_id");
    let device_name = url.searchParams.get("device_name");
    $.post(
        "../ajax/check_device_connection_status",
        JSON.stringify({
            "device_id": device_id,
            "device_name": device_name
        }),
        function(data) {
            if (data["redirect"])
                window.location.replace(data["redirect"]);
        }
    ).fail(function(response) {
        processAjaxErrorResponse(response);
    });
}

// Requests an update on the connection status of the device.
function checkDeviceConnectionStatus() {
    $.post(
        "../ajax/check_device_connection_status",
        JSON.stringify({
            "device_id": getDeviceID()
        }),
        function(data) {
            processDeviceConnectionStatusAnswer(data);
        }
    );
}

// Processes the device connection status answer.
function processDeviceConnectionStatusAnswer(response) {
    // Sanity checks.
    if (response[ID_STATUS] == null || response[ID_STATUS] == "undefined")
        deviceConnectionStatus = false;
    else
        deviceConnectionStatus = response[ID_STATUS];

    // Fire connection status changed event.
    connection_status_changed();
    // Subscribe for connection events.
    subscribeDeviceMonitor();
}

// Handles what happens when a connection change is detected.
function connection_status_changed() {
    // Initialize variables.
    var statusImage = "";
    var statusTitle = "";
    if (deviceConnectionStatus == true) {
        statusImage = IMAGE_ONLINE;
        statusTitle = VALUE_ONLINE;
    } else {
        statusImage = IMAGE_OFFLINE;
        statusTitle = VALUE_OFFLINE;
    }
    // Update the connection status icon and title.
    var deviceStatusElement = document.getElementById(ID_DEVICE_CONNECTION_STATUS);
    if (deviceStatusElement != null) {
        deviceStatusElement.src = PATH_IMAGES + statusImage;
        deviceStatusElement.title = statusTitle;
    }
    // Update page contents.
    if (isDashboardShowing()) {
        if (deviceConnectionStatus)
            initDevice();
        else
            displayDeviceDisconnectedError();
    } else if (isManagementShowing()) {
        if (deviceConnectionStatus)
            initializeManagementPage();
        else if (!isDeviceRebooting()) {
            managementInfoRead = false;
            displayDeviceDisconnectedError();
        }
    } else if (isHistoryShowing()) {
        if (deviceConnectionStatus)
            initCharts();
        else
            displayDeviceDisconnectedError();
    }
}

// Displays the device disconnected error.
function displayDeviceDisconnectedError() {
    // Device disconnected, display error.
    toastr.error(ERROR_DEVICE_NOT_CONNECTED_TITLE);
    // Hide the loading panel of the device.
    showLoadingPopup(false);
    // Show info dialog.
    showInfoPopup(true, ERROR_DEVICE_NOT_CONNECTED_TITLE, ERROR_DEVICE_NOT_CONNECTED_MESSAGE);
}

// Subscribes to device connection changes.
function subscribeDeviceMonitor() {
    // Sanity checks.
    if (deviceSocket != null)
        return;
    // Create the web socket.
    var socketPrefix = window.location.protocol == "https:" ? "wss" : "ws";
    deviceSocket = new WebSocket(socketPrefix + "://" + window.location.host + "/ws/device/" + getDeviceID());
    // Define the callback to be notified when data is received in the web socket.
    deviceSocket.onmessage = function(e) {
        // Retrieve new status.
        var event = JSON.parse(e.data);
        if (event[ID_STATUS] != null && event[ID_STATUS] != "undefined") {
            if (event[ID_STATUS] == "connected")
                deviceConnectionStatus = true;
            else
                deviceConnectionStatus = false;
            // Fire connection status changed event.
            connection_status_changed();
        }
    };
}