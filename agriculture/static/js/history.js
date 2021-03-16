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

const STATION_CHART_HTML = "" +
    "<div class='row justify-content-lg-center'>" +
    "   <div class='col-lg-12 col-xl-12'>" +
    "       <div class='card shadow-sm'>" +
    "           <div class='card-body'>" +
    "               <h5 class='card-title'>Historic data: @@STATION_NAME@@</h5>" +
    "               <div class='row'>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-thermometer-half fa-2x mr-3'></span>" +
    "                           <span>Temperature</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='temperature-@@STATION_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='temperature-@@STATION_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='temperature-@@STATION_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@STATION_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@STATION_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='temperature-@@STATION_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-tint fa-2x mr-3'></span>" +
    "                           <span>Soil moisture</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='moisture-@@STATION_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='moisture-@@STATION_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='moisture-@@STATION_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='moisture-@@STATION_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='moisture-@@STATION_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='moisture-@@STATION_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "                   <div class='col-xl-4 chart-container'>" +
    "                       <div class='d-flex justify-content-center align-items-center'>" +
    "                           <span class='fas fa-faucet fa-2x mr-3'></span>" +
    "                           <span>Valve status</span>" +
    "                       </div>" +
    "                       <div class='chart-wrapper'>" +
    "                           <div id='valve-@@STATION_ID@@-chart' class='big-chart'></div>" +
    "                           <div id='valve-@@STATION_ID@@-chart-loading' class='chart-loading'>" +
    "                               <img class='loading-chart-image' src='../static/images/loading.gif' alt='Loading...' />" +
    "                           </div>" +
    "                       </div>" +
    "                       <div class='btn-group btn-group-toggle d-flex justify-content-center' data-toggle='buttons'>" +
    "                           <label class='btn btn-secondary btn-sm active'>" +
    "                               <input type='radio' name='valve-@@STATION_ID@@-interval' value='1' checked> Hour" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@STATION_ID@@-interval' value='24'> Day" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@STATION_ID@@-interval' value='168'> Week" +
    "                           </label>" +
    "                           <label class='btn btn-secondary btn-sm'>" +
    "                               <input type='radio' name='valve-@@STATION_ID@@-interval' value='720'> Month" +
    "                           </label>" +
    "                       </div>" +
    "                   </div>" +
    "               </div>" +
    "           </div>" +
    "       </div>" +
    "   </div>" +
    "</div>";

var windData;
var rainData;
var radiationData;
var temperatureData = {};
var moistureData = {};
var valveData = {};

var windInterval;
var rainInterval;
var radiationInterval;
var temperatureInterval = {};
var moistureInterval = {};
var valveInterval = {};

// Initializes the charts.
function initCharts() {
    // Reset the variables.
    windData = null;
    rainData = null;
    radiationData = null;
    temperatureData = {};
    moistureData = {};
    valveData = {};

    windInterval = null;
    rainInterval = null;
    radiationInterval = null;
    temperatureInterval = {};
    moistureInterval = {};
    valveInterval = {};

    // Check the status of the farm to draw the stations charts or not.
    checkFarmStatusHistory();

    // Draw all the charts.
    drawAllCharts(true, true);
}

// Check if the farm is online to draw its stations charts or not.
function checkFarmStatusHistory() {
    // Draw the charts of every irrigation station if the farm is online, otherwise
    // schedule a new check in 15 seconds.
    if (farmConnectionStatus)
        drawStationsCharts();
    else
        setTimeout(checkFarmStatusHistory, 15000);
}

// Draws all the charts.
function drawAllCharts(refresh=false, showProgress=true) {
    if (!isHistoryShowing())
        return;

    drawWindChart(refresh, showProgress);
    drawRainChart(refresh, showProgress);
    drawRadiationChart(refresh, showProgress);

    for (macAddr in temperatureData) {
        drawTemperatureChart(macAddr, refresh, showProgress);
        drawMoistureChart(macAddr, refresh, showProgress);
        drawValveChart(macAddr, refresh, showProgress);
    }

    // Repeat the task every minute.
    setTimeout(function() {
        drawAllCharts(true, false);
    }, 60000);
}

