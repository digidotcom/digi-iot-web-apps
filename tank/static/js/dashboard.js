/*
 * Copyright 2021, Digi International Inc.
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

const INFO_WINDOW_CONTENT = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        @@NAME@@" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_status.png' height='36px' alt='Status' />" +
    "        </div>" +
    "        <div class='marker-info-value @@STATUS-CLASS@@'>" +
    "            @@STATUS@@" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_location.png' height='36px' alt='Location' />" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            @@LOCATION@@" +
    "        </div>" +
    "    </div>" +
    "</div>";

const ID_LEVEL = "level";
const ID_TEMPERATURE = "temperature";
const ID_VALVE = "valve";

const CLASS_STATUS_ON = "marker-info-value-status-on";
const CLASS_STATUS_OFF = "marker-info-value-status-off";
const CLASS_STATUS_LOADING = "marker-info-value-status-loading";

const ID_STATUS = "status";
const ID_TANKS = "tanks";

const REFRESH_INTERVAL = 30000;

var map;

var tanks = [];
var tanksStatus;

var loadingTanksStatus = false;

var tankMarkers = {};
var tankWindows = {};
var tankLevels = {};
var tankTemperatures = {};
var tankValves = {};

var selectedTankID;

var tankMarker;
var tankSelectedMarker;
var tankOfflineMarker;

var bounds;

var markersZIndex = 0;

// Initialize and add the map.
function initMap() {
    // Create the marker icon (normal).
    tankMarker = {
        url: "../static/images/marker_tank.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // Create the marker icon (selected).
    tankSelectedMarker = {
        url: "../static/images/marker_tank_selected.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // Create the marker icon (offline).
    tankOfflineMarker = {
        url: "../static/images/marker_tank_offline.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // The location of Uluru.
    let uluru = {lat: -25.344, lng: 131.036};

    // The map, centered at Uluru.
    map_configuration = {
        zoom              : 5,
        mapTypeId         : "satellite",
        center            : uluru,
        streetViewControl : false,
        scaleControl      : false,
        fullscreenControl : false,
        styles            : [
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{ "hue": "#FFA800" }, { "gamma": 1 }] },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{ "hue": "#679714" }, { "saturation": 33.4 }, { "lightness": -25.4 }, { "gamma": 1 }] },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{ "hue": "#53FF00" }, { "saturation": -73 }, { "lightness": 40 }, { "gamma": 1 }] },
            {
                "featureType": "road.arterial",
                "elementType": "all",
                "stylers": [{ "hue": "#FBFF00" }, { "gamma": 1 }] },
            {
                "featureType": "road.local",
                "elementType": "all",
                "stylers": [{ "hue": "#00FFFD" }, { "lightness": 30 }, { "gamma": 1 }] },
            {
                "featureType": "water",
                "elementType": "all", "stylers": [{ "hue": "#00BFFF" }, { "saturation": 6 }, { "lightness": 8 }, { "gamma": 1 }] },
            {
                "featureType": "transit",
                "stylers": [{ "visibility": "off" }] },
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }] },

        ]
    };
    map = new google.maps.Map(document.getElementById("tanks-map"), map_configuration);

    tankMarkers = {};
    markersZIndex = 0;

    // Create empty LatLngBounds object.
    bounds = new google.maps.LatLngBounds();
}

// Gets the status of the installation.
function getInstallationStatus(first=true) {
    if (!isDashboardShowing())
        return;

    if (first)
        selectedTankID = null;

    // Update colors of the values being refreshed.
    loadingTanksStatus = true;
    updateLoadingStatus();

    $.post(
        "../ajax/get_installation_status",
        JSON.stringify({
            "installation_name": getInstallationName(),
        }),
        function(data) {
            if (!isDashboardShowing())
                return;
            processInstallationStatusResponse(data, first);
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Processes the response of the installation status request.
function processInstallationStatusResponse(response, first) {
    if (first)
        drawDevices(response);

    updateTanksStatus(response);
    updateTanksCounters(response);

    // Hide the tank loading.
    loadingTanksStatus = false;
    updateLoadingStatus();

    // Repeat the task every 30 seconds.
    setTimeout(function() {
        getInstallationStatus(false);
    }, REFRESH_INTERVAL);
}

// Draws the markers for the tanks.
function drawDevices(response) {
    // First, check if there was any error in the request.
    if (response["error_msg"] != null || response["error"] != null) {
        // Show toast with error.
        if (response["error_msg"] != null) {
            toastr.error(response["error_msg"]);
            $("#info-title").text(response["error_title"]);
            $("#info-message").html(response["error_msg"] + response["error_guide"]);
        } else {
            toastr.error(response["error"]);
            $("#info-message").html(response["error"]);
        }

        // Hide the loading panel of the map.
        hidePopup($(".map-loading-wrapper"), $("#popup-loading-map"));

        // Show help dialog.
        showPopup($(".map-loading-wrapper"), $("#popup-info-map"));

        // Hide the tank loading.
        loadingTanksStatus = false;
        updateLoadingStatus();

        return;
    }

    // Get the list of devices from the JSON response.
    tanks = response[ID_TANKS];

    // Check if the lists are empty.
    if (tanks == null || tanks.length == 0) {
        // Hide the loading panel of the map.
        $("#map-loading").hide();
        return;
    }

    // Create a marker for each tank.
    for (let tank of tanks) {
        let tankID = tank["dev_id"];
        let tank_location = {
            lat: tank["location"][0],
            lng: tank["location"][1]
        };
        let marker = new MarkerWithLabel({
            position     : tank_location,
            map          : map,
            icon         : tank["online"] ? tankMarker : tankOfflineMarker,
            draggable    : false,
            labelContent : tank["name"].toUpperCase(),
            labelClass   : "map-marker",
            labelAnchor  : new google.maps.Point(0, -5),
            zIndex       : markersZIndex,
        });

        markersZIndex++;

        // Extend the bounds to include each marker's position.
        bounds.extend(marker.position);

        // Create an info window.
        let infoWindowContent = getTankInfoWindowContent(tankID);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.addListener("domready", updateLoadingStatus);
        infoWindow.setZIndex(markersZIndex);

        // Add the info window to the windows dictionary.
        tankWindows[tankID] = infoWindow;

        // Add the marker to the markers dictionary.
        tankMarkers[tankID] = marker;

        // Add a click listener to toggle the info window.
        marker.addListener("click", () => {
            selectTank(tankID, true);
        });

        // Add the tank to the selector.
        $("#tank-selector").append(new Option(tank["name"].toUpperCase(), tankID));
    }

    // Fit the map to the newly inclusive bounds.
    centerTanks();

    // Hide the loading panel of the map.
    hidePopup($(".map-loading-wrapper"), $("#popup-loading-map"));
}

// Updates the status of the tanks based on the given response.
function updateTanksStatus(response) {
    if (response[ID_STATUS] == null || response[ID_STATUS][ID_TANKS] == null)
        return;

    tanksStatus = response[ID_STATUS][ID_TANKS];

    for (let tankID in tanksStatus) {
        // Add the values to the corresponding dictionaries.
        tankLevels[tankID] = tanksStatus[tankID][ID_LEVEL];
        tankTemperatures[tankID] = tanksStatus[tankID][ID_TEMPERATURE];
        tankValves[tankID] = tanksStatus[tankID][ID_VALVE];
    }

    // Update the marker icons.
    updateMarkerIcons();
}

// Updates the marker icons.
function updateMarkerIcons() {
    for (let tank in tankMarkers) {
        let marker = tankMarkers[tank];
        if (tank in tanksStatus && isTankOnline(tank)) {
            if (tank == selectedTankID)
                marker.setIcon(tankSelectedMarker);
            else
                marker.setIcon(tankMarker);
        } else {
            marker.setIcon(tankOfflineMarker);
        }
    }
}

// Updates the tank counters based on the given response.
function updateTanksCounters(response) {
    let onlineTanks = 0;
    for (let tank of response[ID_TANKS]) {
        if (tank["online"])
            onlineTanks += 1;
    }

    // Update online tanks.
    let tanksElement = document.getElementById("online-tanks");
    if (tanksElement != null)
        tanksElement.innerText = onlineTanks;
}

// Shows or hides the info window corresponding to the tank with the given ID.
function toggleInfoWindow(tankID) {
    let infoWindow = tankWindows[tankID];
    if (infoWindow != null) {
        let infoWindowMap = infoWindow.getMap();
        if (infoWindowMap !== null && typeof infoWindowMap !== "undefined") {
            infoWindow.close();
        } else if (tankMarkers[tankID] != null) {
            infoWindow.setContent(getTankInfoWindowContent(tankID));
            infoWindow.open(map, tankMarkers[tankID]);
            // Close the rest of info windows.
            for (let tank of tanks) {
                let window = tankWindows[tank["dev_id"]];
                if (window == infoWindow)
                    continue;
                let windowMap = window.getMap();
                if (windowMap !== null && typeof windowMap !== "undefined")
                    window.close();
            }
        }
    }
}

// Updates the color of the tank values depending on if they are being loaded or not.
function updateLoadingStatus() {
    // Show or hide the map status element.
    let mapStatusElement = document.getElementById("tanks-map-status");
    if (mapStatusElement == null)
        return;
    if (loadingTanksStatus)
        mapStatusElement.style.display = "block";
    else
        mapStatusElement.style.display = "none";

    // Update level and valve statuses of the selected tank.
    if (selectedTankID != null) {
        updateTankLevel(tankLevels[selectedTankID]);
        updateTankTemperature(tankTemperatures[selectedTankID]);
        updateTankValveStatus(tankValves[selectedTankID]);
    }
}

// Generates and returns the content of the information window for the tank with the given ID.
function getTankInfoWindowContent(tankID) {
    // Clone the content template.
    let content = INFO_WINDOW_CONTENT;
    // Set the information window title.
    content = content.replace("@@NAME@@", getTankName(tankID));
    // Configure the status.
    if (isTankOnline(tankID)) {
        content = content.replace("@@STATUS-CLASS@@", CLASS_STATUS_ON);
        content = content.replace("@@STATUS@@", "Online");
    } else {
        content = content.replace("@@STATUS-CLASS@@", CLASS_STATUS_OFF);
        content = content.replace("@@STATUS@@", "Offline");
    }
    // Configure the location.
    let location = getTankLocation(tankID);
    content = content.replace("@@LOCATION@@", location[0] + "<br>" + location[1]);

    return content;
}

// Selects the tank with the given ID.
function selectTank(tankID, showInfo=false) {
    selectedTankID = tankID;

    hidePopup($(".water-tank-card"), $("#popup-select-tank"));

    // Update tank selector.
    $("#tank-selector").val(tankID);

    // Update markers.
    tankMarkers[tankID].setZIndex(markersZIndex);
    tankWindows[tankID].setZIndex(markersZIndex);
    markersZIndex++;
    updateMarkerIcons();
    if (showInfo)
        toggleInfoWindow(tankID);

    // Update right pane info.
    document.getElementById("tank-name").innerHTML = getTankName(tankID);
    updateTankLevel(tankLevels[tankID]);
    updateTankTemperature(tankTemperatures[tankID]);
    updateTankValveStatus(tankValves[tankID]);

    if (isTankOnline(tankID))
        hidePopup($(".water-tank-card"), $("#popup-offline-tank"));
    else
        showPopup($(".water-tank-card"), $("#popup-offline-tank"));
}

// Returns the name of the tank with the given ID.
function getTankName(tankID) {
    for (let tank of tanks) {
        if (tank["dev_id"] == tankID && tank["name"] != null)
            return(tank["name"]);
    }
    return "-";
}

// Returns whether the tank with the given ID is online or not.
function isTankOnline(tankID) {
    for (let tank of tanks) {
        if (tank["dev_id"] == tankID && tank["online"] != null)
            return(tank["online"]);
    }
    return false;
}

// Returns the location of the tank with the given ID.
function getTankLocation(tankID) {
    for (let tank of tanks) {
        if (tank["dev_id"] == tankID && tank["location"] != null)
            return(tank["location"]);
    }
    return "-";
}

// Centers all the tanks in the map.
function centerTanks() {
    map.fitBounds(bounds);
}

// Shows or hides all the tanks info windows.
function setInfoWindowsVisible(visible) {
    for (let tank of tanks) {
        let tankID = tank["dev_id"];
        let infoWindow = tankWindows[tankID];
        if (infoWindow != null) {
            if (visible) {
                infoWindow.setContent(getTankInfoWindowContent(tankID));
                infoWindow.open(map, tankMarkers[tankID]);
            } else {
                infoWindow.close();
            }
        }
    }
}

// Sets the graphic water level in the water tank to the given percentage.
function updateTankLevel(waterLevel) {
    $("#water").height(waterLevel + "%");
    document.getElementById(ID_LEVEL).innerText = waterLevel;
    hidePopup($(".tank-img-loading-container"), $("#tank-spinner"));
}

// Sets the tank temperature to the given value.
function updateTankTemperature(temperature) {
    document.getElementById(ID_TEMPERATURE).innerText = temperature;
}

// Refills the water tank.
function refillTank() {
    // Show loading icon on top of toggle.
    showPopup($(".tank-img-loading-container"), $("#tank-spinner"));
    document.getElementById(ID_LEVEL).innerText = "-";

    $.post(
        "../ajax/refill_tank",
        JSON.stringify({
            "tank_id": selectedTankID
        }),
        function(data) {
            let newWaterLevel = data["value"];
            tankLevels[selectedTankID] = newWaterLevel;
            updateTankLevel(newWaterLevel);
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Updates the status of the tank valve toggle button.
function updateTankValveStatus(tankValve) {
    if (tankValve == null)
        return;
    if (tankValve == 0.0) {
        // Only update the toggle status if the change was not manual, when done manually, it gets updated automatically.
        if (document.getElementById("toggle-valve").checked) {
            $("#toggle-valve").bootstrapToggle("off");
        }
    } else {
        // Only update the toggle status if the change was not manual, when done manually, it gets updated automatically.
        if (!document.getElementById("toggle-valve").checked) {
            $("#toggle-valve").bootstrapToggle("on");
        }
    }
    if (document.getElementById("toggle-valve").checked) {
        $("#tank-valve-img").attr("src", "../static/images/valve-open.png");
    } else {
        $("#tank-valve-img").attr("src", "../static/images/valve-closed.png");
    }
    hidePopup($(".tank-valve-loading-container"), $("#toggle-spinner"));
}

// Returns whether the status of the tank valve of the installation is ON or OFF.
function isTankValveON() {
    let tankValve = tankValves[selectedTankID];
    if (tankValve == null)
        return false;
    return tankValve == 1.0;
}

// Sets the status of the tank valve with the provided ID.
function toggleTankValve() {
    // Get the new status of the valve to set.
    let valveStatus = "1";
    if (isTankValveON())
        valveStatus = "0";

    // Show loading icon on top of toggle.
    showPopup($(".tank-valve-loading-container"), $("#toggle-spinner"));

    $.post(
        "../ajax/set_tank_valve",
        JSON.stringify({
            "tank_id": selectedTankID,
            "status": valveStatus
        }),
        function(data) {
            let newValveStatus = data["value"];
            tankValves[selectedTankID] = newValveStatus;
            updateTankValveStatus(newValveStatus);
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Returns whether the dashboard page is showing or not.
function isDashboardShowing() {
    return window.location.pathname.indexOf("dashboard") > -1;
}