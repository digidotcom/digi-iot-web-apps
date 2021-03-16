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

var farmConnectionStatus = false;
var prevFarmConnectionStatus = true;

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
    $("#sections .selected").removeClass("selected");

    // Decorate the selected element.
    selectedItem.toggleClass("selected");
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
}

// Shows a popup in front of the given element.
function showPopup(element, popup) {
    if (!element.hasClass("element-grayed"))
        element.addClass("element-grayed");
    if (popup.hasClass("d-none"))
        popup.removeClass("d-none");
}

// Hides a showing popup placed in front of the given element.
function hidePopup(element, popup) {
    if (!popup.hasClass("d-none"))
        popup.addClass("d-none");
    if (element.hasClass("element-grayed"))
        element.removeClass("element-grayed");
}

// Requests an update on the connection status of the farm.
function checkFarmConnectionStatus() {
    $.post(
        "../ajax/check_farm_connection_status",
        JSON.stringify({
            "controller_id": getControllerID()
        }),
        updateFarmConnectionStatus
    );
}

// Updates the connection status of the farm.
function updateFarmConnectionStatus(response) {
    if (response["status"] != null) {
        let statusImage = "";
        let statusTitle = "";
        if (response["status"] == true) {
            // Get the connection status icon and title.
            statusImage = "../static/images/status_online.png";
            statusTitle = "Online";
        } else {
            // Get the connection status icon and title.
            statusImage = "../static/images/status_offline.png";
            statusTitle = "Offline";
        }
        // Update the connection status icon and title.
        let farmStatus = document.getElementById("farm-connection-status");
        if (farmStatus != null) {
            farmStatus.src = statusImage;
            farmStatus.title = statusTitle;
        }
        // Save the new connection status.
        farmConnectionStatus = response["status"];
    }

    checkFarmConnected();

    // Schedule a new connection status update in 30 seconds.
    setTimeout(checkFarmConnectionStatus, 30000);
}

// Checks farm connectivity.
function checkFarmConnected() {
    if (!farmConnectionStatus && prevFarmConnectionStatus != farmConnectionStatus)
        toastr.error("Farm is offline.");

    if (isDashboardShowing()) {
        // If the status of the farm is online remove the water tank popup
        // indicating that the interaction is not permitted because of the farm
        // being offline. Otherwise, add the popup.
        if (farmConnectionStatus)
            hidePopup($(".water-tank-card"), $("#popup-info-tank"));
        else
            showPopup($(".water-tank-card"), $("#popup-info-tank"));
    }
    prevFarmConnectionStatus = farmConnectionStatus;
}

// Processes the error response of the AJAX request.
function processErrorResponse(response) {
    if (response.status == 400) {
        let errorMessage = response.responseJSON["error"];
        // Show the error message (if any).
        if (errorMessage != null)
            toastr.error(errorMessage);
    } else if (response.status == 401) {
        redirectToLogin();
    }
}

// Redirects to the login page.
function redirectToLogin() {
    var url = "/access/login?dest=" + window.location.pathname.replaceAll("/", "");
    var params = new URLSearchParams(window.location.search);
    for (let param of params)
        url += "&" + param[0] + "=" + param[1];
    window.location.href = url;
}