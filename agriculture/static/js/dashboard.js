/*
 * Copyright 2020, Digi International Inc.
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
    "        <span id='@@ID@@-TITLE'>@@TITLE@@</span>" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-thermometer-half fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-TEMPERATURE'>@@TEMPERATURE@@</span> ºC" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-tint fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-MOISTURE'>@@MOISTURE@@</span> %" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-battery-half fa-2x fa-rotate-270'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='@@ID@@-BATTERY'>@@BATTERY@@</span> %" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-title' style='margin-top: 10px'>" +
    "    Valve status" +
    "    </div>" +
    "    <div class='marker-info-button-container'>" +
    "        <button id='@@ID@@-BUTTON' class='marker-info-button @@BUTTON-OFF-CLASS@@' onclick=\"toggleValve('@@ID@@')\" data-toggle='tooltip' data-placement='bottom' title='Force open/closing'>@@BUTTON-VALUE@@</button>" +
    "        <div id='@@ID@@-BUTTON-LOADING' class='marker-info-button-loading'>" +
    "    </div>" +
    "</div>";
const INFO_WINDOW_CONTENT_CONTROLLER = "" +
    "<div class='marker-info'>" +
    "    <div class='marker-info-title'>" +
    "        <span>CONTROLLER</span>" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-wind fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-wind'>@@WIND@@</span> km/h" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-cloud-rain fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-rain'>@@RAIN@@</span> L/m²" +
    "        </div>" +
    "    </div>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <span class='digi-icon-color fas fa-sun fa-2x'></span>" +
    "        </div>" +
    "        <div class='marker-info-value'>" +
    "            <span id='infow-radiation'>@@RADIATION@@</span> W/m²" +
    "        </div>" +
    "    </div>" +
    "</div>";
const CLASS_STATUS_LOADING = "marker-info-value-status-loading";
const CLASS_BUTTON_STATUS_OFF = "marker-info-button-off";

const ID_WIND = "wind";
const ID_RADIATION = "radiation";
const ID_RAIN = "rain";
const ID_LEVEL = "level";
const ID_VALVE = "valve";
const ID_TEMPERATURE = "temperature";
const ID_BATTERY = "battery";
const ID_MOISTURE = "moisture";

const ID_STATUS = "status";
const ID_CONTROLLERS = "controllers";
const ID_STATIONS = "stations";
const ID_WEATHER = "weather";
const ID_TANK = "tank";

const REFRESH_INTERVAL = 30000;

const SUN_GREEN = "<i class='selected-icon-widget fas fa-sun'></i>";
const CLOUD_GREEN = "<i class='selected-icon-widget fas fa-cloud'></i>";
const RAIN_GREEN = "<i class='selected-icon-widget fas fa-cloud-rain'></i>";

const SUN_GRAY = "<i class='icon-widget fas fa-sun'></i>";
const CLOUD_GRAY = "<i class='icon-widget fas fa-cloud'></i>";
const RAIN_GRAY = "<i class='icon-widget fas fa-cloud-rain'></i>";

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WEATHER_ICONS = [SUN_GRAY, CLOUD_GRAY, RAIN_GRAY];

var map;

var stations = [];
var irrigationControllers = [];

var loadingStationsStatus = false;

var stationMarkers = {};
var stationWindows = {};
var controllerMarker = null;
var controllerWindow = null;
var stationTemperatures = {};
var stationMoistures = {};
var stationBatteries = {};
var stationValves = {};
var controllerWind = null;
var controllerRain = null;
var controllerRadiation = null;

var tankValve;
var waterLevel;

var stationMarker;
var stationIrrigatingMarker;
var stationOfflineMarker;
var controllerMarker;

var currentWeatherIcon;
var currentWeatherStatus;
var avgTemp = 23.0;  // Define initial value for the temperature so if no stations are registered the weather forecast can be displayed.


var bounds;

var markersZIndex = 0;

subscribeValves();

// Initialize and add the map.
function initMap() {
    // Create the marker icon (normal).
    stationMarker = {
        url: "../static/images/marker_station_off.png",
        size: new google.maps.Size(107, 62),
        scaledSize: new google.maps.Size(107, 62),
        origin: new google.maps.Point(0, 0),
    };

    // Create the marker icon (irrigating).
    stationIrrigatingMarker = {
        url: "../static/images/marker_station_on.png",
        size: new google.maps.Size(107, 62),
        scaledSize: new google.maps.Size(107, 62),
        origin: new google.maps.Point(0, 0),
    };

    // Create the marker icon (offline).
    stationOfflineMarker = {
        url: "../static/images/marker_station_offline.png",
        size: new google.maps.Size(107, 62),
        scaledSize: new google.maps.Size(107, 62),
        origin: new google.maps.Point(0, 0),
    };

    // Create the marker icon for the weather station.
    weatherStationMarker = {
        url: "../static/images/marker_weather_station.png",
        size: new google.maps.Size(107, 62),
        scaledSize: new google.maps.Size(107, 62),
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
    map = new google.maps.Map(document.getElementById("stations-map"), map_configuration);

    stationMarkers = {};
    stationWindows = {};
    controllerMarker = null;
    markersZIndex = 0;

    // Create empty LatLngBounds object.
    bounds = new google.maps.LatLngBounds();
}

// Gets the status of the farm.
function getFarmStatus(first=true) {
    if (!isDashboardShowing())
        return;

    // Update colors of the values being refreshed.
    loadingStationsStatus = true;
    updateLoadingStatus();

    $.post(
        "../ajax/get_farm_status",
        JSON.stringify({
            "controller_id": getControllerID(),
            "first": first
        }),
        function(data) {
            if (!isDashboardShowing())
                return;
            processFarmStatusResponse(data, first);
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Processes the response of the farm status request.
function processFarmStatusResponse(response, first) {
    if (first) {
        $(".weather-button").click(function() {
            updateCurrentWeather();
        });
        drawDevices(response);
        updateWeatherWidget();
    }
    updateStationsStatus(response);
    updateStationCounters(response);
    updateWeatherStation(response);
    updateWaterTank(response);
    updateCurrentWeather();

    // Hide the station loading.
    loadingStationsStatus = false;
    updateLoadingStatus();

    // Repeat the task every 30 seconds.
    setTimeout(function() {
        getFarmStatus(false);
    }, REFRESH_INTERVAL);
}

// Draws the markers for the stations and main controller.
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

        // Hide the station loading.
        loadingStationsStatus = false;
        updateLoadingStatus();

        return;
    }

    // Get the list of devices from the JSON response.
    irrigationControllers = response[ID_CONTROLLERS];
    stations = response[ID_STATIONS];

    // Check if the lists are empty.
    if ((irrigationControllers == null || irrigationControllers.length == 0) && (stations == null || stations.length == 0)) {
        // Hide the loading panel of the map.
        $("#map-loading").hide();

        // Show at least fake values for the weather widget if no stations appear.
        updateWeatherWidget();
        return;
    }

    // Create a marker for the main controller.
    for (let controller of irrigationControllers) {
        if (!controller["is_main"])
            continue;

        let controller_location = {
            lat: controller["location"][0],
            lng: controller["location"][1]
        };
        let marker = new MarkerWithLabel({
            position     : controller_location,
            map          : map,
            icon         : weatherStationMarker,
            draggable    : false,
            labelContent : "CONTROLLER",
            labelClass   : "map-marker",
            labelAnchor  : new google.maps.Point(0, -5),
            zIndex       : markersZIndex,
        });

        markersZIndex++;

        // Extend the bounds to include the marker's position.
        bounds.extend(marker.position);

        // Create an info window.
        let infoWindowContent = getControllerInfoWindowContent();
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.addListener("domready", updateLoadingStatus);
        infoWindow.setZIndex(markersZIndex);

        // Save the info window.
        controllerWindow = infoWindow;

        // Save the marker.
        controllerMarker = marker;

        // Add a click listener to toggle the info window.
        marker.addListener("click", () => {
            marker.setZIndex(markersZIndex);
            infoWindow.setZIndex(markersZIndex);
            markersZIndex++;
            toggleControllerInfoWindow();
        });
    }

    // Create a marker for each station.
    for (let station of stations) {
        let station_location = {
            lat: station["location"][0],
            lng: station["location"][1]
        };
        let marker = new MarkerWithLabel({
            position     : station_location,
            map          : map,
            icon         : stationMarker,
            draggable    : false,
            labelContent : station["name"].toUpperCase(),
            labelClass   : "map-marker",
            labelAnchor  : new google.maps.Point(0, -5),
            zIndex       : markersZIndex,
        });

        markersZIndex++;

        // Extend the bounds to include each marker's position.
        bounds.extend(marker.position);

        // Create an info window.
        let infoWindowContent = getStationInfoWindowContent(station["address"]);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.addListener("domready", updateLoadingStatus);
        infoWindow.setZIndex(markersZIndex);

        // Add the info window to the windows dictionary.
        stationWindows[station["address"]] = infoWindow;

        // Add the marker to the markers dictionary.
        stationMarkers[station["address"]] = marker;

        // Add a click listener to toggle the info window.
        marker.addListener("click", () => {
            // Do not open the info window if the station is offline.
            if (marker.getIcon().url == stationOfflineMarker.url)
                return;
            marker.setZIndex(markersZIndex);
            stationWindows[station["address"]].setZIndex(markersZIndex);
            markersZIndex++;
            toggleInfoWindow(station["address"]);
        });
    }

    // Fit the map to the newly inclusive bounds.
    centerStations();

    // Hide the loading panel of the map.
    hidePopup($(".map-loading-wrapper"), $("#popup-loading-map"));
}

// Updates the status of the stations based on the given response.
function updateStationsStatus(response) {
    if (response[ID_STATUS] == null || response[ID_STATUS][ID_STATIONS] == null)
        return;

    let stationsStatus = response[ID_STATUS][ID_STATIONS];

    // Update the status of each irrigation station.
    for (let stationID in stationsStatus) {
        // Add the values to the corresponding dictionaries.
        stationTemperatures[stationID] = stationsStatus[stationID][ID_TEMPERATURE];
        stationMoistures[stationID] = stationsStatus[stationID][ID_MOISTURE];
        stationBatteries[stationID] = stationsStatus[stationID][ID_BATTERY];
        stationValves[stationID] = stationsStatus[stationID][ID_VALVE];

        // Update the valve marker and button.
        updateValveValue(stationID);

        // Update the station temperature.
        let stationTempElement = document.getElementById(stationID + "-TEMPERATURE");
        if (stationTempElement != null)
            stationTempElement.innerText = stationsStatus[stationID][ID_TEMPERATURE];

        // Update the station moisture.
        let stationMoistureElement = document.getElementById(stationID + "-MOISTURE");
        if (stationMoistureElement != null)
            stationMoistureElement.innerText = stationsStatus[stationID][ID_MOISTURE];

        // Update the station battery.
        let stationBatteryElement = document.getElementById(stationID + "-BATTERY");
        if (stationBatteryElement != null)
            stationBatteryElement.innerText = stationsStatus[stationID][ID_BATTERY];
    }

    // Update the marker icons.
    for (let station in stationMarkers) {
        let marker = stationMarkers[station];
        if (station in stationsStatus) {
            if (isValveON(station))
                marker.setIcon(stationIrrigatingMarker);
            else
                marker.setIcon(stationMarker);
        } else {
            marker.setIcon(stationOfflineMarker);
        }
    }
}

// Updates the station counters based on the given response.
function updateStationCounters(response) {
    let onlineStations = response[ID_STATIONS] != null ? response[ID_STATIONS].length : 0;

    // Update online stations.
    let stationsElement = document.getElementById("online-stations");
    if (stationsElement != null)
        stationsElement.innerText = onlineStations;

    // Update irrigating stations.
    let irrigatingStationsElement = document.getElementById("irrigating-stations");
    if (irrigatingStationsElement != null)
        irrigatingStationsElement.innerText = getIrrigatingStationsNum();
}

// Updates the weather station information based on the given response.
function updateWeatherStation(response) {
    if (response[ID_STATUS] == null || response[ID_STATUS][ID_WEATHER] == null)
        return;

    let weatherStationStatus = response[ID_STATUS][ID_WEATHER];

    // Update the wind value.
    controllerWind = weatherStationStatus[ID_WIND];
    let controllerWindElement = document.getElementById(ID_WIND);
    if (controllerWindElement != null)
        controllerWindElement.innerText = weatherStationStatus[ID_WIND];
    let controllerWindInfowElement = document.getElementById("infow-wind");
    if (controllerWindInfowElement != null)
        controllerWindInfowElement.innerText = weatherStationStatus[ID_WIND];

    // Update the rain value.
    controllerRain = weatherStationStatus[ID_RAIN];
    let controllerRainElement = document.getElementById(ID_RAIN);
    if (controllerRainElement != null)
        controllerRainElement.innerText = weatherStationStatus[ID_RAIN];
    let controllerRainInfowElement = document.getElementById("infow-rain");
    if (controllerRainInfowElement != null)
        controllerRainInfowElement.innerText = weatherStationStatus[ID_RAIN];

    // Update the radiation value.
    controllerRadiation = weatherStationStatus[ID_RADIATION];
    let controllerRadiationElement = document.getElementById(ID_RADIATION);
    if (controllerRadiationElement != null)
        controllerRadiationElement.innerText = weatherStationStatus[ID_RADIATION];
    let controllerRadiationInfowElement = document.getElementById("infow-radiation");
    if (controllerRadiationInfowElement != null)
        controllerRadiationInfowElement.innerText = weatherStationStatus[ID_RADIATION];
}

// Updates the water tank information based on the given response.
function updateWaterTank(response) {
    if (response[ID_STATUS] == null || response[ID_STATUS][ID_TANK] == null)
        return;

    let waterTankStatus = response[ID_STATUS][ID_TANK];

    // Update the water tank level value.
    let controllerLevelElement = document.getElementById(ID_LEVEL);
    if (controllerLevelElement != null) {
        waterLevel = parseFloat(waterTankStatus[ID_LEVEL]).toFixed(1);
        controllerLevelElement.innerText = waterLevel;
        updateWaterTankLevel(waterLevel);
    }

    // Update the water tank valve value.
    tankValve = parseFloat(waterTankStatus[ID_VALVE]);
    updateTankValveStatus();
}

// Shows or hides the info window corresponding to the station with the given ID.
function toggleInfoWindow(stationID) {
   let infoWindow = stationWindows[stationID];
   if (infoWindow != null) {
       let infoWindowMap = infoWindow.getMap();
       if (infoWindowMap !== null && typeof infoWindowMap !== "undefined") {
           infoWindow.close();
       } else if (stationMarkers[stationID] != null) {
           infoWindow.setContent(getStationInfoWindowContent(stationID));
           infoWindow.open(map, stationMarkers[stationID]);
       }
   }
}

// Shows or hides the info window corresponding to the controller.
function toggleControllerInfoWindow() {
   if (controllerWindow != null) {
       let infoWindowMap = controllerWindow.getMap();
       if (infoWindowMap !== null && typeof infoWindowMap !== "undefined") {
           controllerWindow.close();
       } else if (controllerMarker != null) {
           controllerWindow.setContent(getControllerInfoWindowContent());
           controllerWindow.open(map, controllerMarker);
       }
   }
}

// Updates the color of the station values depending on if they are being loaded or not.
function updateLoadingStatus() {
    for (let element of document.getElementsByClassName("marker-info-value")) {
        if (loadingStationsStatus && !element.classList.contains(CLASS_STATUS_LOADING))
            element.classList.add(CLASS_STATUS_LOADING);
        else if (!loadingStationsStatus && element.classList.contains(CLASS_STATUS_LOADING))
            element.classList.remove(CLASS_STATUS_LOADING);
    }

    // Update valve buttons status.
    if (stations != null) {
        for (let station of stations) {
            let stationID = station["address"];
            updateValveButton(stationID, loadingStationsStatus);
        }
    }

    // Show or hide the map status element.
    let mapStatusElement = document.getElementById("stations-map-status");
    if (mapStatusElement == null)
        return;
    if (loadingStationsStatus)
        mapStatusElement.style.display = "block";
    else
        mapStatusElement.style.display = "none";
}

// Generates and returns the content of the information window for the station with the given ID.
function getStationInfoWindowContent(stationID) {
    // Clone the content template.
    let content = INFO_WINDOW_CONTENT;
    // Update the IDs of the information window.
    content = content.replace(/@@ID@@/g, stationID);
    // Set the information window title.
    content = content.replace("@@TITLE@@", getStationName(stationID).toUpperCase());
    // Update the temperature value.
    if (stationTemperatures[stationID] != null)
        content = content.replace("@@TEMPERATURE@@", stationTemperatures[stationID]);
    else
        content = content.replace("@@TEMPERATURE@@", "-");
    // Update the moisture value.
    if (stationMoistures[stationID] != null)
        content = content.replace("@@MOISTURE@@", stationMoistures[stationID]);
    else
        content = content.replace("@@MOISTURE@@", "-");
    // Update the battery value.
    if (stationBatteries[stationID] != null)
        content = content.replace("@@BATTERY@@", stationBatteries[stationID]);
    else
        content = content.replace("@@BATTERY@@", "-");
    // Update the valve button class.
    if (isValveON(stationID)) {
        content = content.replace("@@BUTTON-OFF-CLASS@@", "");
        content = content.replace("@@BUTTON-VALUE@@", "Open");
    } else {
        content = content.replace("@@BUTTON-OFF-CLASS@@", CLASS_BUTTON_STATUS_OFF);
        content = content.replace("@@BUTTON-VALUE@@", "Closed");
    }

    return content;
}

// Generates and returns the content of the information window for the main controller.
function getControllerInfoWindowContent() {
    // Clone the content template.
    let content = INFO_WINDOW_CONTENT_CONTROLLER;
    // Update the wind value.
    if (controllerWind != null)
        content = content.replace("@@WIND@@", controllerWind);
    else
        content = content.replace("@@WIND@@", "-");
    // Update the rain value.
    if (controllerRain != null)
        content = content.replace("@@RAIN@@", controllerRain);
    else
        content = content.replace("@@RAIN@@", "-");
    // Update the radiation value.
    if (controllerRadiation != null)
        content = content.replace("@@RADIATION@@", controllerRadiation);
    else
        content = content.replace("@@RADIATION@@", "-");

    return content;
}

// Returns the name of the station with the given ID.
function getStationName(stationID) {
    for (let station of stations) {
        if (station["address"] == stationID && station["name"] != null)
            return(station["name"]);
    }
    return "-";
}

// Returns whether the valve status of the station with the given ID is ON or OFF.
function isValveON(stationID) {
    if (stationValves[stationID] == null)
        return false;
    // Parse the valve status.
    let valveValue = parseFloat(stationValves[stationID]);
    return valveValue == 1.0;
}

// Sets the status of the irrigation station's valve with the provided ID.
function toggleValve(stationID) {
    // Do nothing if the station is offline.
    if (stationMarkers[stationID] != null && stationMarkers[stationID].getIcon().url == stationOfflineMarker.url)
        return;

    // Show the valve button loading panel.
    updateValveButton(stationID, true);

    // Get the new status of the valve to set.
    let valveStatus = "1";
    if (isValveON(stationID))
        valveStatus = "0";
    $.post(
        "../ajax/set_valve",
        JSON.stringify({
            "controller_id": getControllerID(),
            "station_id": stationID,
            "status": valveStatus
        }),
        function(data) {
            updateValveStatus(data, stationID);
            // Open the tank valve (if not already) when opening a station valve.
            if (isValveON(stationID) && !isTankValveON())
                toggleTankValve();
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Updates the status of the valve with the given ID.
function updateValveStatus(data, stationID) {
    // Get the new valve status.
    stationValves[stationID] = data["value"];

    // Update the valve button status.
    updateValveValue(stationID);
}

// Updates the marker and valve button of the station with the given ID.
function updateValveValue(stationID) {
    // Update the button.
    updateValveButton(stationID, loadingStationsStatus);

    // Update the marker icon.
    let marker = stationMarkers[stationID];
    if (marker != null) {
        if (isValveON(stationID))
            marker.setIcon(stationIrrigatingMarker);
        else
            marker.setIcon(stationMarker);
    }
}

// Updates the valve button of the station with the given ID.
function updateValveButton(stationID, loading) {
    let stationIDEscaped = stationID.replace(/:/g, "\\:").replace(/!/g, "\\!");
    let stationButtonElement = $("#" + stationIDEscaped + "-BUTTON");
    let stationButtonLoadingElement = $("#" + stationIDEscaped + "-BUTTON-LOADING");
    if (stationButtonElement == null || stationButtonElement.length == 0 ||
        stationButtonLoadingElement == null || stationButtonLoadingElement.length == 0)
        return;

    // Enable or disable the button.
    stationButtonElement.attr("disabled", loading);

    // Show or hide the loading panel.
    if (loading)
        stationButtonLoadingElement.show();
    else
        stationButtonLoadingElement.hide();

    // Update the button content.
    if (loading) {
        stationButtonElement.html("<i class='fas fa-circle-notch fa-spin'></i> Loading");
    } else {
        if (isValveON(stationID)) {
            stationButtonElement.html("Open");
            if (stationButtonElement.hasClass(CLASS_BUTTON_STATUS_OFF))
                stationButtonElement.removeClass(CLASS_BUTTON_STATUS_OFF);
        } else {
            stationButtonElement.html("Closed");
            if (!stationButtonElement.hasClass(CLASS_BUTTON_STATUS_OFF))
                stationButtonElement.addClass(CLASS_BUTTON_STATUS_OFF);
        }
    }
}

// Centers all the irrigation stations in the map.
function centerStations() {
    map.fitBounds(bounds);
}

// Shows or hides all the irrigation stations info windows.
function setInfoWindowsVisible(visible) {
    for (let station of stations) {
        let stationID = station["address"];
        let infoWindow = stationWindows[stationID];
        if (infoWindow != null) {
            if (visible) {
                infoWindow.setContent(getStationInfoWindowContent(stationID));
                infoWindow.open(map, stationMarkers[stationID]);
            } else {
                infoWindow.close();
            }
        }
    }
    if (controllerWindow != null) {
        if (visible) {
            controllerWindow.setContent(getControllerInfoWindowContent());
            controllerWindow.open(map, controllerMarker);
        } else {
            controllerWindow.close();
        }
    }
}

// Sets the graphic water level in the water tank to the given percentage.
function updateWaterTankLevel() {
    $("#water").height(waterLevel + "%");
    document.getElementById(ID_LEVEL).innerText = waterLevel;
    hidePopup($(".tank-img-loading-container"), $("#tank-spinner"));
}

// Refills the water tank.
function refillTank() {
    // Show loading icon on top of toggle.
    showPopup($(".tank-img-loading-container"), $("#tank-spinner"));
    document.getElementById(ID_LEVEL).innerText = "-";

    $.post(
        "../ajax/refill_tank",
        JSON.stringify({
            "controller_id": getControllerID()
        }),
        function(data) {
            waterLevel = data["value"];
            updateWaterTankLevel();
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Updates the status of the tank valve toggle button.
function updateTankValveStatus() {
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
            "controller_id": getControllerID(),
            "status": valveStatus
        }),
        function(data) {
            tankValve = data["value"];
            updateTankValveStatus();
            // Close all station valves when closing the tank valve.
            if (!isTankValveON()) {
                for (var addr in stationMarkers) {
                    if (isValveON(addr))
                        toggleValve(addr)
                }
            }
        }
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Returns the number of irrigating stations.
function getIrrigatingStationsNum() {
    let num_irrigating = 0;
    // Get number of irrigating stations based on data from the map.
    for (let station_id in stationValves) {
        if (isValveON(station_id))
            num_irrigating++;
    }
    return num_irrigating;
}

// Updates the weather widget with information of the current stations and the simulation data.
function updateWeatherWidget() {
    updateCurrentWeather();
    updateForecast();
}

// Updates the current weather data (icon, temperature and status).
function updateCurrentWeather() {
    // Calculate average temperature.
    calculateAvgTemp();

    // Identify the current weather icon to use.
    currentWeatherIcon = SUN_GREEN;
    currentWeatherStatus = "sunny";
    if ($("#weather-rainy-logo").hasClass("selected-icon-widget")) {
        currentWeatherIcon = RAIN_GREEN;
        currentWeatherStatus = "rainy";
    } else if ($("#weather-cloudy-logo").hasClass("selected-icon-widget")) {
        currentWeatherIcon = CLOUD_GREEN;
        currentWeatherStatus = "cloudy";
    }

    // Update current weather icon.
    let currentWeather = document.getElementById("current-weather");
    if (currentWeather != null)
        currentWeather.innerHTML = currentWeatherIcon;

    // Update current temperature.
    let currentTemp = document.getElementById("current-temp");
    if (currentTemp != null)
        currentTemp.innerText = avgTemp;

    // Update current weather status.
    let currentStatus = document.getElementById("current-status");
    if (currentStatus != null)
        currentStatus.innerText = currentWeatherStatus;
}

// Updates the forecast data for the next 3 days (emulated).
function updateForecast() {
    let currentDay = new Date().getDay();

    let prevWeatherIcon = currentWeatherIcon;
    let newAvgTemp = avgTemp;
    let fixedDelta = 5;

    // Update the info.
    for (let i = 1; i < 4; i++) {
        // Update the name of the days.
        let day = document.getElementById("day-" + i + "-name");
        if (day != null) {
            let nextDay = currentDay + i;
            if (nextDay >= WEEK_DAYS.length)
                day.innerText = WEEK_DAYS[nextDay - WEEK_DAYS.length];
            else
                day.innerText = WEEK_DAYS[nextDay];
        }

        // Update the weather icon.
        let weather = document.getElementById("day-" + i + "-weather");
        let weatherIcon = WEATHER_ICONS[Math.floor(Math.random() * WEATHER_ICONS.length)];
        if (weather != null)
            weather.innerHTML = weatherIcon;

        // Calculate temperature values.
        let deltas = calculateTempDeltas(prevWeatherIcon, weatherIcon);

        // Update max temperature.
        let maxTemp = document.getElementById("day-" + i + "-max");
        if (maxTemp != null) {
            let max = newAvgTemp + deltas["max"] + fixedDelta;
            let min = newAvgTemp + fixedDelta;
            if (max < min)
                maxTemp.innerText = randomNumber(max, min);
            else
                maxTemp.innerText = randomNumber(min, max);
        }

        // Update min temperature.
        let minTemp = document.getElementById("day-" + i + "-min");
        if (minTemp != null) {
            let max = newAvgTemp - fixedDelta;
            let min = newAvgTemp + deltas["min"] - fixedDelta;
            if (max < min)
                minTemp.innerText = randomNumber(max, min);
            else
                minTemp.innerText = randomNumber(min, max);
        }

        prevWeatherIcon = weatherIcon;
        newAvgTemp = ((newAvgTemp + deltas["max"]) + (newAvgTemp + deltas["min"])) / 2;
    }
}

// Function to generate random number
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Calculates the average temperature for the farm based on the temperatures
// reported by the irrigation stations.
function calculateAvgTemp() {
    let sumTempValues = 0;
    let numTempSensors = Object.keys(stationTemperatures).length;
    if (numTempSensors != 0) {
        for (let stationId in stationValves) {
            sumTempValues += stationTemperatures[stationId];
        }

        avgTemp = parseFloat((sumTempValues / numTempSensors).toFixed(1));
    }
}

// Calculates the temperature deltas based on the weather of the previous day
// and the weather for the day to calculate the temperature deltas for.
function calculateTempDeltas(prevWeatherIcon, weatherIcon) {
    let deltaTempMax, deltaTempMin;
    deltas = {};

    if (prevWeatherIcon == SUN_GRAY || prevWeatherIcon == SUN_GREEN) {
        if (weatherIcon == SUN_GRAY) {
            deltaTempMax = 5;
            deltaTempMin = -4;
        } else if (weatherIcon == CLOUD_GRAY) {
            deltaTempMax = 2;
            deltaTempMin = -6;
        } else {
            deltaTempMax = -5;
            deltaTempMin = -9;
        }
    } else if (prevWeatherIcon == CLOUD_GRAY || prevWeatherIcon == CLOUD_GREEN) {
        if (weatherIcon == SUN_GRAY) {
            deltaTempMax = 7;
            deltaTempMin = -3;
        } else if (weatherIcon == CLOUD_GRAY) {
            deltaTempMax = 2;
            deltaTempMin = -5;
        } else {
            deltaTempMax = -4;
            deltaTempMin = -7;
        }
    } else {
        if (weatherIcon == SUN_GRAY) {
            deltaTempMax = 11;
            deltaTempMin = -3;
        } else if (weatherIcon == CLOUD_GRAY) {
            deltaTempMax = 4;
            deltaTempMin = -4;
        } else {
            deltaTempMax = 2;
            deltaTempMin = -7;
        }
    }

    deltas["max"] = deltaTempMax;
    deltas["min"] = deltaTempMin;

    return deltas;
}

// Returns whether the dashboard page is showing or not.
function isDashboardShowing() {
    return window.location.pathname.indexOf("dashboard") > -1;
}

// Subscribes to any valve change.
function subscribeValves() {
    var farmName = new URLSearchParams(window.location.search).get("farm_name");

    // Create the web socket.
    var ws = new WebSocket("ws://" + window.location.host + "/ws/valves/" + farmName);

    // Define the callback to be notified when data is received in the web socket.
    ws.onmessage = function(e) {
        if (isDashboardShowing()) {
            var event = JSON.parse(e.data);
            var device = event["device"];
            // Update the status of the appropriate valve (tank or station).
            if (device == "tank") {
                tankValve = event["value"];
                updateTankValveStatus();
            } else {
                updateValveStatus(event, device);
            }
        }
    };
}