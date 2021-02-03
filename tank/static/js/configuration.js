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

const TANK_ENTRY_CONTENT = "" +
    "<div id='@@ID@@-entry' class='tank-entry' onclick='selectTankEntry(\"@@ID@@\")'>" +
    "    <input type='checkbox' class='form-check-input tank-entry-check' id='@@ID@@-check' disabled='true' onclick='event.stopPropagation(); window.event.cancelBubble = true; updateCheckedTanks();'>" +
    "    <label>@@NAME@@</label>" +
    "</div>";

var selectedMOValue;
var checkedTanks;
var selectedTankID;
var tanks;

// Fills the list of tanks.
function fillTanksList() {
    $.post("/ajax/get_tanks", getJsonData(), function(response) {
        tanks = response["tanks"];
        let errorTitle = response["error_title"];

        // Hide the tanks loading pop-up.
        hidePopup(null, $("#loading-tanks"));

        // Display error (if any)
        if (errorTitle != null)
            toastr.error(errorTitle);
        if (tanks == null)
            return;

        // Fill the list of tanks.
        for (let tank of tanks) {
            let tankEntryContent = TANK_ENTRY_CONTENT;
            tankEntryContent = tankEntryContent.replace(/@@ID@@/g, tank["dev_id"]);
            tankEntryContent = tankEntryContent.replace(/@@NAME@@/g, tank["name"]);
            let tankEntryDiv = document.createElement("div");
            tankEntryDiv.innerHTML = tankEntryContent;
            $("#tanks-list").append(tankEntryDiv);
        }
    }).fail(function(response) {
        processErrorResponse(response);
    });
}

// Callback executed when the DRM connection option changes.
function drmConnectionOptionChanged() {
    let connectionValue = document.querySelector('input[name="drmConnectRadio"]:checked').value;
    if (connectionValue === "polling")
        setPRSettingsEnabled(true);
    else
        setPRSettingsEnabled(false);
}

// Enables or disables the polling rate settings.
function setPRSettingsEnabled(enabled) {
    let drmPollLabel = document.getElementById("drmPollLabel");
    let drmPollMinutes = document.getElementById("drmPollMinutes");
    let drmPollUnitsLabel = document.getElementById("drmPollUnitsLabel");
    let drmPollDescriptionLabel = document.getElementById("drmPollDescriptionLabel");

    if (drmPollLabel != null) {
        if (enabled && drmPollLabel.classList.contains("disabled"))
            drmPollLabel.classList.remove("disabled");
        else if (!enabled && !drmPollLabel.classList.contains("disabled"))
            drmPollLabel.classList.add("disabled");
    }
    if (drmPollUnitsLabel != null) {
        if (enabled && drmPollUnitsLabel.classList.contains("disabled"))
            drmPollUnitsLabel.classList.remove("disabled");
        else if (!enabled && !drmPollUnitsLabel.classList.contains("disabled"))
            drmPollUnitsLabel.classList.add("disabled");
    }
    if (drmPollDescriptionLabel != null) {
        if (enabled && drmPollDescriptionLabel.classList.contains("disabled"))
            drmPollDescriptionLabel.classList.remove("disabled");
        else if (!enabled && !drmPollDescriptionLabel.classList.contains("disabled"))
            drmPollDescriptionLabel.classList.add("disabled");
    }

    if (drmPollMinutes != null)
        drmPollMinutes.disabled = !enabled;
}

// Enables or disables all the configuration controls.
function setConfigurationControlsEnabled(enabled) {
    let tanksSelect = document.getElementById("tanksSelect");
    let refreshButton = document.getElementById("refreshButton");
    let saveButton = document.getElementById("saveButton");
    let checkAllButton = document.getElementById("checkAllButton");
    let unCheckAllButton = document.getElementById("unCheckAllButton");
    let connectAlwaysRadio = document.getElementById("connectAlwaysRadio");
    let connectPollingRatio = document.getElementById("connectPollingRatio");

    if (tanksSelect != null)
        tanksSelect.disabled = !enabled;
    if (refreshButton != null)
        refreshButton.disabled = !enabled;
    if (checkAllButton != null)
        checkAllButton.disabled = !enabled;
    if (unCheckAllButton != null)
        unCheckAllButton.disabled = !enabled;
    if (saveButton != null)
        saveButton.disabled = !enabled;
    if (connectAlwaysRadio != null)
        connectAlwaysRadio.disabled = !enabled;
    if (connectPollingRatio != null)
        connectPollingRatio.disabled = !enabled;

    if (!enabled)
        setPRSettingsEnabled(false);
    else
        drmConnectionOptionChanged();

    setTanksListEnabled(enabled);
}

