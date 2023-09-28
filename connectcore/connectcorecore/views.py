# Copyright 2022, 2023, Digi International Inc.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import os

from django.http import HttpResponse
from django.shortcuts import redirect
from django.template.response import TemplateResponse

from connectcorecore.drm_requests import *

ANSWER_SUCCESS = "OK"
ANSWER_TARGET_NOT_REGISTERED = "not registered"

ERROR_CANCEL_FW_UPDATE = "Could not cancel firmware update"
ERROR_CHECK_FW_UPDATE_STATUS = "Could not check firmware update status."
ERROR_CHECK_FIRMWARE_UPDATE_PROGRESS = "Could not check firmware update progress."
ERROR_CLI_INITIALIZE = "Could not initialize the CLI session."
ERROR_CLI_SEND_DATA = "Could send data to CLI."
ERROR_CLI_TERMINATE = "Could not terminate the CLI session."
ERROR_CREATE_DIRECTORY = "Could not create the directory."
ERROR_DOWNLOAD_FILE = "Could not download file"
ERROR_GET_CONFIG = "Could not read configuration"
ERROR_GET_DATA_USAGE = "Could not retrieve data usage information"
ERROR_GET_SAMPLE_RATE = "Could not get system monitor settings"
ERROR_HISTORY_TEMPERATURE = "Could not get the temperature history"
ERROR_HISTORY_CPU = "Could not get the CPU load history"
ERROR_HISTORY_MEMORY = "Could not get the memory history"
ERROR_LIST_DIRECTORY = "Could not list directory contents."
ERROR_LIST_FILESET = "Could not list fileset files."
ERROR_REBOOT_DEVICE = "Could not reboot device."
ERROR_REMOVE_FILE = "Could not remove file"
ERROR_UPDATE_FIRMWARE = "Could not update firmware."
ERROR_UPLOAD_FILE = "Could not upload file"
ERROR_UPLOAD_FIRMWARE = "Could not upload firmware file."
ERROR_SET_CONFIG = "Could not save configuration"
ERROR_SET_SAMPLE_RATE = "Could not set system monitor settings"
ERROR_TARGET_NOT_REGISTERED = "Target not registered. Make sure the application is running in the device."

ID_CONFIGURATION = "configuration"
ID_DEVICE_NAME = "device_name"
ID_DIRECTORY = "directory"
ID_ELEMENTS = "elements"
ID_ERROR_GUIDE = "error_guide"
ID_ERROR_MSG = "error_msg"
ID_ERROR_TITLE = "error_title"
ID_FILE_NAME = "file_name"
ID_FILE_SET = "file_set"
ID_IS_FILE = "is_file"
ID_LED_NAME = "led_name"
ID_MUSIC_FILE = "music_file"
ID_REDIRECT = "redirect"
ID_PROVISION_TYPE = "provision_type"
ID_PROVISION_VALUE = "provision_value"
ID_SESSION_ID = "session_id"

MESSAGE_NO_DEVICES = "No ConnectCore devices have been added to your DRM account. "
MESSAGE_SETUP_MODULES = "Please, verify the <a target='_blank' rel='noopener noreferrer' " \
                        "href='https://www.digi.com/resources/documentation/digidocs/90002422/" \
                        "#tasks/t_config_devices.htm'>documentation</a> " \
                        "on how to set up your modules to run the ConnectCore demo."

STREAM_TEMPERATURE = "system_monitor/cpu_temperature"
STREAM_CPU = "system_monitor/cpu_load"
STREAM_MEMORY = "system_monitor/used_memory"

TITLE_NO_DEVICES = "No ConnectCore devices found."

SUBDIR = os.getenv('SUBDIR', None)
ROOT_DIR = "/" if not SUBDIR else "/%s/" % SUBDIR