// Draws the wind chart.
function drawWindChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#wind-chart-loading").show();
        $.post("/ajax/get_wind", getJsonData(windInterval), function(response) {
            windData = response.data;
            drawWindChart();
            $("#wind-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("wind-chart", windData, "Wind", "km/h", "#4F4F4F");
    }
}

// Draws the rain chart.
function drawRainChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#rain-chart-loading").show();
        $.post("/ajax/get_rain", getJsonData(rainInterval), function(response) {
            rainData = response.data;
            drawRainChart();
            $("#rain-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("rain-chart", rainData, "Rain", "mm", "#3399FF");
    }
}

// Draws the radiation chart.
function drawRadiationChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#radiation-chart-loading").show();
        $.post("/ajax/get_radiation", getJsonData(radiationInterval), function(response) {
            radiationData = response.data;
            drawRadiationChart();
            $("#radiation-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("radiation-chart", radiationData, "Radiation", "W/m2", "#FFD500");
    }
}

// Draws the temperature chart.
function drawTemperatureChart(macAddr, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#temperature-" + macAddr + "-chart-loading").show();
        $.post("/ajax/get_temperature", getJsonData(temperatureInterval[macAddr], macAddr), function(response) {
            temperatureData[macAddr] = response.data;
            drawTemperatureChart(macAddr);
            $("#temperature-" + macAddr + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("temperature-" + macAddr + "-chart", temperatureData[macAddr], "Temperature", "ºC", "#FF0000");
    }
}

// Draws the moisture chart.
function drawMoistureChart(macAddr, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#moisture-" + macAddr + "-chart-loading").show();
        $.post("/ajax/get_moisture", getJsonData(moistureInterval[macAddr], macAddr), function(response) {
            moistureData[macAddr] = response.data;
            drawMoistureChart(macAddr);
            $("#moisture-" + macAddr + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("moisture-" + macAddr + "-chart", moistureData[macAddr], "Moisture", "%", "#33CC66");
    }
}

// Draws the valve status chart.
function drawValveChart(macAddr, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#valve-" + macAddr + "-chart-loading").show();
        $.post("/ajax/get_valve", getJsonData(valveInterval[macAddr], macAddr), function(response) {
            valveData[macAddr] = response.data;
            drawValveChart(macAddr);
            $("#valve-" + macAddr + "-chart-loading").hide();
        }).fail(function(response) {
            processErrorResponse(response);
        });
    } else {
        drawChart("valve-" + macAddr + "-chart", valveData[macAddr], "Valve", "Closed/Open", "#0000CC");
    }
}

// Draws the chart with the given data.
function drawChart(id, data, title, units, color=null) {
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
                min: 0
            }
        }
    };

    var chart = new google.charts.Line(document.getElementById(id));
    chart.draw(dataTable, google.charts.Line.convertOptions(options));
}

// Draws the charts of the irrigation stations.
function drawStationsCharts() {
    $.post("/ajax/get_stations", getJsonData(), function(response) {
        var html = "";
        var stations = response["stations"];
        let errorTitle = response["error_title"];

        if (errorTitle != null)
            toastr.error(errorTitle);
        if (stations == null)
            return;

        for (var station of stations) {
            html += getStationChartsHtml(station["name"], normalizeMac(station["address"]));
            html += "\n";
        }
        $("#stations-cards").html(html);

        for (var station of stations) {
            var macAddr = normalizeMac(station["address"]);
            registerIntervalCallbacks(macAddr);
            drawTemperatureChart(macAddr, true, true);
            drawMoistureChart(macAddr, true, true);
            drawValveChart(macAddr, true, true);
        }
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Registers the callbacks for the station charts interval buttons.
function registerIntervalCallbacks(macAddr) {
    $("input[type=radio][name=temperature-" + macAddr + "-interval]").change(function() {
        temperatureInterval[macAddr] = this.value;
        drawTemperatureChart(macAddr, true, true);
    });

    $("input[type=radio][name=moisture-" + macAddr + "-interval]").change(function() {
        moistureInterval[macAddr] = this.value;
        drawMoistureChart(macAddr, true, true);
    });

    $("input[type=radio][name=valve-" + macAddr + "-interval]").change(function() {
        valveInterval[macAddr] = this.value;
        drawValveChart(macAddr, true, true);
    });
}

// Formats and returns the HTML of the station charts.
function getStationChartsHtml(name, macAddr) {
    var content = STATION_CHART_HTML;
    content = content.replace(/@@STATION_NAME@@/g, name);
    content = content.replace(/@@STATION_ID@@/g, macAddr);
    return content;
}

// Normalizes the given MAC address.
function normalizeMac(mac) {
    return mac.replace(/:/g, "").replace(/!/g, "");
}

// Returns whether the history page is showing or not.
function isHistoryShowing() {
    return window.location.pathname.indexOf("history") > -1;
}