// Enables or disables the checkboxes of the tank entries.
function setCheckBoxesEnabled(enabled) {
    let tankChecks = document.getElementsByClassName("tank-entry-check");
    for (let tankCheck of tankChecks) {
        // Skip the checkbox corresponding to the selected tank.
        if (selectedTankID != null && tankCheck.id.startsWith(selectedTankID))
            continue;
        tankCheck.disabled = !enabled;
    }
}

// Enables or disables the tanks list control.
function setTanksListEnabled(enabled) {
    // Enable or disable the tanks checkboxes.
    setCheckBoxesEnabled(enabled);

    // Show or hide the disabled panel.
    let tanksDisablePane = document.getElementById("tanks-list-disable-panel");
    if (tanksDisablePane == null)
        return;
    if (enabled)
        tanksDisablePane.style.display = "none";
    else
        tanksDisablePane.style.display = "block";
}

// Updates the configuration of the selected tank.
function refreshSelectedTank() {
    if (selectedTankID == null)
        return;

    // Disable all the configuration controls.
    setConfigurationControlsEnabled(false);

    // Show the configuration loading pop-up.
    $("#popup-configuration").text("Loading configuration...");
    showPopup(null, $("#loading-configuration"));

    // Update the configuration of the selected tank.
    refreshTankConfiguration(selectedTankID);
}