def dashboard(request):
    if not request_has_params(request):
        return redirect(ROOT_DIR)

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'dashboard.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def network(request):
    if not request_has_params(request):
        return redirect(ROOT_DIR)

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'network.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def management(request):
    if not request_has_params(request):
        return redirect(ROOT_DIR)

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'management.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def history(request):
    if not request_has_params(request):
        return redirect(ROOT_DIR)

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'history.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def devices(request):
    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'devices.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def verify_parameters(request):
    """
    Verifies the URL parameters to check if the given device ID matches an actual
    device from the DRM account that was used to log in.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error and a redirect
         value, if the parameters were not successfully verified.
    """
    if is_authenticated(request):
        cc_devices = get_cc_devices(request)
        if len(cc_devices) == 0:
            return JsonResponse({ID_REDIRECT: ROOT_DIR})

        # Get the device ID and device name from the POST request.
        data = json.loads(request.body.decode(request.encoding))
        device_id = data[ID_DEVICE_ID]

        if device_id is None or device_id == "":
            return JsonResponse({ID_REDIRECT: ROOT_DIR})

        # Find out if the supplied parameters correspond to an actual device, if
        # not redirect to the devices page.
        found = False
        for device in cc_devices:
            if device.id == device_id:
                found = True
                break

        if not found:
            return JsonResponse({ID_REDIRECT: ROOT_DIR})
        return JsonResponse({ID_VALID: True}, status=200)

    return redirect_login(request)


def redirect_login(request):
    """
    Redirects to the login page, passing any argument if present.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        An `HttpResponseRedirect` to the login page.
    """
    url = "%saccess/login/" % ROOT_DIR
    if request.path is not None and request.GET is not None and len(request.GET) > 0:
        url += "?dest={}".format(request.path)
        for arg in request.GET:
            url += "&{}={}".format(arg, request.GET[arg])
    return redirect(url)


