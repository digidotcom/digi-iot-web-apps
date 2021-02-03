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

const TANK_CHART_HTML = "" +
    "<div class='row justify-content-lg-center'>" +
    "   <div class='col-lg-12 col-xl-12'>" +
    "       <div class='card shadow-sm'>" +
    "           <div class='card-body'>" +
    "               <h5 class='card-title'>Historic data: @@TANK_NAME@@</h5>" +
    "               <div class='row'>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-water fa-2x mr-3'></span>" +
    "                           <span>Water level</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='level-@@TANK_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='level-@@TANK_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='level-@@TANK_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='level-@@TANK_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='level-@@TANK_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='level-@@TANK_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-thermometer-half fa-2x mr-3'></span>" +
    "                           <span>Temperature</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='temperature-@@TANK_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='temperature-@@TANK_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='temperature-@@TANK_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@TANK_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@TANK_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@TANK_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-faucet fa-2x mr-3'></span>" +
    "                           <span>Valve status</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='valve-@@TANK_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='valve-@@TANK_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='valve-@@TANK_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@TANK_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@TANK_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@TANK_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "               </div>" +
    "           </div>" +
    "       </div>" +
    "   </div>" +
    "</div>";

var levelData = {};
var temperatureData = {};
var valveData = {};

var levelInterval = {};
var temperatureInterval = {};
var valveInterval = {};

// Initializes the charts.
function initCharts() {
    // Reset the variables.
    levelData = {};
    temperatureData = {};
    valveData = {};

    levelInterval = {};
    temperatureInterval = {};
    valveInterval = {};

    // Check the status of the installation to draw the tanks charts or not.
    checkInstallationStatusHistory();

    // Draw all the charts.
    drawAllCharts(true, true);
}

// Check if the installation is online to draw its tanks charts or not.
function checkInstallationStatusHistory() {
    // Draw the charts of every tank if the installation is online, otherwise
    // schedule a new check in 15 seconds.
    // TODO: remove this when the connection status mechanism is implemented.
    var installationConnectionStatus = true;
    if (installationConnectionStatus)
        drawTanksCharts();
    else
        setTimeout(checkInstallationStatusHistory, 15000);
}

// Draws all the charts.
function drawAllCharts(refresh=false, showProgress=true) {
    if (!isHistoryShowing())
        return;

    for (devId in levelData) {
        drawLevelChart(devId, refresh, showProgress);
        drawTemperatureChart(devId, refresh, showProgress);
        drawValveChart(devId, refresh, showProgress);
    }

    // Repeat the task every minute.
    setTimeout(function() {
        drawAllCharts(true, false);
    }, 60000);
}

// Draws the charts of the tanks.
function drawTanksCharts() {
    $.post("/ajax/get_tanks", getJsonData(), function(response) {
        var html = "";
        var tanks = response["tanks"];
        let errorTitle = response["error_title"];

        if (errorTitle != null)
            toastr.error(errorTitle);
        if (tanks == null)
            return;

        for (var tank of tanks) {
            html += getTankChartsHtml(tank["name"], tank["dev_id"]);
            html += "\n";
        }
        $("#tanks-cards").html(html);

        for (var tank of tanks) {
            var devId = tank["dev_id"];
            registerIntervalCallbacks(devId);
            drawLevelChart(devId, true, true);
            drawTemperatureChart(devId, true, true);
            drawValveChart(devId, true, true);
        }
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Registers the callbacks for the tanks charts interval buttons.
function registerIntervalCallbacks(devId) {
    $("input[type=radio][name=level-" + devId + "-interval]").change(function() {
        levelInterval[devId] = this.value;
        drawLevelChart(devId, true, true);
    });

    $("input[type=radio][name=temperature-" + devId + "-interval]").change(function() {
        temperatureInterval[devId] = this.value;
        drawTemperatureChart(devId, true, true);
    });

    $("input[type=radio][name=valve-" + devId + "-interval]").change(function() {
        valveInterval[devId] = this.value;
        drawValveChart(devId, true, true);
    });
}

// Draws the water level chart.
function drawLevelChart(devId, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#level-" + devId + "-chart-loading").show();
        $.post("/ajax/get_level", getJsonData(levelInterval[devId], devId), function(response) {
            levelData[devId] = response.data;
            drawLevelChart(devId);
            $("#level-" + devId + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("level-" + devId + "-chart", levelData[devId], "Water Level", "%", "#33CC66", 100);
    }
}

// Draws the temperature chart.
function drawTemperatureChart(devId, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#temperature-" + devId + "-chart-loading").show();
        $.post("/ajax/get_temperature", getJsonData(temperatureInterval[devId], devId), function(response) {
            temperatureData[devId] = response.data;
            drawTemperatureChart(devId);
            $("#temperature-" + devId + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("temperature-" + devId + "-chart", temperatureData[devId], "Temperature", "ºC", "#FF0000");
    }
}

// Draws the valve status chart.
function drawValveChart(devId, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#valve-" + devId + "-chart-loading").show();
        $.post("/ajax/get_valve", getJsonData(valveInterval[devId], devId), function(response) {
            valveData[devId] = response.data;
            drawValveChart(devId);
            $("#valve-" + devId + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("valve-" + devId + "-chart", valveData[devId], "Valve", "Closed/Open", "#0000CC");
    }
}

// Draws the chart with the given data.
function drawChart(id, data, title, units, color=null, maxRange=null) {
    if (!isHistoryShowing())
        return;

    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn("date", "");
    dataTable.addColumn("number", "");

    if (data.length == 0) {
        $("#" + id).empty();
        $("#" + id).append("<span class='no-data-label'>Not enough data</span>");
        return;
    }

    dataTable.addRows(data.length);

    $.each(data, function(k, v) {
        dataTable.setCell(k, 0, new Date(v["timestamp"]));
        dataTable.setCell(k, 1, v["data"]);
    });

    var options = {
        backgroundColor: "transparent",
        series: {
            0: {
                axis: "Data",
                color: color,
                visibleInLegend: false
            }
        },
        axes: {
            y: {
                Data: {
                    label: units
                }
            }
        },
        legend: {
            position: "none"
        },
        vAxis: {
            viewWindow: {
                min: 0,
                max: maxRange
            }
        }
    };

    var chart = new google.charts.Line(document.getElementById(id));
    chart.draw(dataTable, google.charts.Line.convertOptions(options));
}

// Formats and returns the HTML of the tanks charts.
function getTankChartsHtml(name, devId) {
    var content = TANK_CHART_HTML;
    content = content.replace(/@@TANK_NAME@@/g, name);
    content = content.replace(/@@TANK_ID@@/g, devId);
    return content;
}

// Returns whether the history page is showing or not.
function isHistoryShowing() {
    return window.location.pathname.indexOf("history") > -1;
}