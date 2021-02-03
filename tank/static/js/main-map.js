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
    "        @@TITLE@@" +
    "    </div>" +
    "    <hr/>" +
    "    <div class='marker-info-element'>" +
    "        <div class='marker-info-icon'>" +
    "            <img src='../static/images/info_devices.png' height='36px' alt='Status' />" +
    "        </div>" +
    "        <div class='marker-info-value @@STATUS-CLASS@@'>" +
    "            @@DEVICES@@ tanks" +
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
    "    <div class='marker-info-button-container' style='margin-top: 5px;'>" +
    "        <button id='@@NAME@@-BUTTON' class='marker-info-button' onclick=\"exploreInstallation('@@NAME@@')\">Explore</button>" +
    "        <div id='@@NAME@@-BUTTON-LOADING' class='marker-info-button-loading' style='display: none'>" +
    "    </div>" +
    "</div>";
const INSTALLATION_LIST_ENTRY = "" +
    "<div onclick='showInfoWindow(\"@@ID@@\")' class='installations-list-entry'>" +
    "    <div class='d-flex w-100 justify-content-start align-items-center'>" +
    "        <span class='digi-menu-icon fas fa-tint fa-fw fa-lg mr-3'></span>" +
    "        <span>@@NAME@@</span>" +
    "    </div>" +
    "</div>";

var map;

var installationMarkers = {};
var installationWindows = {};

var installations = {};

var markersZIndex = 0;

// Initialize and add the map.
function initMap() {
    // The location of Uluru.
    let uluru = {lat: -25.344, lng: 131.036};

    // The map, centered at Uluru.
    map_configuration = {
        zoom              : 5,
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
    }
    map = new google.maps.Map(document.getElementById("map"), map_configuration);
}

// Callback executed when the list of installations is requested.
function getTanksInstallationsCallback(response) {
    // First, check if there was any error in the request.
    if (response["error_msg"] != null) {
        // Show toast with error.
        toastr.error(response["error_msg"]);
        $("#info-title").text(response["error_title"]);
        $("#info-message").html(response["error_msg"] + response["error_guide"]);

        // Hide the loading panel of the map.
        hidePopup($(".map-loading-wrapper"), $(".popup-loading"));

        // Show help dialog.
        showPopup($(".map-loading-wrapper"), $(".popup-info"));
        return;
    }
    if (response["error"] != null) {
        // Show toast with error.
        toastr.error(response["error"]);
        $("#info-message").html(response["error"]);

        // Hide the loading panel of the map.
        hidePopup($(".map-loading-wrapper"), $(".popup-loading"));

        // Show help dialog.
        showPopup($(".map-loading-wrapper"), $(".popup-info"));
        return;
    }

    // Get the installations from the JSON response.
    let readInstallations = response["installations"];

    // Check if the list of installations contains any installation.
    if (readInstallations == null || readInstallations.length == 0)
        return;

    // Create empty LatLngBounds object.
    let bounds = new google.maps.LatLngBounds();

    // Create the installation marker icon.
    let installationMarkerIcon = {
        url: "static/images/map_marker.png",
        size: new google.maps.Size(52, 66),
        scaledSize: new google.maps.Size(52, 66),
        origin: new google.maps.Point(0, 0),
    };

    // Process installations.
    for (let installation of readInstallations) {
        // Add the installation to the dictionary.
        // TODO: Need better way to identify installation
        installations[installation["name"]] = installation;

        // Get installation location.
        let installationLocation = {
            lat: installation["location"][0],
            lng: installation["location"][1]
        };
        // Create a marker for the installation.
        let markerIcon = installationMarkerIcon;
        let marker = new MarkerWithLabel({
            position     : installationLocation,
            map          : map,
            icon         : markerIcon,
            draggable    : false,
            labelContent : installation["name"].toUpperCase(),
            labelClass   : "map-marker",
            labelAnchor  : new google.maps.Point(0, -5),
        });

        markersZIndex++;

        // Extend the bounds to include the marker's position.
        bounds.extend(marker.position);

        // Create an info window.
        let infoWindowContent = getInstallationInfoWindowContent(installation["name"]);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.setZIndex(markersZIndex);

        // Add the info window to the windows dictionary.
        installationWindows[installation["name"]] = infoWindow;

        // Add the marker to the markers dictionary.
        installationMarkers[installation["name"]] = marker;

        // Add a click listener to toggle the info window.
        marker.addListener("click", () => {
            marker.setZIndex(markersZIndex);
            installationWindows[installation["name"]].setZIndex(markersZIndex);
            markersZIndex++;
            toggleInfoWindow(installation["name"]);
        });

        // Add a new tanks installation entry to the list of installations.
        let installationDivContent = INSTALLATION_LIST_ENTRY;
        installationDivContent = installationDivContent.replaceAll("@@ID@@", installation["name"]);
        installationDivContent = installationDivContent.replaceAll("@@NAME@@", installation["name"].toUpperCase());
        let installationDiv = document.createElement("div");
        installationDiv.innerHTML = installationDivContent;
        $("#installations-list").append(installationDiv);
    }

    // Fit the map to the newly inclusive bounds.
    map.fitBounds(bounds);
    map.panToBounds(bounds);

    // Restore the zoom level after the map is done scaling.
    var listener = map.addListener("idle", () => {
        map.setZoom(5);
        google.maps.event.removeListener(listener);
    });

    // Hide the loading panel of the map.
    hidePopup($(".map-loading-wrapper"), $(".popup-loading"));
}