def register_device(request):
    """
    Registers the device with the ID contained in the request.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    provision_value = data[ID_PROVISION_VALUE]
    provision_type = data[ID_PROVISION_TYPE]

    result = provision_device(request, provision_value, provision_type)
    if ID_ERROR in result:
        return JsonResponse(result, status=400)
    return JsonResponse(result, status=200)


def get_devices(request):
    """
    Returns a JSON response containing the ConnectCore devices of the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of the ConnectCore
            devices within the DRM account.
    """
    error = check_ajax_request(request)
    if error:
        return error

    cc_devices = get_cc_devices(request)
    if len(cc_devices) > 0:
        return JsonResponse({ID_DEVICES: [device.to_json() for device in cc_devices]},
                            status=200)
    return JsonResponse({ID_ERROR_TITLE: TITLE_NO_DEVICES,
                         ID_ERROR_MSG: MESSAGE_NO_DEVICES,
                         ID_ERROR_GUIDE: MESSAGE_SETUP_MODULES})


def get_device_info(request):
    """
    Returns a dictionary containing the information of the device.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the information of the device.
    """
    error = check_ajax_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body.decode(request.encoding))
        device_id = data[ID_DEVICE_ID]

        device_information = get_device_information(request, device_id)

        return JsonResponse(device_information, status=200)
    except Exception as exc:
        return get_exception_response(exc)


def get_device_status(request):
    """
    Returns a dictionary containing the status of the device.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the status of the device.
    """
    error = check_ajax_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body.decode(request.encoding))
        device_id = data[ID_DEVICE_ID]

        status = get_general_device_status(request, device_id)

        return JsonResponse(status, status=200)
    except Exception as exc:
        return get_exception_response(exc)


def play_music(request):
    """
    Sets the play music state.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the operation result.
    """
    music_file = None
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    play = data[ID_PLAY]
    if ID_MUSIC_FILE in data:
        music_file = data[ID_MUSIC_FILE]

    try:
        answer = set_play_music_state(request, device_id, play, music_file)
        if ANSWER_SUCCESS in answer:
            return JsonResponse({ID_PLAY: play}, status=200)
        if ANSWER_TARGET_NOT_REGISTERED in answer:
            return JsonResponse({ID_ERROR: ERROR_TARGET_NOT_REGISTERED}, status=400)
        return JsonResponse({ID_ERROR: answer}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def set_audio_volume(request):
    """
    Sets the audio volume.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the operation result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    value = data[ID_VALUE]

    try:
        answer = set_cc_device_audio_volume(request, device_id, value)
        if ANSWER_SUCCESS in answer:
            return JsonResponse({}, status=200)
        if ANSWER_TARGET_NOT_REGISTERED in answer:
            return JsonResponse({ID_ERROR: ERROR_TARGET_NOT_REGISTERED}, status=400)
        return JsonResponse({ID_ERROR: answer}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def set_video_brightness(request):
    """
    Sets the video brightness.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the operation result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    value = data[ID_VALUE]

    try:
        answer = set_cc_device_video_brightness(request, device_id, value)
        if ANSWER_SUCCESS in answer:
            return JsonResponse({}, status=200)
        if ANSWER_TARGET_NOT_REGISTERED in answer:
            return JsonResponse({ID_ERROR: ERROR_TARGET_NOT_REGISTERED}, status=400)
        return JsonResponse({ID_ERROR: answer}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def set_led_value(request):
    """
    Sets the LED value.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the operation result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    led_name = data[ID_LED_NAME]
    value = data[ID_VALUE]

    try:
        answer = set_led(request, device_id, led_name, value)
        if ANSWER_SUCCESS in answer:
            return JsonResponse({}, status=200)
        if ANSWER_TARGET_NOT_REGISTERED in answer:
            return JsonResponse({ID_ERROR: ERROR_TARGET_NOT_REGISTERED}, status=400)
        return JsonResponse({ID_ERROR: answer}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def get_request_data(request):
    """
    Gets the request data and saves it in a dictionary to be distributed as
    context variables.

    Args:
        request (:class:`.WSGIRequest`): The request to get the data from.

    Returns:
        dic: A dictionary containing the context variables.
    """
    data = {}
    if request_has_id(request):
        data[ID_DEVICE_ID] = request.GET[ID_DEVICE_ID]
        data[ID_DEVICE_NAME] = request.GET[ID_DEVICE_NAME]

    return data


def cli_init_session(request):
    """
    Initializes a CLI session for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the session ID or the error.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = initialize_cli_session(request, device_id)
        if answer is not None:
            if ID_SESSION_ID in answer:
                return JsonResponse({ID_SESSION_ID: answer[ID_SESSION_ID]}, status=200)
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
        return JsonResponse({ID_ERROR: ERROR_CLI_INITIALIZE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def cli_data(request):
    """
    Sends data to a CLI session for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    session_id = data[ID_SESSION_ID]
    data = data[ID_DATA]

    try:
        answer = send_cli_data(request, device_id, session_id, data)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse({}, status=200)
        return JsonResponse({ID_ERROR: ERROR_CLI_SEND_DATA}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def cli_terminate_session(request):
    """
    Terminates a CLI session for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    session_id = data[ID_SESSION_ID]

    try:
        answer = stop_cli_session(request, device_id, session_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse({}, status=200)
        return JsonResponse({ID_ERROR: ERROR_CLI_TERMINATE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def fs_list_directory(request):
    """
    Lists the directory contents for the device ID and directory contained
    in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    directory = data[ID_DIRECTORY]

    try:
        answer = list_directory(request, device_id, directory)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_LIST_DIRECTORY}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def fs_remove_file(request):
    """
    Removes the file for the device ID and path contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    path = data[ID_PATH]
    is_file = data[ID_IS_FILE]

    try:
        answer = remove_file(request, device_id, path, is_file)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_REMOVE_FILE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def fs_upload_file(request):
    """
    Uploads the file for the device ID and path contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    device_id = request.POST[ID_DEVICE_ID]
    path = request.POST[ID_PATH]

    file = request.FILES[ID_FILE]

    try:
        answer = upload_file(request, device_id, path,
                             file.file.getvalue() if not file.multiple_chunks()
                             else file.read())
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_UPLOAD_FILE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def fs_download_file(request):
    """
    Downloads the file for the device ID and path contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    path = data[ID_PATH]

    try:
        answer = download_file(request, device_id, path)
        if answer is not None:
            if isinstance(answer, dict) and ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return HttpResponse(answer, content_type="application/octet-stream", status=200)
        return JsonResponse({ID_ERROR: ERROR_DOWNLOAD_FILE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def fs_create_dir(request):
    """
    Creates a directory for the device ID and path contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    path = data[ID_PATH]

    try:
        answer = create_dir(request, device_id, path)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_CREATE_DIRECTORY}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def history_temperature(request):
    """
    Returns the temperature history for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    try:
        answer = get_data_points(request, STREAM_TEMPERATURE)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_HISTORY_TEMPERATURE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def history_cpu(request):
    """
    Returns the CPU history for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    try:
        answer = get_data_points(request, STREAM_CPU)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_HISTORY_CPU}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def history_memory(request):
    """
    Returns the memory history for the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    try:
        answer = get_data_points(request, STREAM_MEMORY)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_HISTORY_MEMORY}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def reboot_device(request):
    """
    Reboots the device with the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = reboot_remote_device(request, device_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_REBOOT_DEVICE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def upload_firmware(request):
    """
    Uploads a new firmware file to DRM with the information contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    file_set = request.POST[ID_FILE_SET]
    path = request.POST[ID_PATH]
    file_name = request.POST[ID_FILE_NAME]

    file = request.FILES[ID_FILE]

    try:
        answer = create_new_file(request, file_set, path, file_name, file)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_UPLOAD_FIRMWARE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def update_firmware(request):
    """
    Updates the firmware of the device with the device ID contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    file = data[ID_FILE]

    try:
        answer = update_remote_firmware(request, device_id, file)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_UPDATE_FIRMWARE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def check_firmware_update_running(request):
    """
    Checks if there is a firmware update running for the device with the device ID
    contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    # Get the device ID from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    return JsonResponse(check_remote_firmware_update_running(request, device_id), status=200)


def check_firmware_update_status(request):
    """
    Checks the firmware update status for the device with the device ID
    contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = check_remote_firmware_update_status(request, device_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_CHECK_FW_UPDATE_STATUS}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def check_firmware_update_progress(request):
    """
    Checks if the firmware update is running for the device with the device ID
    contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = check_remote_firmware_update_progress(request, device_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_CHECK_FIRMWARE_UPDATE_PROGRESS}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def cancel_firmware_update(request):
    """
    Cancels the firmware update process for the device with the device ID
    contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = cancel_remote_firmware_update(request, device_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_CANCEL_FW_UPDATE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)



def list_fileset_files(request):
    """
    Lists all the files belonging to the fileset specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    file_set = data[ID_FILE_SET]

    try:
        answer = list_fileset(request, file_set)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_LIST_FILESET}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def get_config(request):
    """
    Retrieves the device configuration for the device specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    elements = data[ID_ELEMENTS]

    try:
        answer = get_configuration(request, device_id, elements)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_GET_CONFIG}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def set_config(request):
    """
    Changes the device configuration with the data specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    configuration = data[ID_CONFIGURATION]

    try:
        answer = set_configuration(request, device_id, configuration)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_SET_CONFIG}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def get_sample_rate(request):
    """
    Retrieves the device sample rate for the device specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    try:
        answer = get_system_monitor_settings(request, device_id)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_GET_SAMPLE_RATE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def set_sample_rate(request):
    """
    Changes the device sample rate with the data specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    sample_rate = data[ID_SAMPLE_RATE]
    samples_buffer = data[ID_NUM_SAMPLES_UPLOAD]

    try:
        answer = set_system_monitor_settings(request, device_id, sample_rate, samples_buffer)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_SET_SAMPLE_RATE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def get_data_usage(request):
    """
    Gets the data usage for the DRM account specified in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
         :class:`.JsonResponse`: a JSON with the result.
    """
    error = check_ajax_request(request)
    if error:
        return error

    try:
        answer = get_account_data_usage(request)
        if answer is not None:
            if ID_ERROR in answer:
                return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
            return JsonResponse(answer, status=200)
        return JsonResponse({ID_ERROR: ERROR_GET_DATA_USAGE}, status=400)
    except Exception as exc:
        return get_exception_response(exc)


def check_device_connection_status(request):
    """
    Checks whether the device with the ID specified in the request is online
    or offline.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the status of the device or the error.
    """
    error = check_ajax_request(request)
    if error:
        return error

    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]

    online = is_device_online(request, device_id)
    return JsonResponse({ID_STATUS: online}, status=200)


def request_has_id(request):
    """
    Returns whether the request has the 'device_id' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (ID_DEVICE_ID in request.GET
            and request.GET[ID_DEVICE_ID] is not None)


def request_has_params(request):
    """
    Returns whether the request has the required parameters.

    Returns:
        `True` if the request has the required parameters, `False` otherwise.
    """
    return request_has_id(request)