// Updates the configuration of the tank with the given ID.
function refreshTankConfiguration(tankID) {
    if (tankID == null) {
        // Hide the loading configuration popup.
        hidePopup(null, $("#loading-configuration"));

        // Enable all the configuration controls again.
        setConfigurationControlsEnabled(true);

        return;
    }

    $.post("/ajax/get_tank_configuration",
        JSON.stringify({
            "tank_id": tankID
        }),
        getConfigurationCallback
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Saves the configuration of the selected tanks.
function saveConfiguration() {
    if (checkedTanks == null || checkedTanks.length === 0)
        return;

    // Disable all te configuration controls.
    setConfigurationControlsEnabled(false);

    // Show the configuration loading pop-up.
    $("#popup-configuration").text("Saving configuration...");
    showPopup(null, $("#loading-configuration"));

    // Get the configuration values to set.
    let mo;
    let df;

    let connectionValue = document.querySelector('input[name="drmConnectRadio"]:checked').value;
    if (connectionValue === "polling") {
        mo = (selectedMOValue & 0xFFFE).toString();
        df = (document.getElementById("drmPollMinutes").value).toString();
    } else {
        mo = (selectedMOValue | 0x0001).toString();
        df = "UNDEFINED";
    }

    // Update the configuration of the selected tank.
    setTanksConfiguration(checkedTanks, mo, df);
}

// Sets the configuration of the tanks with the given IDs.
function setTanksConfiguration(tankIDs, mo, df) {
    if (tankIDs == null) {
        // Hide the loading configuration popup.
        hidePopup(null, $("#loading-configuration"));

        // Enable all the configuration controls again.
        setConfigurationControlsEnabled(true);

        return;
    }

    $.post("/ajax/set_tanks_configuration",
        JSON.stringify({
            "tank_ids": tankIDs,
            "mo": mo,
            "df": df
        }),
        getConfigurationCallback
    ).fail(function(response) {
        processErrorResponse(response);
    });
}

// Callback executed when the tank configuration is requested.
function getConfigurationCallback(response) {
    let configuration = response["configuration"];
    let scheduledConfigs = response["scheduled_configs"];
    let errorMessage = response["error"];

    // Hide the loading configuration popup.
    hidePopup(null, $("#loading-configuration"));

    // Enable all the configuration controls again.
    setConfigurationControlsEnabled(true);

    // Show the error message (if any).
    if (errorMessage != null) {
        toastr.error(errorMessage);
        return;
    }

    // Get the configuration values from the response.
    let mo = configuration["mo"];
    let df = configuration["df"];

    // Update the configuration of the selected tank with the MO and DF parameters.
    updateTankConfiguration(mo, df);

    // If any tank was offline and a scheduled configuration was issued, notify it.
    if (scheduledConfigs != null && scheduledConfigs.length > 0) {
        let infoMessage = "One or more tanks were offline and could not be configured.<br/><br/>" +
            "A schedule configuration operation has been generated for the following tanks and " +
            "will be executed as soon as they are back online:<br/>"
        for (let scheduledTankIO of scheduledConfigs) {
            for (let tank of tanks) {
                if (tank["dev_id"] === scheduledTankIO) {
                    infoMessage = infoMessage + "<br/>- " + tank["name"];
                    break;
                }
            }
        }
        toastr.info(infoMessage);
    }
}

// Updates the configuration of the tank with the given MO and DF parameters.
function updateTankConfiguration(mo, df) {
    let mo_int = parseInt(mo);
    let df_int = parseInt(df);

    // Save the MO value globally to avoid losing the bit information.
    selectedMOValue = mo_int;

    // Configure the connection method.
    let connectAlwaysRadio = document.getElementById("connectAlwaysRadio");
    let connectPollingRatio = document.getElementById("connectPollingRatio");
    if ((mo & 1) === 1) {
        connectAlwaysRadio.checked = true;
        connectPollingRatio.checked = false;
        setPRSettingsEnabled(false);
    } else {
        connectAlwaysRadio.checked = false;
        connectPollingRatio.checked = true;
        setPRSettingsEnabled(true);
    }

    // Configure the polling rate.
    if (df !== "UNDEFINED") {
        let drmPollMinutes = document.getElementById("drmPollMinutes");
        drmPollMinutes.value = df_int;
    }
}

// Selects the tank with the given ID.
function selectTankEntry(tankID) {
    let tankDiv = document.getElementById(tankID + "-entry");
    if (tankDiv == null)
        return;

    // Deselect rest of tanks.
    deselectTanks();

    // Select the current tank.
    if (!tankDiv.classList.contains("tank-entry-selected"))
        tankDiv.classList.add("tank-entry-selected");
    let tankCheck = document.getElementById(tankID + "-check");
    if (tankCheck != null) {
        tankCheck.checked = true;
        tankCheck.disabled = true;
        updateCheckedTanks();
    }

    // Verify the selected tank is not the one being selected.
    if (selectedTankID != null && selectedTankID === tankID)
        return;
    selectedTankID = tankID;

    // Disable all the configuration controls.
    setConfigurationControlsEnabled(false);

    // Show the configuration loading pop-up.
    $("#popup-configuration").text("Loading configuration...");
    showPopup(null, $("#loading-configuration"));

    // Refresh the tank configuration.
    refreshTankConfiguration(tankID);
}

// Deselects all the tanks from the list.
function deselectTanks() {
    let tankEntries = document.getElementsByClassName("tank-entry");
    for (let tankEntry of tankEntries) {
        if (tankEntry.classList.contains("tank-entry-selected"))
            tankEntry.classList.remove("tank-entry-selected");
    }
    let tankChecks = document.getElementsByClassName("tank-entry-check");
    for (let tankCheck of tankChecks) {
        tankCheck.checked = false;
        tankCheck.disabled = false;
    }
}

// Updates the list of checked tanks.
function updateCheckedTanks() {
    checkedTanks = [];
    let tankChecks = document.getElementsByClassName("tank-entry-check");
    for (let tankCheck of tankChecks) {
        if (tankCheck.checked)
            checkedTanks.push(tankCheck.id.replace("-check", ""));
    }

    let saveButton = document.getElementById("saveButton");
    if (saveButton == null)
        return;
    saveButton.disabled = checkedTanks.length <= 0;
}

// Checks all the tanks.
function checkAllTanks() {
    checkedTanks = [];
    let tankChecks = document.getElementsByClassName("tank-entry-check");
    for (let tankCheck of tankChecks) {
        tankCheck.checked = true;
        checkedTanks.push(tankCheck.id.replace("-check", ""));
    }

    let saveButton = document.getElementById("saveButton");
    if (saveButton == null)
        return;
    saveButton.disabled = checkedTanks.length <= 0;
}

// Unchecks all the tanks.
function unCheckAllTanks() {
    checkedTanks = [];
    let tankChecks = document.getElementsByClassName("tank-entry-check");
    for (let tankCheck of tankChecks) {
        if (tankCheck.disabled)
            checkedTanks.push(tankCheck.id.replace("-check", ""));
        else
            tankCheck.checked = false;
    }

    let saveButton = document.getElementById("saveButton");
    if (saveButton == null)
        return;
    saveButton.disabled = checkedTanks.length <= 0;
}
