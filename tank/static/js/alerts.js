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

const LOADING = "<i class='fas fa-circle-notch fa-spin'></i>";

var tanks = [];
var definitions = {};

// Initializes the schedule.
function initAlerts() {
    // Disable the 'Add' button.
    enableAddButton(false);

    // Validate the modal when any input control changes.
    $(".modal-input").on("change paste keyup", function() {
        var threshold = $("#threshold").val();
        enableAddButton(threshold && threshold > 0 && threshold < 100 && !isThresholdUsed(threshold));
    });

    // Reset the modal when it is closed.
    $("#configure-alerts-modal").on("hidden.bs.modal", function(e) {
        // Reset the modal form.
        $("#threshold").val("");
        $("#auto-reset").prop("checked", true);
        $("#add-alert").html("Add");
        enableAddButton(false);
    });

    // Reset the alert when the 'Reset' button is clicked.
    $("#alerts-table").on("click", "#reset-button", function(e) {
        var button = $(this);
        var row = button.closest("tr")[0];
        var alertId = row.id;
        var tankId = row.children[1].innerHTML;

        // Disable the button and show a spinner.
        button.attr("disabled", true);
        button.html(LOADING);

        // Reset the given alert.
        $.post("/ajax/reset_alert", getJsonData(alertId, tankId), function(response) {
            // Remove the row.
            removeAlertRow(alertId);
        }).fail(function(response) {
            processErrorResponse(response);
        });
    });

    // Remove the alert definition when the 'Remove' button is clicked.
    $("#alerts-definition-table").on("click", "#remove-button", function(e) {
        var button = $(this);
        var row = button.closest("tr")[0];
        var alertId = row.id;
        var threshold = row.children[0].innerHTML;

        // Disable the button and show a spinner.
        button.attr("disabled", true);
        button.html(LOADING);

        // Remove the given alert definition.
        $.post("/ajax/remove_alert_definition", getJsonData(alertId), function(response) {
            // Remove the definition from the list.
            delete definitions[alertId];
            // Remove the row.
            button.closest("tr").remove();
            // If this was the last row, show the placeholder text.
            if ($("#alerts-definition-table tbody tr").length == 1)
                $("#alerts-definition-table tbody tr:first").show();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    });

    // Create an alert definition when the 'Add' button is clicked.
    $("#add-alert").on("click", function() {
        var button = $(this);
        var newThreshold = $("#threshold").val();
        var autoReset = $("#auto-reset").is(":checked");
        var data = '{"threshold": ' + newThreshold + ', "reset": ' + autoReset + '}'

        // Disable the button and show a spinner.
        button.attr("disabled", true);
        button.html(LOADING);

        // Create the alert definition.
        $.post("/ajax/create_alert_definition", getJsonData(data), function(response) {
            $("#configure-alerts-modal").modal("hide");
            addAlertDefinitionRow(response);
            toastr.success("Alert definition added successfully");
        }).fail(function(response) {
            processErrorResponse(response);
        });
    });

    // Get the alerts.
    $.post("/ajax/get_alerts", getJsonData(), function(response) {
        // Store the tanks.
        tanks = response.data.tanks;

        // Process the alert definitions.
        $.each(response.data.definitions, function(k, v) {
            addAlertDefinitionRow(v);
        });

        // Process the alerts.
        $.each(response.data.alerts, function(k, v) {
            addAlertRow(v);
        });

        // Hide the 'new alerts' badge.
        $("#new-alerts").hide();

        hideLoadingPanel();

        // Show the alerts container.
        $("#alerts-container").show();
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Adds the given alert to the corresponding table.
function addAlertRow(alert) {
    $("#alerts-table tbody tr:first").hide();

    var alertId = alert["id"];
    var tankId = alert["tank_id"];
    var tankName = alert["tank_name"];
    if (tankName === undefined)
        tankName = getTankName(tankId);
    var description = alert["description"];
    if (description === undefined)
        description = getAlertDefinitionDescription(alertId);

    var newRow = $('<tr id="' + alertId + '">');
    var cols = "";

    cols += "<td>" + tankName + "</td>";
    cols += "<td>" + tankId + "</td>";
    cols += "<td>" + new Date(alert["last_update"]).toLocaleString() + "</td>";
    cols += "<td>" + description + "</td>";
    cols += "<td>" +
        "<button id='reset-button' type='button' class='btn btn-primary'>Reset</button>" +
        "</td>";

    newRow.append(cols);
    $("#alerts-table").append(newRow);
}

// Removes the alert row with the given ID.
function removeAlertRow(alertId) {
    $("#alerts-table tr#" + alertId).remove();
    // If this was the last row, show the placeholder text.
    if ($("#alerts-table tbody tr").length == 1)
        $("#alerts-table tbody tr:first").show();
}

// Adds the given alert definition to the corresponding table.
function addAlertDefinitionRow(definition) {
    $("#alerts-definition-table tbody tr:first").hide();

    var alertId = definition["id"];
    var threshold = definition["threshold"];

    var newRow = $('<tr id="' + alertId + '">');
    var cols = "";

    cols += "<td>" + threshold + "%</td>";
    cols += "<td><button id='remove-button' class='btn widget-button' type='button'><img src='/static/images/remove.png' class='remove-logo' title='Remove'></button></td>";

    newRow.append(cols);
    $("#alerts-definition-table").append(newRow);

    definitions[alertId] = definition;
}

// Returns the description of the alert definition with the given ID.
function getAlertDefinitionDescription(alertId) {
    for (let defId in definitions) {
        if (defId == alertId)
            return definitions[defId]["description"];
    }
    return "";
}

// Returns whether the given threshold is already in use.
function isThresholdUsed(threshold) {
    for (let defId in definitions) {
        if (definitions[defId]["threshold"] == threshold)
            return true;
    }
    return false;
}

// Shows the loading panel.
function showLoadingPanel() {
    // Show the loading panel.
    showPopup($(".alerts-body"), $(".popup-loading"));
}

// Hides the loading panel.
function hideLoadingPanel() {
    // Hide the loading panel.
    hidePopup($(".alerts-body"), $(".popup-loading"));
}

// Enables or disables the 'Add' button.
function enableAddButton(enable) {
    $("#add-alert").attr("disabled", !enable);
}

// Returns whether the alerts page is showing or not.
function isAlertsShowing() {
    return window.location.pathname.indexOf("alerts") > -1;
}