// Generates and returns the content of the information window for the installation with the given name.
function getInstallationInfoWindowContent(installationName) {
    let name = installations[installationName]["name"];
    let devices = installations[installationName]["num_devices"];
    let location = installations[installationName]["location"];

    // Clone the content template.
    let content = INFO_WINDOW_CONTENT;
    // Set the information window title and name references.
    content = content.replaceAll("@@TITLE@@", name.toUpperCase());
    // Set the name references.
    content = content.replaceAll("@@NAME@@", name);
    // Configure the number of devices.
    content = content.replaceAll("@@DEVICES@@", devices);
    // Configure the location.
    content = content.replaceAll("@@LOCATION@@", location[0] + "<br>" + location[1]);

    return content;
}

// Shows or hides the info window corresponding to the installation with the given name.
function toggleInfoWindow(installationName) {
   let infoWindow = installationWindows[installationName];
   if (infoWindow != null) {
       let infoWindowMap = infoWindow.getMap();
       if (infoWindowMap !== null && typeof infoWindowMap !== "undefined") {
           infoWindow.close();
       } else if (installationMarkers[installationName] != null) {
           infoWindow.setContent(getInstallationInfoWindowContent(installationName));
           infoWindow.open(map, installationMarkers[installationName]);
       }
   }
}

// Shows the info window of the installation with the given name.
function showInfoWindow(installationName) {
    let infoWindow = installationWindows[installationName];
    let marker = installationMarkers[installationName];
    if (infoWindow == null || installationMarkers[installationName] == null)
        return;

    // Pan to the marker location.
    let markerLoc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
    map.panTo(markerLoc);

    // Show the info window of the marker.
    infoWindow.setContent(getInstallationInfoWindowContent(installationName));
    infoWindow.open(map, installationMarkers[installationName]);
}

// Opens the dashboard of the installation with the given name.
function exploreInstallation(installationName) {
    // Disable the installation button.
    disableInstallationButton(installationName, true);

    // Load the dashboard of the installation.
    window.open("../dashboard/?installation_name=" + installationName, "_self");
}

// Disables the button of the installation with the given name.
function disableInstallationButton(installationName, loading) {
    let installationButtonElement = $("#" + installationName + "-BUTTON");
    let installationButtonLoadingElement = $("#" + installationName + "-BUTTON-LOADING");
    if (installationButtonElement == null || installationButtonElement.length == 0 ||
        installationButtonLoadingElement == null || installationButtonLoadingElement.length == 0)
        return;

    // Disable the button.
    installationButtonElement.attr("disabled", true);

    // Update the button content.
    if (loading)
        installationButtonElement.html("<i class='fas fa-circle-notch fa-spin'></i> Loading");

    // Show the loading panel.
    installationButtonLoadingElement.show();
}