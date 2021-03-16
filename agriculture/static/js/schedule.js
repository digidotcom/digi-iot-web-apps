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

const ERROR_GENERAL_TITLE = "Error"
const ERROR_OFFLINE_TITLE = "Farm offline";
const ERROR_OFFLINE_DESC = "Make sure the irrigation controller of your installation is connected to Internet.";

// Initializes the schedule.
function initSchedule() {
    // Disable the buttons.
    enableSaveButton(false);
    enableAddButton(false);

    // Validate the modal when any input control changes.
    $(".modal-input").on("change paste keyup", function() {
        validateModal();
    });

    var firstScheduleLoad = true;

    // Add a new cycle when the 'Add' button is clicked.
    $("#add-cycle").on("click", function() {
        var startTime = $("#start").val();
        var duration = $("#duration").val();

        if (!startTime || !duration)
            return;

        var valid = true;
        var rowAdded = false;

        $("#cycles-table tr").each(function(i, n) {
            if (i == 0)
                return;

            var currentTime = textToStart($(n)[0].firstElementChild.innerText);
            var newTime = textToStart(startTime);

            if (newTime == currentTime) {
                alert("An irrigation cycle with the entered start time already exists. Please remove it before adding a new one.");
                return valid = false;
            } else if (newTime < currentTime) {
                addRow(startTime, duration, i);
                rowAdded = true;
                return false;
            }
        });

        if (valid) {
            if (!rowAdded)
                addRow(startTime, duration);
            enableSaveButton(true);
            $("#add-cycle-modal").modal("hide");
        }
    });

    // Reset the modal when it is closed.
    $("#add-cycle-modal").on("hidden.bs.modal", function(e) {
        $("#start").val("");
        $("#duration").val("");
        enableAddButton(false);
    });

    // Remove the row when the 'Remove' button is clicked.
    $("#cycles-table").on("click", "#remove-button", function(e) {
        $(this).closest("tr").remove();
        enableSaveButton(true);
    });

    // Change the schedule when the 'Save' button is clicked.
    $("#save-schedule").on("click", function(e) {
        enableSaveButton(false);

        var $this = $(this);
        var loadingText = "<i class='fas fa-circle-notch fa-spin'></i> Saving...";
        if ($this.html() !== loadingText) {
          $this.data("original-text", $this.html());
          $this.html(loadingText);
        }

        e.preventDefault();
        $.post("/ajax/set_schedule", getJsonData(tableToJson()), function(response) {
            $this.html($this.data("original-text"));
        }).fail(function(response) {
            processErrorResponse(response);
        });
    });

    // Check the status of the farm to draw the stations charts or not.
    setTimeout(checkFarmStatusSchedule, 5000);
}

// Gets the irrigation schedule.
function getSchedule() {
    $.post("/ajax/get_schedule", getJsonData(), function(response) {
        try {
            // Get the schedule from the response.
            var sch = JSON.parse(response.data);
        } catch (e) {
            // The response received was an error, show it.
            let errorMsg = response["data"];
            if (errorMsg == null)
                return;

            toastr.error(errorMsg);
            $("#info-title").text(ERROR_GENERAL_TITLE);
            $("#info-message").html(errorMsg);
            showErrorPanel();
            return;
        }

        $.each(sch["schedule"], function(k, v) {
            addRow(startToText(v["start_time"]), durationToText(v["duration"]));
        });
        hideErrorPanel();
        hideLoadingPanel();
        // Show the schedule container.
        $("#schedule-container").show();
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Adds a row to the table with the give data.
function addRow(start, duration, index=-1) {
    var newRow = $("<tr>");
    var cols = "";

    cols += "<td>" + start + "</td>";
    cols += "<td>" + duration + " mins</td>";
    cols += "<td><button id='remove-button' class='btn widget-button' type='button'><img src='/static/images/remove.png' class='remove-logo' title='Remove'></button></td>";

    newRow.append(cols);

    if (index == -1)
        $("#cycles-table").append(newRow);
    else
        $("#cycles-table > tbody > tr").eq(index - 1).before(newRow);
}

// Enables or disables the 'Save' button.
function enableSaveButton(enable) {
    $("#save-schedule").attr("disabled", !enable);
}

// Enables or disables the 'Add' button.
function enableAddButton(enable) {
    $("#add-cycle").attr("disabled", !enable);
}

// Converts the irrigation table to JSON format.
function tableToJson() {
    var json = '{"schedule":';
    var rows = [];
    $("#cycles-table tr").each(function(i, n) {
        if (i == 0)
            return;
        var $row = $(n);
        rows.push({
            start_time: textToStart($row.find("td:eq(0)").text()),
            duration:   textToDuration($row.find("td:eq(1)").text())
        });
    });
    json += JSON.stringify(rows) + '}';
    return json;
}

// Converts the given text to start time in seconds.
function textToStart(text) {
    var time = text.split(":");
    return parseInt((+time[0]) * 60 * 60 + (+time[1]) * 60);
}

// Converts the given start time in seconds to text.
function startToText(sec_num) {
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10)
        hours = "0" + hours;
    if (minutes < 10)
        minutes = "0" + minutes;
    if (seconds < 10)
        seconds = "0" + seconds;
    var time = hours + ":" + minutes;
    if (seconds > 0)
        time += ":" + seconds;
    return time;
}

// Converts the given text to duration in seconds.
function textToDuration(text) {
    var mins = text.split(" ")[0];
    return mins * 60;
}

// Converts the given duration in seconds to text.
function durationToText(seconds) {
    return seconds / 60;
}

// Validates the irrigation cycle modal.
function validateModal() {
    var startTime = $("#start").val();
    var duration = $("#duration").val();

    enableAddButton(startTime && duration);
}

// Check if the farm is online to get the schedules table or not.
function checkFarmStatusSchedule() {
    if (!isScheduleShowing())
        return;

    // Get the schedule if the farm is online and it is not already displayed.
    // Otherwise show the farm offline error.
    if (farmConnectionStatus) {
        if (!$("#schedule-container").is(":visible") || firstScheduleLoad) {
            firstScheduleLoad = false;
            hideErrorPanel();
            getSchedule();
        }
    } else {
        $("#info-title").text(ERROR_OFFLINE_TITLE);
        $("#info-message").html(ERROR_OFFLINE_DESC);
        showErrorPanel();
    }
    // Reschedule the connection status check.
    setTimeout(checkFarmStatusSchedule, 15000);
}

// Returns whether the history page is showing or not.
function isScheduleShowing() {
    return window.location.pathname.indexOf("schedule") > -1;
}

// Shows the error panel.
function showErrorPanel() {
    hideLoadingPanel();
    // Show error dialog.
    showPopup($(".map-loading-wrapper"), $(".popup-info"));
    // Hide the schedule container.
    $("#schedule-container").hide();
}

// Hides the error panel.
function hideErrorPanel() {
    showLoadingPanel();
    // Hide error dialog.
    hidePopup($(".map-loading-wrapper"), $(".popup-info"));
}

// Shows the loading panel.
function showLoadingPanel() {
    // Show the loading panel of the map.
    showPopup($(".map-loading-wrapper"), $(".popup-loading"));
}

// Hides the loading panel.
function hideLoadingPanel() {
    // Hide the loading panel of the map.
    hidePopup($(".map-loading-wrapper"), $(".popup-loading"));
}