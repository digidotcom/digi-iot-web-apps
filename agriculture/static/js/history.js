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
var luminosityData;
var temperatureData = {};
var temperatureDataG = {};
var moistureData = {};
var valveData = {};

var windInterval;
var rainInterval;
var radiationInterval;
var luminosityInterval;
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
    temperatureDataG = {};
    moistureData = {};
    valveData = {};

    windInterval = null;
    rainInterval = null;
    radiationInterval = null;
    luminosityInterval = null;
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
    drawLuminosityChart(refresh, showProgress);
    drawTemperatureChartG(refresh, showProgress);

    for (macAddr in temperatureData) {
        drawTemperatureChart(macAddr, refresh, showProgress);
        drawMoistureChart(macAddr, refresh, showProgress);
        drawValveChart(macAddr, refresh, showProgress);
    }

    // Repeat the task every minute.
    setTimeout(function() {
        drawAllCharts(true, false);
    }, 15000);
}

// Draws the wind chart.
function drawWindChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#wind-chart-loading").show();
        $.post("/ajax/get_wind", getJsonData(windInterval), function(response) {
            windData = response.data;
            $.post("/ajax/get_wind_dir", getJsonData(windInterval), function(response2) {
                windDirectionData = response2.data;
                drawWindChart();
                $("#wind-chart-loading").hide();
            });
        });
    } else {
        drawChart("wind-chart", windData, "Wind speed", "km/h", "#4F4F4F", windDirectionData, "Direction", "Direction", "#3CE222");
    }
}

// Draws the rain chart.
function drawRainChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#rain-chart-loading").show();
        $.post("/ajax/get_rain_acc", getJsonData(rainInterval), function(response) {
            rainData = response.data;
            drawRainChart();
            $("#rain-chart-loading").hide();
        });
    } else {
        drawChart("rain-chart", rainData, "Rain", "L/m²", "#3399FF");
    }
}

// Draws the luminosity chart.
function drawLuminosityChart(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#luminosity-chart-loading").show();
        $.post("/ajax/get_luminosity", getJsonData(luminosityInterval), function(response) {
            luminosityData = response.data;
            drawLuminosityChart();
            $("#luminosity-chart-loading").hide();
        });
    } else {
        drawChart("luminosity-chart", luminosityData, "Luminosity", "Lux", "#FFD500");
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
        });
    } else {
        drawChart("radiation-chart", radiationData, "Radiation", "W/m²", "#FFD500");
    }
}

// Draws the temperature chart of gateway.
function drawTemperatureChartG(refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#temperature-chart-loading").show();
        $.post("/ajax/get_temperature", getJsonData(temperatureInterval), function(response) {
            temperatureDataG = response.data;
            drawTemperatureChartG();
            $("#temperature-chart-loading").hide();
        });
    } else {
        drawChart("temperature-chart", temperatureDataG, "Temperature", "ºC", "#FF0000");
    }
}

// Draws the temperature chart of xbees.
function drawTemperatureChart(macAddr, refresh=false, showProgress=false) {
    if (refresh) {
        if (showProgress)
            $("#temperature-" + macAddr + "-chart-loading").show();
        $.post("/ajax/get_temperature", getJsonData(temperatureInterval[macAddr], macAddr), function(response) {
            temperatureData[macAddr] = response.data;
            drawTemperatureChart(macAddr);
            $("#temperature-" + macAddr + "-chart-loading").hide();
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
        });
    } else {
        drawChart("valve-" + macAddr + "-chart", valveData[macAddr], "Valve", "Closed/Open", "#0000CC");
    }
}

// Draws the chart with the given data.
function drawChart(id, data, title, units, color=null, data2=null, units2=null, title2=null, color2=null) {
    if (!isHistoryShowing() || id === undefined)
        return;

    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('date', '');
    dataTable.addColumn("number", title);
    if (data2 != null){
        dataTable.addColumn("number", title2);
    }

    if (data.length == 0) {
        $("#" + id).empty();
        $("#" + id).append("<span class='no-data-label'>Not enough data</span>");
        return;
    }

    var maximumLength = data.length;
    if (data2 != null && data2.length > maximumLength) {
        maximumLength = data2.length;
    }

    dataTable.addRows(maximumLength);

    $.each(data, function(k, v) {
       dataTable.setCell(k, 0, new Date(v["timestamp"]));
       dataTable.setCell(k, 1, v["data"]);
    });

    if(data2 != null){
        $.each(data2, function(k, v) {
            dataTable.setCell(k, 2, v["data"]);
        });
    }

    var options = null;

    if(data2 == null && id == "rain-chart"){
        options = {
            backgroundColor: "transparent",
            series: {
              0: { targetAxisIndex: 0, color: color},
            },
            vAxes: {
              // Adds titles to each axis.
              0: {title: units},
            },
            vAxis: {
                ticks: [{v: 0}, {v: 8}, {v: 16}, {v: 24}, {v: 32}, {v: 40}, {v: 48}, {v: 56} , {v: 64}]
            },
            legend: { position: 'bottom' },
            tooltip: { ignoreBounds: true, isHtml: true, trigger: 'both' }
        };
    }
    else if(data2 == null && id != "rain-chart"){
        options = {
            backgroundColor: "transparent",
            series: {
              0: {targetAxisIndex: 0, color: color}
            },
            vAxes: {
              // Adds titles to each axis.
              0: {title: units}
            },
            vAxis: {
                viewWindow: {
                    min: 0
                }
            },
            legend: { position: 'bottom' },
            tooltip: { ignoreBounds: true, isHtml: true, trigger: 'both' }
        };
    }
    else if(data2 != null){
        options = {
            backgroundColor: "transparent",

            series: {
              0: {targetAxisIndex: 0, color: color},
              1: {targetAxisIndex: 1, color: color2}
            },
            vAxes: {
              // Adds titles to each axis.
              0: {title: units},
              1: {title: units2}
            },

            vAxes: [{
                minValue: 0,
                ticks: [{v: 0}, {v: 8}, {v: 16}, {v: 24}, {v: 32}, {v: 40}, {v: 48}, {v: 56} ]
            }, {
                minValue: 0,
                ticks: [{v: 0, f: 'N'}, {v: 8, f: 'NE'}, {v: 16, f: 'E'}, {v: 24, f: 'SE'}, {v: 32, f: 'S'}, {v: 40, f: 'SW'}, {v: 48, f: 'W'}, {v: 56, f: 'NW'} ]
            }],
            legend: { position: 'bottom' },
            tooltip: { ignoreBounds: true, isHtml: true, trigger: 'both' }
        };
    }

    var chart = new google.visualization.LineChart(document.getElementById(id));
    chart.draw(dataTable, options);
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