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

var currentTime;
var currentTimeFactor;
var timeWorker;

// Sets the new weather condition.
function setWeatherCondition(e) {
    e.preventDefault();

    var selected = $(this).attr("value");
    selectWeatherIcon(selected);

    $.post("/ajax/set_condition", getJsonData(selected)).fail(function(response) {
        // If the operation fails, get the real condition.
        getWeatherCondition();
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Gets the current weather condition.
function getWeatherCondition() {
    var data = getJsonData();

    $.post("/ajax/get_condition", getJsonData(), function(response) {
        var resp = response["data"];
        selectWeatherIcon(resp);
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Sets the new time factor.
function setTimeFactor(e) {
    e.preventDefault();

    var selected = $(this).attr("value");
    selectTimeIcon(selected);

    timeWorker.terminate();
    currentTimeFactor = parseInt(selected);
    getCurrentTime();

    $.post("/ajax/set_factor", getJsonData(selected)).fail(function(response) {
        // If the operation fails, get the real factor.
        getTimeFactor();
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Gets the current time factor.
function getTimeFactor() {
    $.post("/ajax/get_factor", getJsonData(), function(response) {
        currentTimeFactor = parseInt(response["data"]);
        if (!isNaN(currentTimeFactor)) {
            selectTimeIcon(currentTimeFactor);
            getCurrentTime();
        }
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Gets the current time.
function getCurrentTime() {
    $.post("/ajax/get_time", getJsonData(), function(response) {
        currentTime = parseInt(response["data"]);
        if (!isNaN(currentTime)) {
            timeWorker = new Worker("/static/js/simple-timer.js");
            timeWorker.onmessage = function (event) {
                document.getElementById("current-time").innerHTML = event.data;
            };
            timeWorker.postMessage(currentTime + "@@@" + currentTimeFactor);
        }
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Marks the weather icon with the given value as selected.
function selectWeatherIcon(value) {
    unselectWeatherIcons();
    if (value == document.getElementById("weather-sunny").value)
        $("#weather-sunny-logo").addClass("selected-icon-widget");
    else if (value == document.getElementById("weather-cloudy").value)
        $("#weather-cloudy-logo").addClass("selected-icon-widget");
    else if (value == document.getElementById("weather-rainy").value)
        $("#weather-rainy-logo").addClass("selected-icon-widget");
}

// Unselects all the weather icons.
function unselectWeatherIcons() {
    $(".weather-icon").removeClass("selected-icon-widget");
}

// Marks the time icon with the given value as selected.
function selectTimeIcon(value) {
    unselectTimeIcons();
    if (value == document.getElementById("time-1").value)
        $("#time-speed1-logo").addClass("selected-icon-widget");
    else if (value == document.getElementById("time-2").value)
        $("#time-speed2-logo").addClass("selected-icon-widget");
    else if (value == document.getElementById("time-3").value)
        $("#time-speed3-logo").addClass("selected-icon-widget");
}

// Unselects all the time icons.
function unselectTimeIcons() {
    $(".time-icon").removeClass("selected-icon-widget");
}

// Gets the AJAX data in JSON format.
function getJsonData(data=null, macAddr=null) {
    var controllerId = new URLSearchParams(window.location.search).get("controller_id");
    var json = {}

    json["controller_id"] = controllerId;
    if (data != null)
        json["data"] = data;
    if (macAddr != null)
        json["mac_addr"] = macAddr;
    return json;
}