/*
 * Copyright 2022, Digi International Inc.
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

// Constants.
const CLASS_D_NONE = "d-none";
const CLASS_ELEMENT_GRAYED = "element-grayed";

const ERROR_ABORTED = "Operation aborted";
const ERROR_BAD_REQUEST = "Bad request";
const ERROR_FORBIDDEN = "Could not perform the selected action. Make sure you have the correct access rights.";
const ERROR_URL_NOT_FOUND = "Requested URL not found";
const ERROR_SERVER_ERROR = "Internal server error";
const ERROR_TITLE = "Error";
const ERROR_UNKNOWN_ERROR = "Unknown error. Make sure that server is running.";

const ID_ERROR = "error";
const ID_ERROR_GUIDE = "error_guide";
const ID_ERROR_MESSAGE = "error_msg";
const ID_ERROR_TITLE = "error_title";
const ID_LOADING_POPUP = "loading_popup";
const ID_LOADING_POPUP_MESSAGE = "loading_popup_message";
const ID_LOADING_WRAPPER = "loading_wrapper";

const VALUE_ABORT = "abort";

String.prototype.format = function() {
    var formatted = this;
    for (var arg in arguments)
        formatted = formatted.replaceAll("{" + arg + "}", arguments[arg]);
    return formatted;
};

// Check if there is any error in the response.
function checkErrorResponse(response, showErrorDialog) {
    if (response[ID_ERROR_MESSAGE] != null || response[ID_ERROR] != null) {
        // Process error.
        var errorTitle = ERROR_TITLE;
        var errorMessage = getErrorFromResponse(response);
        if (response[ID_ERROR_TITLE] != null)
            errorTitle = response[ID_ERROR_TITLE];
        // Show toast error.
        if (errorMessage != null && errorMessage != "")
            toastr.error(errorMessage);
        // Hide the loading panel.
        showLoadingPopup(false);
        // Show error dialog.
        if (showErrorDialog)
            showInfoPopup(true, errorTitle, errorMessage);
        // There was an error, return true.
        return true;
    }
    // No error found.
    return false;
}

// Returns the error message from the response.
function getErrorFromResponse(response) {
    var error = "";
    if (response[ID_ERROR_MESSAGE] != null || response[ID_ERROR] != null) {
        if (response[ID_ERROR_MESSAGE] != null) {
            error = response[ID_ERROR_MESSAGE];
            if (response[ID_ERROR_GUIDE] != null)
                error += response[ID_ERROR_GUIDE];
        } else
            error = response[ID_ERROR];
    }
    return error;
}

// Shows/hides the loading popup panel.
function showLoadingPopup(visible, message=null) {
    // Set loading message only if it is not null and the popup will be visible.
    if (visible && message != null)
        document.getElementById(ID_LOADING_POPUP_MESSAGE).innerHTML = message;
    // Show/Hide the popup.
    showPopup(ID_LOADING_WRAPPER, ID_LOADING_POPUP, visible);
}

// Shows/hides a front popup over the given background element.
function showPopup(backElementID, frontElementID, visible) {
    // Initialize variables.
    var backElement = document.getElementById(backElementID);
    var frontElement = document.getElementById(frontElementID);
    // Sanity checks.
    if (backElement == null || frontElement == null)
        return;
    // Show/Hide the popup.
    if (visible) {
        if (!backElement.classList.contains(CLASS_ELEMENT_GRAYED))
            backElement.classList.add(CLASS_ELEMENT_GRAYED);
        if (frontElement.classList.contains(CLASS_D_NONE))
            frontElement.classList.remove(CLASS_D_NONE);
    } else {
        if (backElement.classList.contains(CLASS_ELEMENT_GRAYED))
            backElement.classList.remove(CLASS_ELEMENT_GRAYED);
        if (!frontElement.classList.contains(CLASS_D_NONE))
            frontElement.classList.add(CLASS_D_NONE);
    }
}

// Processes the error response of the AJAX request.
function processAjaxErrorResponse(response) {
    // Check common error codes.
    if (response.status == 401)
        redirectToLogin();
    var errorMessage = "";
    if (response.statusText == VALUE_ABORT)
        errorMessage = ERROR_ABORTED;
    else if (response.status == 400) {
        errorMessage = response.responseJSON[ID_ERROR];
        // Show the error message (if any).
        if (errorMessage == null)
            errorMessage = ERROR_BAD_REQUEST;
    } else if (response.status == 403)
        errorMessage = ERROR_FORBIDDEN;
    else if (response.status == 404)
        errorMessage = ERROR_URL_NOT_FOUND;
    else if (response.status == 500)
        errorMessage = ERROR_SERVER_ERROR;
    else
        errorMessage = ERROR_UNKNOWN_ERROR;
    // Show toast with the error message.
    toastr.error(errorMessage);
    // Return the error message.
    return errorMessage;
}
