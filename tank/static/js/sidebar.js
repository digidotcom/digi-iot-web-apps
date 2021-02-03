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

subscribeAlerts();

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
    if (element != null && !element.hasClass("element-grayed"))
        element.addClass("element-grayed");
    if (popup.hasClass("d-none"))
        popup.removeClass("d-none");
}

// Hides a showing popup placed in front of the given element.
function hidePopup(element, popup) {
    if (!popup.hasClass("d-none"))
        popup.addClass("d-none");
    if (element != null && element.hasClass("element-grayed"))
        element.removeClass("element-grayed");
}

// Gets the AJAX data in JSON format.
function getJsonData(data=null, devId=null) {
    var installationName = new URLSearchParams(window.location.search).get("installation_name");
    var json = {}

    json["installation_name"] = installationName;
    if (data != null)
        json["data"] = data;
    if (devId != null)
        json["tank_id"] = devId;
    return json;
}

// Subscribes to any alert change.
function subscribeAlerts() {
    var installationName = new URLSearchParams(window.location.search).get("installation_name");

    // Create the web socket.
    var ws = new WebSocket("ws://" + window.location.host + "/ws/alerts/" + installationName);

    // Define the callback to be notified when data is received in the web socket.
    ws.onmessage = function(e) {
        var alert = JSON.parse(e.data);
        var isFired = alert["status"] == 1;

        // If the alerts page is showing, add/remove the alert to the table.
        // Otherwise, show the 'new alerts' badge in the sidebar.
        if (isAlertsShowing()) {
            if (isFired)
                addAlertRow(alert);
            else
                removeAlertRow(alert["id"]);
        } else if (isFired) {
            $("#new-alerts").show();

            // Configure the notification to redirect to the alerts page when clicked.
            toastr.options.onclick = function() {
                var params = new URLSearchParams(window.location.search).toString();
                if (params) {
                    $.pjax({url: "/alerts/?" + params, container: '#pjax-container'});
                    setSelectedSection();
                }
                toastr.options.onclick = null;
            }
            toastr.options.onHidden = function() {
                toastr.options.onclick = null;
            }
        }

        // Show a notification if the alert was fired.
        if (isFired)
            toastr.warning("New alert fired for tank " + alert["tank_id"]);
    };
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
