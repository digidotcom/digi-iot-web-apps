# Copyright 2022, Digi International Inc.
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

import json
import os
import re
import textwrap
import xml.etree.ElementTree as et
from asgiref.sync import async_to_sync
from datetime import datetime, timedelta, timezone
from xml.etree.ElementTree import ParseError

from channels.layers import get_channel_layer
from devicecloud import DeviceCloud, DeviceCloudHttpException, DeviceCloudException
from devicecloud.monitor import MonitorAPI, TCPDeviceCloudMonitor, MON_TRANSPORT_TYPE_ATTR, MON_STATUS_ATTR
from devicecloud.monitor_tcp import TCPClientManager
from devicecloud.sci import DeviceTarget
from devicecloud.file_system_service import ErrorInfo, FileSystemServiceException
from django.http import JsonResponse

from login.auth import DeviceCloudUser

from connectcorecore.models import ConnectCoreDevice

CLI_TYPE_DATA = "data"
CLI_TYPE_START = "start"
CLI_TYPE_TERMINATE = "terminate"

CONTENT_TYPE_PRETTY_JSON = "application/pretty+json"

DATA_POINTS_BUFFER_DURATION = 5
DATA_POINTS_BUFFER_SIZE = 10

DEFAULT_FLASH_SIZE = "0"
DEFAULT_IP = "0.0.0.0"
DEFAULT_MEMORY_TOTAL = "0"
DEFAULT_MAC = "00:00:00:00:00:00"
DEFAULT_NUM_SAMPLES_UPLOAD = "6"
DEFAULT_SAMPLE_RATE = "10"
DEFAULT_VIDEO_RESOLUTION = "No video device found"

DUMMY_FILE_CONTENT = "Ignore me"
DUMMY_FILE_NAME = "dummy_file_for_dir_creation"

ERROR_CANCEL_FW_UPDATE = "Error canceling firmware update process: %s"
ERROR_CHECK_FW_UPDATE_PROGRESS = "Error checking firmware update progress: %s"
ERROR_CHECK_FW_UPDATE_STATUS = "Error checking firmware update status: %s"
ERROR_CREATE_DIRECTORY = "Could not create directory"
ERROR_CREATE_FILE = "Error creating file: %s"
ERROR_DEVICE_NOT_ANSWER = "Device did not answer. Make sure the application is running in the device."
ERROR_DOWNLOAD_FILE = "Error '%s' downloading file: %s"
ERROR_DRM_REQUEST = "Error in the DRM request: {}."
ERROR_GET_DATA_USAGE = "Error reading account data usage: %s"
ERROR_LIST_DIRECTORY = "Error '%s' listing directory: %s"
ERROR_LIST_FILESET = "Error listing fileset files: %s"
ERROR_NO_POST_REQUEST = "AJAX request must be sent using POST"
ERROR_NO_PROGRESS_INFO = "No progress information"
ERROR_NO_SESSION_ID = "No CLI session ID received"
ERROR_NOT_AUTHENTICATED = "Not authenticated"
ERROR_PARSING = "Error parsing Digi Remote Manager answer"
ERROR_REMOVE_FILE = "Error '%s' removing file: %s"
ERROR_TIMEOUT = "Timeout waiting for device response"
ERROR_UNKNOWN = "unknown"
ERROR_UNRECOGNIZED_ANSWER = "unrecognized answer"
ERROR_UPDATE_FW_REQUEST = "Error sending firmware update request: %s"
ERROR_UPLOAD_FILE = "Error '%s' uploading file: %s"

FS_TYPE_DIRECTORY = "dir"
FS_TYPE_FILE = "file"

GROUP_UPLOAD_PROGRESS = "upload_progress.{}"

ID_ANY_LEVEL = ".//"
ID_BOARD_ID = "board_id"
ID_BOARD_VARIANT = "board_variant"
ID_BLUETOOTH_MAC = "bluetooth_mac"
ID_BT_MAC = "bt-mac"
ID_CANCEL = "cancel"
ID_CONTENT_TYPE = "content-type"
ID_CURRENT_DIRECTORY = "current_dir"
ID_DATA = "data"
ID_DATA_DETAILS = "data_details"
ID_DATA_SUMMARY = "data_summary"
ID_DATA_USAGE_DEVICES = "data_usage_devices"
ID_DATA_USAGE_MONITORS = "data_usage_monitors"
ID_DATA_USAGE_TOTAL = "data_usage_total"
ID_DATA_USAGE_WEB = "data_usage_web"
ID_DATA_USAGE_WEB_SERVICES = "data_usage_web_services"
ID_DESC = "desc"
ID_DEVICE_ID = "device_id"
ID_DEVICE_TYPE = "device_type"
ID_DEVICES = "devices"
ID_DEY_VERSION = "dey_version"
ID_ERROR = "error"
ID_ERROR_MSG = "error_msg"
ID_ERROR_MESSAGE = "error_message"
ID_FILE = "file"
ID_FILES = "files"
ID_FLASH_SIZE = "flash_size"
ID_HARDWARE = "hardware"
ID_INITIALIZE = "initialize"
ID_INTERVAL = "interval"
ID_INVENTORY = "inventory"
ID_IP = "ip"
ID_KERNEL_VERSION = "kernel_version"
ID_KINETIS = "kinetis"
ID_LAST_MODIFIED = "last_modified"
ID_LIST = "list"
ID_MAC = "mac"
ID_MCA_FW_VERSION = "mca_fw_version"
ID_MCA_HW_VERSION = "mca_hw_version"
ID_MEMORY_TOTAL = "memory_total"
ID_MESSAGE = "message"
ID_MODULE_VARIANT = "module_variant"
ID_MONITOR_ID = "monitor_id"
ID_NAME = "name"
ID_N_DP_UPLOAD = "n_dp_upload"
ID_NUM_SAMPLES_UPLOAD = "num_samples_upload"
ID_PATH = "path"
ID_PROGRESS = "progress"
ID_RESOLUTION = "resolution"
ID_SAMPLE_RATE = "sample_rate"
ID_SERIAL_NUMBER = "serial_number"
ID_SERVICE_DESCRIPTION = "service_description"
ID_SESSION_ID = "session_id"
ID_SIZE = "size"
ID_STATUS = "status"
ID_STREAM = "stream"
ID_TARGETS = "targets"
ID_TIMESTAMP = "timestamp"
ID_TOTAL_DATA_USAGE_DEVICES_MB = "device_data_usage_mb"
ID_TOTAL_DATA_USAGE_MB = "total_data_usage_mb"
ID_TOTAL_DATA_USAGE_WS_MB = "web_service_data_usage_mb"
ID_TOTAL_MEMORY = "total_mem"
ID_TOTAL_STORAGE = "total_st"
ID_TYPE = "type"
ID_UBOOT_VERSION = "uboot_version"
ID_USAGE = "usage"
ID_UPDATE_RUNNING = "update_running"
ID_VALID = "valid"
ID_VALUE = "value"
ID_VIDEO_RESOLUTION = "video_resolution"
ID_WIFI_IP = "wifi_ip"
ID_WIFI_MAC = "wifi_mac"

IFACE_WIFI = "wlan0"

NUM_ETHERNET_INTERFACES = 2

OPERATION_CLI = "cli"
OPERATION_DATA_SERVICE = "data_service"
OPERATION_REBOOT = "reboot"
OPERATION_SEND_MESSAGE = "send_message"

PREFIX_VALID_DEVICE = ""

PROVISION_TYPE_ID = "id"
PROVISION_TYPE_IMEI = "imei"
PROVISION_TYPE_MAC = "mac"

REGEX_DEV_REQUEST_RESPONSE = ".*<device_request .*>(.*)<\\/device_request>.*"
REGEX_DO_CMD_RESPONSE = ".*<do_command target=[^>]*>(.*)<\\/do_command>.*"
REGEX_INFO_HARDWARE = "SN=([0-9a-zA-Z-_:]+) MACHINE=([0-9a-zA-Z-_:]+) VARIANT=([0-9a-zA-Z]+) " \
                      "SBC_VARIANT=([0-9a-zA-Z]+) BOARD_ID=([0-9a-zA-Z]+)"
REGEX_INFO_KINETIS = "HW_VERSION=([0-9a-zA-Z-_:\\/]+) FW_VERSION=([0-9a-zA-Z-_:\\/]+)"
REGEX_MONITOR_ERROR = ".*<error>(.*)<\\/error>.*"

REQ_CLI_INITIALIZE = "<initialize/>"
REQ_CLI_SEND_DATA = "<write session_id='{}' format='base64'>{}</write>"
REQ_CLI_START = "<start idle_timeout='{}' session_id='{}'/>"
REQ_CLI_TERMINATE = "<terminate session_id='{}'/>"
REQ_DEVICE_REQUEST = "<requests>" \
                     "  <device_request target_name='{}'>" \
                     "{}" \
                     "</device_request>" \
                     "</requests>"
REQ_DO_COMMAND = "<rci_request version='1.1'>" \
                 "  <do_command target='{}'>" \
                 "    {}" \
                 "  </do_command>" \
                 "</rci_request>"
REQ_QUERY_SETTING_SYSTEM_MONITOR = "<rci_request version='1.1'>" \
                                   "  <query_setting>" \
                                   "    <system_monitor/>" \
                                   "  </query_setting>" \
                                   "</rci_request>"
REQ_QUERY_STATE = "<rci_request version='1.1'>" \
                  "  <query_state/>" \
                  "</rci_request>"
REQ_SET_SETTING_SYSTEM_MONITOR = "<rci_request version='1.1'>" \
                                 "  <set_setting>" \
                                 "    <system_monitor>" \
                                 "      <sample_rate>{}</sample_rate>" \
                                 "      <n_dp_upload>{}</n_dp_upload>" \
                                 "    </system_monitor>" \
                                 "  </set_setting>" \
                                 "</rci_request>"

SCHEMA_MONITOR_CLI = '[' \
                     '{{#each this}}' \
                     '{{#if @index}}, {{/if}}' \
                     '{ ' \
                     '{{#if CLIEvent.type}}' \
                     '{{#endsWith CLIEvent.type "data"}}' \
                     '"data": "{{{CLIEvent.data}}}",' \
                     '{{/endsWith}}' \
                     '{{#endsWith CLIEvent.type "terminate"}}' \
                     '"session_id": "{{CLIEvent.sessionId}}",' \
                     '{{#endsWith CLIEvent.hint "Idle Timeout Exceeded"}}' \
                     '"error": "{{CLIEvent.hint}}",' \
                     '{{/endsWith}}' \
                     '{{/endsWith}}' \
                     '{{/if}}' \
                     '"type": "{{CLIEvent.type}}"' \
                     '}' \
                     '{{/each}}' \
                     ']'
SCHEMA_MONITOR_DEVICE = '[' \
                        '{{#each this}}' \
                        '{{#if @index}}, {{/if}}' \
                        '{ ' \
                        '"device_id": "{{device.id}}",' \
                        '"status": "{{device.connection_status}}"' \
                        '}' \
                        '{{/each}}' \
                        ']'
SCHEMA_MONITOR_DP = '[' \
                    '{{#each this}}' \
                    '{{#if @index}}, {{/if}}' \
                    '{' \
                    '"stream": "{{remainingPathComponents (remainingPathComponents DataPoint.streamId)}}",' \
                    '"value": {{DataPoint.data}} ' \
                    '}' \
                    '{{/each}}' \
                    ']'
SCHEMA_MONITOR_DP_FILTER = '{{#eachFiltered this}}' \
                           '{{#endsWith DataPoint.streamId "%s"}}' \
                           '{{#if @first}}' \
                           '{' \
                           '"stream": "{{remainingPathComponents (remainingPathComponents DataPoint.streamId)}}",' \
                           '"value": {{DataPoint.data}} ' \
                           '}@@SEPARATOR@@' \
                           '{{/if}}' \
                           '{{/endsWith}}' \
                           '{{/eachFiltered}}'

SERVICE_WEB_SERVICE = "WebService messaging"
SERVICE_MONITOR = "Push Monitoring"

STATUS_ACTIVE = "active"
STATUS_CANCELED = "canceled"
STATUS_FAILED = "failed"

STREAMS_LIST = ["wlan0/state", "wlan0/rx_bytes", "wlan0/tx_bytes", "hci0/state", "hci0/rx_bytes", "hci0/tx_bytes",
                "eth0/state", "eth0/rx_bytes", "eth0/tx_bytes", "lo/state", "lo/rx_bytes", "lo/tx_bytes", "uptime",
                "frequency", "cpu_temperature", "cpu_load", "used_memory", "free_memory", "eth1/state",
                "eth1/rx_bytes", "eth1/tx_bytes"]

TARGET_DEVICE_INFO = "device_info"
TARGET_SET_AUDIO_VOLUME = "set_audio_volume"
TARGET_SET_LED = "user_led"
TARGET_SET_VIDEO_BRIGHTNESS = "set_video_brightness"

WS_DATA_USAGE_API = "/ws/v1/reports/usage/{}"
WS_FILES_API = "/ws/v1/files/{}"
WS_FIRMWARE_UPDATES_API = "/ws/v1/firmware_updates/{}"
WS_MONITOR_API = "/ws/Monitor/{}"

CLI_SESSION_TIMEOUT = 300

# Variables.
monitor_managers = {}


def is_authenticated(request):
    """
    Returns whether the user is authenticated or not.

    Args:
         request (:class:`.WSGIRequest`): The request used to verify if the
            user is authenticated or not.

    Returns:
        boolean: `True` if the user stored in the request session is
            authenticated, `False`otherwise.
    """
    dc = get_device_cloud(request)
    if dc is not None and dc is not False and dc.has_valid_credentials():
        return True
    return False


def get_device_cloud(request):
    """
    Returns the Device Cloud instance for the given request.

    Args:
         request (:class:`.WSGIRequest`): The request containing the user and
            password to generate the corresponding Device Cloud instance.

    Returns:
        :class:`.DeviceCloud`: The Device Cloud instance for the corresponding
            user and password stored in the request session.
    """
    return get_device_cloud_session(request.session)


def get_device_cloud_session(session):
    """
    Returns the Device Cloud instance for the given session.

    Args:
         session (:class:`.SessionStore`): The Django session containing the
            user and password to generate the corresponding Device Cloud
            instance.

    Returns:
        :class:`.DeviceCloud`: The Device Cloud instance for the corresponding
            user and password stored in the session.
    """
    user = session.get("user")
    if user is None:
        return None
    user_serialized = DeviceCloudUser.from_json(json.loads(user))
    # return DeviceCloud(user_serialized.username, user_serialized.password,
    #                    base_url=user_serialized.server)
    return DeviceCloud(user_serialized.username, user_serialized.password,
                       base_url="https://devicecloud.digi.com")


def check_ajax_request(request):
    """
    Checks whether the given AJAX request is valid and the user is
    authenticated.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        `None` if the request is valid, or a `JsonResponse` with the error
            if it is not.
    """
    if is_authenticated(request):
        if not request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest' or request.method != "POST":
            return JsonResponse({ID_ERROR: ERROR_NO_POST_REQUEST}, status=400)
        return None
    else:
        return JsonResponse({ID_ERROR: ERROR_NOT_AUTHENTICATED}, status=401)


def get_exception_response(e):
    """
    Returns the JSON response with the error contained in the given exception.

    Args:
        e (:class:`.Exception`): The exception.

    Returns:
        A JSON response with the details of the exception.
    """
    return JsonResponse({ID_ERROR: (ERROR_DRM_REQUEST.format(e.response.text)
                                    if isinstance(e, DeviceCloudHttpException) else str(e))},
                        status=400)


def send_device_request(request, target):
    """
    Sends a Device Request to DRM to the device with the given ID.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.
        target (String): the target of the Device Request.

    Returns:
        A JSON with the response or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    dc = get_device_cloud(request)

    device_id = request.POST[ID_DEVICE_ID]
    data = request.POST[ID_DATA] if ID_DATA in request.POST else None

    try:
        resp = send_request(dc, device_id, target, data)
        if resp is not None:
            return JsonResponse({ID_DATA: resp}, status=200)
        return JsonResponse({ID_VALID: True}, status=200)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def send_request(dc, device_id, target, data=None):
    """
    Sends a Device Request to the device with the given device ID using the
    given target and data.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        target (String): the target of the Device Request.
        data (String, optional): the data of the Device Request.

    Returns:
        The Device Request response (if any).

    Raises:
        DeviceCloudHttpException: if there is any error sending the Device
            Request.
    """
    # Generate the 'device_request' request.
    request = REQ_DEVICE_REQUEST.format(
        target, data if data is not None else "").strip()

    # Send the request and get the answer.
    resp = dc.sci.send_sci(OPERATION_DATA_SERVICE, DeviceTarget(device_id), request)

    # If the status is not 200, throw an exception.
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    # Find and return the response (if any).
    re_search = re.search(REGEX_DEV_REQUEST_RESPONSE, resp.text, re.IGNORECASE)
    if re_search:
        return re_search.group(1)

    return None


def send_do_command(dc, device_id, target, data=None):
    """
    Sends a 'do_command' request to the device with the given device ID using
    the given data.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        target (String): the 'do_command' target.
        data (String, optional): the data of the 'do_command' request.

    Returns:
        String: The 'do_command' XML response (if any).

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    # Generate the 'do_command' request.
    request = REQ_DO_COMMAND.format(target, data if data is not None else "")

    # Send the request and get the answer. Set cache to False in order to get
    # the answer from the device and not from DRM.
    resp = dc.sci.send_sci(OPERATION_SEND_MESSAGE, DeviceTarget(device_id),
                           request, cache=False)

    # If the status is not 200, throw an exception.
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    # Find and return the response (if any).
    re_search = re.search(REGEX_DO_CMD_RESPONSE, resp.text, re.IGNORECASE)
    if re_search:
        return re_search.group(1)

    return None


def get_cc_devices(request):
    """
    Returns a list containing the ConnectCore devices of the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        :class:`.HttpResponse`: An HTTP response with the list of the
            ConnectCore devices within the DRM account in JSON format.
    """
    connectcore_devices = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    for device in devices:
        # Get the type of the device and verify it is a ConnectCore device.
        if device.get_device_type() == "" or not device.get_device_type().startswith(PREFIX_VALID_DEVICE):
            continue

        connectcore_device = ConnectCoreDevice(device.get_connectware_id(), device.get_device_type())
        connectcore_devices.append(connectcore_device)
        # Set the online property to the farm.
        connectcore_device.is_online = device.is_connected()
        # If the location of the device is valid, set it to the farm.
        lat, lon = device.get_latlon()
        if lat is not None and lon is not None:
            connectcore_device.location = (lat, lon)

    return connectcore_devices


def provision_device(request, provision_value, provision_type):
    """
    Registers the device with the given provision value in the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
         provision_value (String): The provision value to register.
         provision_type (String): The provision type to register.

    Returns:
        Dictionary: Dictionary with the result.
    """
    dc = get_device_cloud(request)
    request_response = {}
    answer = {}

    try:
        if provision_type == PROVISION_TYPE_ID:
            request_response = dc.devicecore.provision_device(device_id=provision_value)
        elif provision_type == PROVISION_TYPE_MAC:
            request_response = dc.devicecore.provision_device(mac_address=provision_value)
        elif provision_type == PROVISION_TYPE_IMEI:
            request_response = dc.devicecore.provision_device(imei=provision_value)
        if ID_ERROR in request_response and request_response[ID_ERROR] is True:
            answer[ID_ERROR] = request_response[ID_ERROR_MSG]
    except DeviceCloudHttpException as e:
        answer[ID_ERROR] = e.response.text

    return answer


def set_cc_device_audio_volume(request, device_id, value):
    """
    Sets the audio volume of the given device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the ConnectCore DRM device.
        value (String): the new value to set to the audio volume.

    Returns:
        String: 'OK' on success, 'ERROR' otherwise.
    """
    dc = get_device_cloud(request)
    request_data = "%s" % value

    try:
        return send_request(dc, device_id, TARGET_SET_AUDIO_VOLUME,
                            data=request_data)
    except DeviceCloudHttpException as e:
        return e.response.text


def set_cc_device_video_brightness(request, device_id, value):
    """
    Sets the video brightness of the given device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the ConnectCore DRM device.
        value (String): the new value to set to the video brightness.

    Returns:
        String: 'OK' on success, 'ERROR' otherwise.
    """
    dc = get_device_cloud(request)
    request_data = "%s" % value

    try:
        return send_request(dc, device_id, TARGET_SET_VIDEO_BRIGHTNESS,
                            data=request_data)
    except DeviceCloudHttpException as e:
        return e.response.text


def set_led(request, device_id, led_name, value):
    """
    Sets the the new value of the given LED for the given device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the ConnectCore DRM device.
        led_name (String): the LED name.
        value (String): the new LED value.

    Returns:
        String: 'OK' on success, 'ERROR' otherwise.
    """
    dc = get_device_cloud(request)
    request_data = ("%s" % value).lower()

    try:
        return send_request(dc, device_id, TARGET_SET_LED,
                            data=request_data)
    except DeviceCloudHttpException as e:
        return e.response.text


def get_current_data_point(dc, stream_id):
    """
    Returns the latest data point value from the stream with the given ID.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        stream_id (String): the ID of the stream to get the data point from.

    Returns:
        String: the latest data point from the given stream, `None` if there is
            not any stream with the given ID.
    """
    stream = dc.streams.get_stream_if_exists(stream_id)
    if stream is not None:
        return stream.get_current_value()
    return None


def get_data_points(request, stream_name):
    """
    Returns the list of data points in JSON format of the given data stream.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.
        stream_name (String): the data stream name.

    Returns:
        A JSON with the data points or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    dc = get_device_cloud(request)
    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    interval = data[ID_INTERVAL]
    if interval is None:
        interval = 1
    else:
        interval = int(data[ID_INTERVAL])

    # Build the stream ID.
    stream_id = "{}/{}".format(device_id, stream_name)

    strm = dc.streams.get_stream(stream_id)
    datapoints = []

    # Establish rollup values for requests exceeding 1 hour.
    rollup_interval = None
    rollup_method = None
    if interval != 1:
        rollup_method = "average"
        if interval == 24:  # Day -> 48 samples
            rollup_interval = "half"
        elif interval == 168:  # Week -> 168 samples
            rollup_interval = "hour"
        elif interval == 720:  # Month -> 31 samples
            rollup_interval = "day"

    for dp in strm.read(
            start_time=(datetime.now(timezone.utc) - timedelta(hours=interval)),
            newest_first=False,
            rollup_interval=rollup_interval,
            rollup_method=rollup_method):
        datapoints.append({ID_TIMESTAMP: dp.get_timestamp().timestamp() * 1000,
                           ID_DATA: (dp.get_data() / 1024) if "memory" in stream_name else dp.get_data()})

    return {ID_DATA: datapoints}


def get_device_information(request, device_id):
    """
    Obtains the information of the device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID of the ConnectCore DRM device.

    Return:
        Dictionary: Dictionary containing the device information.
    """
    # Initialize variables.
    info = {}
    dc = get_device_cloud(request)
    # Send request to retrieve device information from the state.
    response = dc.sci.send_sci(OPERATION_SEND_MESSAGE,
                               DeviceTarget(device_id),
                               REQ_QUERY_STATE,
                               allow_offline=True,
                               cache=True,
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            info[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return info
        # Check the U-Boot version element.
        uboot_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_UBOOT_VERSION))
        if uboot_version:
            info[ID_UBOOT_VERSION] = uboot_version[0].text
        # Check the Kernel version element.
        kernel_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_KERNEL_VERSION))
        if kernel_version:
            info[ID_KERNEL_VERSION] = kernel_version[0].text
        # Check the DEY version element.
        dey_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_DEY_VERSION))
        if dey_version:
            info[ID_DEY_VERSION] = dey_version[0].text
        # Check the hardware element.
        hardware = root.findall("%s%s" % (ID_ANY_LEVEL, ID_HARDWARE))
        if hardware:
            # Find and fill hardware fields.
            re_search = re.search(REGEX_INFO_HARDWARE, hardware[0].text, re.IGNORECASE)
            if re_search and len(re_search.groups()) >= 5:
                info[ID_SERIAL_NUMBER] = re_search.group(1)
                info[ID_DEVICE_TYPE] = re_search.group(2)
                info[ID_MODULE_VARIANT] = re_search.group(3)
                info[ID_BOARD_VARIANT] = re_search.group(4)
                info[ID_BOARD_ID] = re_search.group(5)
        # Check the kinetis element.
        kinetis = root.findall("%s%s" % (ID_ANY_LEVEL, ID_KINETIS))
        if kinetis:
            # Find and fill kinetis fields.
            re_search = re.search(REGEX_INFO_KINETIS, kinetis[0].text, re.IGNORECASE)
            if re_search and len(re_search.groups()) >= 2:
                info[ID_MCA_HW_VERSION] = re_search.group(1)
                info[ID_MCA_FW_VERSION] = re_search.group(2)
    except ParseError:
        info[ID_ERROR] = ERROR_PARSING
        return info
    # Send request to retrieve device information from system monitor settings.
    try:
        response = get_system_monitor_settings(request, device_id)
        if ID_ERROR in response:
            info[ID_ERROR] = response[ID_ERROR]
            return info
        info[ID_SAMPLE_RATE] = response[ID_SAMPLE_RATE]
        info[ID_NUM_SAMPLES_UPLOAD] = response[ID_NUM_SAMPLES_UPLOAD]
    except DeviceCloudHttpException as e:
        info[ID_ERROR] = e.response.text
        return info
    # Send request to retrieve device information from device request.
    try:
        response = send_request(dc, device_id, TARGET_DEVICE_INFO, data="")
        if response is None or "not registered" in response:
            info[ID_ERROR] = ERROR_DEVICE_NOT_ANSWER
            return info
        if "CCAPI Error" in response:
            info[ID_ERROR] = response
            return info
        # Parse the response.
        information = json.loads(response)
        # Fill the information dictionary with the information from the device.
        if ID_TOTAL_MEMORY in information:
            info[ID_MEMORY_TOTAL] = information[ID_TOTAL_MEMORY]
        else:
            info[ID_MEMORY_TOTAL] = DEFAULT_MEMORY_TOTAL
        if ID_TOTAL_STORAGE in information:
            info[ID_FLASH_SIZE] = information[ID_TOTAL_STORAGE]
        else:
            info[ID_FLASH_SIZE] = DEFAULT_FLASH_SIZE
        if ID_RESOLUTION in information and len(information[ID_RESOLUTION]) > 0:
            info[ID_VIDEO_RESOLUTION] = "%s pixels" % information[ID_RESOLUTION]
        else:
            info[ID_VIDEO_RESOLUTION] = DEFAULT_VIDEO_RESOLUTION
        if ID_BT_MAC in information:
            info[ID_BLUETOOTH_MAC] = information[ID_BT_MAC]
        else:
            info[ID_BLUETOOTH_MAC] = DEFAULT_MAC
        if IFACE_WIFI in information:
            info[ID_WIFI_MAC] = information[IFACE_WIFI][ID_MAC]
            info[ID_WIFI_IP] = information[IFACE_WIFI][ID_IP]
        else:
            info[ID_WIFI_MAC] = DEFAULT_MAC
            info[ID_WIFI_IP] = DEFAULT_IP
        for index in range(0, NUM_ETHERNET_INTERFACES):
            if "eth%s" % index in information:
                info["ethernet%s_mac" % index] = information["eth%s" % index][ID_MAC]
                info["ethernet%s_ip" % index] = information["eth%s" % index][ID_IP]
            else:
                info["ethernet%s_mac" % index] = DEFAULT_MAC
                info["ethernet%s_ip" % index] = DEFAULT_IP
    except DeviceCloudHttpException as e:
        info[ID_ERROR] = e.response.text
        return info

    # Return the device information.
    return info


def get_general_device_status(request, device_id):
    """
    Obtains the status of the device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID of the ConnectCore DRM device.

    Return:
        Dictionary: Dictionary containing the device general status.
    """
    # Initialize variables.
    dc = get_device_cloud(request)

    status = {}

    # Get all streams of the given controller.
    streams = dc.streams.get_streams(stream_prefix=device_id)

    # Get the data of the device.
    for stream in streams:
        stream_id = stream.get_stream_id()
        try:
            data = stream.get_current_value(True).get_data()
        except (DeviceCloudException, DeviceCloudHttpException):
            data = ""
        status[stream_id.replace("%s/" % device_id, "")] = data

    return status


def initialize_cli_session(request, device_id):
    """
    Initializes a CLI session with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to initialize
            the CLI session with.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to initialize a CLI session.
    response = dc.sci.send_sci(OPERATION_CLI,
                               DeviceTarget(device_id),
                               REQ_CLI_INITIALIZE,
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
        # Check the session ID.
        initialize_element = root.findall("%s%s" % (ID_ANY_LEVEL, ID_INITIALIZE))
        if initialize_element is not None and initialize_element[0] is not None \
                and initialize_element[0].attrib[ID_SESSION_ID] is not None:
            answer[ID_SESSION_ID] = initialize_element[0].attrib[ID_SESSION_ID]
        else:
            answer[ID_ERROR] = ERROR_NO_SESSION_ID
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def start_cli_session(session, device_id, session_id):
    """
    Starts the CLI session with the given session ID.

    Args:
        session (:class:`.SessionStore`): The Django session.
        device_id (String): The ID of the ConnectCore device to start
            the CLI session with.
        session_id (String): The ID CLI session to start.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud_session(session)
    if dc is None:
        return -1
    # Send request to start a CLI session.
    response = dc.sci.send_sci(OPERATION_CLI,
                               DeviceTarget(device_id),
                               REQ_CLI_START.format(CLI_SESSION_TIMEOUT, session_id),
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def stop_cli_session(request, device_id, session_id):
    """
    Stops a CLI session with the given ID for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to stop
            the CLI session with.
        session_id (String): The ID of CLI session to stop.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to stop a CLI session.
    response = dc.sci.send_sci(OPERATION_CLI,
                               DeviceTarget(device_id),
                               REQ_CLI_TERMINATE.format(session_id),
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def send_cli_data(request, device_id, session_id, data):
    """
    Sends CLI data to the given device ID using the given CLI session ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to send
            CLI data to.
        session_id (String): The ID of CLI session.
        data (String): Base64 encoded data to send.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to stop a CLI session.
    response = dc.sci.send_sci(OPERATION_CLI,
                               DeviceTarget(device_id),
                               REQ_CLI_SEND_DATA.format(session_id, data),
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def register_cli_monitor(session, device_id, session_id, consumer):
    """
    Creates a Device Cloud monitor to be notified when the CLI session
    sends new data.

    Args:
        session (:class:`.SessionStore`): The Django session.
        device_id (String): ID of the device to subscribe the CLI session to.
        session_id (String): ID of CLI session.
        consumer (:class:`.WsConsumer`): The web socket consumer.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    topic = "CLIEvent/%s/%s" % (device_id, session_id)
    dc = get_device_cloud_session(session)
    if dc is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    if session_id in monitor_managers:
        monitor_manager = monitor_managers.get(session_id)
    else:
        monitor_manager = MonitorManager(dc.get_connection())
        monitor_managers[session_id] = monitor_manager

    # Clean inactive monitors.
    remove_inactive_monitors(dc, "CLIEvent", device_id)

    # Create the monitor for the CLI session.
    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema([topic], SCHEMA_MONITOR_CLI)

        # Define the monitor callback.
        def monitor_callback(json_data):
            for cli_event in json_data:
                # Create payload.
                payload = {ID_TYPE: cli_event[ID_TYPE]}
                # Check message type.
                if cli_event[ID_TYPE] == CLI_TYPE_START:
                    consumer.send(text_data=json.dumps(payload))
                elif cli_event[ID_TYPE] == CLI_TYPE_DATA:
                    payload[ID_DATA] = cli_event[ID_DATA]
                    consumer.send(text_data=json.dumps(payload))
                elif cli_event[ID_TYPE] == CLI_TYPE_TERMINATE:
                    # Disconnect the monitor.
                    remove_cli_monitor(session, cli_event[ID_SESSION_ID], monitor.get_id())
                    # Check error information.
                    if ID_ERROR in cli_event:
                        payload[ID_ERROR] = cli_event[ID_ERROR]
                    consumer.send(text_data=json.dumps(payload))
            return True

        # Add the monitor callback.
        monitor.add_callback(monitor_callback)
        # Save the monitor ID.
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as e:
        re_search = re.search(REGEX_MONITOR_ERROR, str(e), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(e)

    return answer


def remove_cli_monitor(session, session_id, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for updates in the given CLI session ID.

    Args:
        session (:class:`.SessionStore`): The Django session.
        session_id (:class:`.SessionStore`): The CLI session ID.
        monitor_id (int): The ID of the monitor to delete.
    """
    dc = get_device_cloud_session(session)
    if dc is None:
        return

    global monitor_managers

    # Get the monitor manager for the given session ID.
    if session_id not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_id)

    # Stop the monitor.
    monitor_manager.stop_listeners()

    # Delete the monitor.
    try:
        dc.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as e:
        print(e)


def list_directory(request, device_id, directory):
    """
    Lists the contents of the given directory for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to list the
            directory contents from.
        directory (String): The directory to list its contents.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to list directory contents.
    try:
        response = dc.file_system_service.list_files(DeviceTarget(device_id),
                                                     directory)
        for device_id, device_data in response.items():
            # Check if it succeeded or was an error
            if isinstance(device_data, ErrorInfo):
                if device_data.message is not None:
                    answer[ID_ERROR] = ERROR_LIST_DIRECTORY % (device_data.errno, device_data.message)
                else:
                    answer[ID_ERROR] = ERROR_LIST_DIRECTORY % device_data.errno
                break
            # It's of type LsInfo
            else:
                answer[ID_CURRENT_DIRECTORY] = directory
                answer[ID_FILES] = []
                # Look at all the directories
                for dinfo in device_data.directories:
                    directory = {ID_TYPE: FS_TYPE_DIRECTORY,
                                 ID_NAME: dinfo.path, ID_LAST_MODIFIED: dinfo.last_modified}
                    answer[ID_FILES].append(directory)
                # Look at all the files
                for finfo in device_data.files:
                    file = {ID_TYPE: FS_TYPE_FILE, ID_NAME: finfo.path, ID_SIZE: finfo.size,
                            ID_LAST_MODIFIED: finfo.last_modified}
                    answer[ID_FILES].append(file)

        # Sort the directory results.
        def sort_name(e):
            return e[ID_NAME]

        def sort_type(e):
            return e[ID_TYPE]

        answer[ID_FILES].sort(key=sort_name)
        answer[ID_FILES].sort(key=sort_type)
    except FileSystemServiceException:
        answer[ID_ERROR] = ERROR_LIST_DIRECTORY % (ERROR_UNKNOWN, ERROR_UNRECOGNIZED_ANSWER)

    return answer


def remove_file(request, device_id, path, is_file):
    """
    Removes the given file path for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to remove the
            file from.
        path (String): The file path to remove.
        path (Boolean): True if the path is a file, False if it is a directory.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to remove the file.
    try:
        response = dc.file_system_service.delete_file(DeviceTarget(device_id),
                                                      path)
        for device_id, device_data in response.items():
            # Check if it succeeded or was an error
            if isinstance(device_data, ErrorInfo):
                if device_data.message is not None:
                    answer[ID_ERROR] = ERROR_REMOVE_FILE % (device_data.errno, device_data.message)
                else:
                    answer[ID_ERROR] = ERROR_REMOVE_FILE % device_data.errno
                break
    except FileSystemServiceException:
        answer[ID_ERROR] = ERROR_REMOVE_FILE % (ERROR_UNKNOWN, ERROR_UNRECOGNIZED_ANSWER)

    return answer


def upload_file(request, device_id, path, content):
    """
    Uploads the given file to the given path for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to upload the
            file to.
        path (String): The path to upload the file to.
        content (six.binary_type): The file content.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to upload the file.
    try:
        response = dc.file_system_service.put_file(DeviceTarget(device_id),
                                                   path,
                                                   file_data=content)
        for device_id, device_data in response.items():
            # Check if it succeeded or was an error
            if isinstance(device_data, ErrorInfo):
                if device_data.message is not None:
                    answer[ID_ERROR] = ERROR_UPLOAD_FILE % (device_data.errno, device_data.message)
                else:
                    answer[ID_ERROR] = ERROR_UPLOAD_FILE % device_data.errno
                break
    except FileSystemServiceException:
        answer[ID_ERROR] = ERROR_UPLOAD_FILE % (ERROR_UNKNOWN, ERROR_UNRECOGNIZED_ANSWER)

    return answer


def download_file(request, device_id, path):
    """
    Uploads the given file to the given path for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to download the
            file from.
        path (String): The path to download the file from.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to download the file.
    try:
        response = dc.file_system_service.get_file(DeviceTarget(device_id),
                                                   path)
        for device_id, device_data in response.items():
            # Check if it succeeded or was an error
            if isinstance(device_data, ErrorInfo):
                if device_data.message is not None:
                    answer[ID_ERROR] = ERROR_DOWNLOAD_FILE % (device_data.errno, device_data.message)
                else:
                    answer[ID_ERROR] = ERROR_DOWNLOAD_FILE % device_data.errno
                break
            # It's of type LsInfo
            else:
                answer = device_data
    except FileSystemServiceException:
        answer[ID_ERROR] = ERROR_DOWNLOAD_FILE % (ERROR_UNKNOWN, ERROR_UNRECOGNIZED_ANSWER)

    return answer


def create_dir(request, device_id, path):
    """
    Creates the given directory path for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to create the
            directory in.
        path (String): The directory path to create.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Create a dummy file in the given path.
    dummy_file_path = "%s/%s" % (path, DUMMY_FILE_NAME)
    answer = upload_file(request, device_id, dummy_file_path, DUMMY_FILE_CONTENT.encode('ascii'))
    if ID_ERROR in answer:
        answer[ID_ERROR] = ERROR_CREATE_DIRECTORY
        return answer
    # Remove the dummy file.
    answer = remove_file(request, device_id, dummy_file_path, True)
    if ID_ERROR in answer:
        answer[ID_ERROR] = ERROR_CREATE_DIRECTORY

    return answer


def reboot_remote_device(request, device_id):
    """
    Reboots the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to reboot.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to reboot the device.
    response = dc.sci.send_sci(OPERATION_REBOOT,
                               DeviceTarget(device_id),
                               "",
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def create_new_file(request, file_set, path, file_name, file):
    """
    Creates a new file in the DRM account using the given information.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        file_set (String): The file set the new file will belong to.
        path (String): The path to upload the file to.
        file_name (String): The name of the file.
        file (:class:.`TemporaryUploadedFile`): The file to upload.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the file URL.
    file_url = WS_FILES_API.format("%s/%s/%s/%s" % (ID_INVENTORY, file_set, path, file_name))
    # Check if file already exists.
    file_exists = False
    try:
        response = dc.get_connection().get(file_url)
        if response.status_code == 200:
            file_exists = True
    except DeviceCloudHttpException:
        pass
    # If the file already exists, remove it.
    if file_exists:
        try:
            dc.get_connection().delete(file_url)
        except DeviceCloudHttpException:
            pass

    class IterableToFileAdapter(object):
        def __init__(self, iterable, name):
            self.iterator = iter(iterable)
            self.file_name = name
            self.length = len(iterable)
            self.total_read = 0
            self.prev_progress = 0
            self.offset = 0
            self.chunk = bytes()
            self.canceled = False
            # Register the cancel callback.
            get_cancel_request_manager().add_callback(self.file_name, self.request_canceled)

        def up_to_iter(self, size):
            while size:
                if self.offset == len(self.chunk):
                    try:
                        self.chunk = next(self.iterator)
                    except StopIteration:
                        break
                    else:
                        self.offset = 0
                to_yield = min(size, len(self.chunk) - self.offset)
                self.offset = self.offset + to_yield
                size -= to_yield
                yield self.chunk[self.offset - to_yield:self.offset]

        def read(self, size=-1):
            value = bytes().join(self.up_to_iter(float('inf') if size is None or size < 0 else size))
            if value is None or self.canceled:
                get_cancel_request_manager().remove_callback(self.file_name)
                return None
            self.total_read = self.total_read + len(value) if value else self.total_read
            progress = int(self.total_read * 100 / self.length)
            if progress != self.prev_progress:
                self.prev_progress = progress
                # Notify to subscribed channels.
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    GROUP_UPLOAD_PROGRESS.format(self.file_name),
                    {ID_TYPE: "progress.received", ID_DATA: progress}
                )
            return value

        def request_canceled(self):
            self.canceled = True

        def __len__(self):
            return self.length

    # Declare timeout values.
    timeouts = (2.0, 2.0)
    # Send request to create the file.
    try:
        if file.multiple_chunks():
            response = dc.get_connection().post(file_url, IterableToFileAdapter(file, file_name), timeout=timeouts)
        else:
            response = dc.get_connection().post(file_url, file.file.getvalue(), timeout=timeouts)
        if response.status_code != 200:
            if response.text is not None and response.text != "":
                answer[ID_ERROR] = ERROR_CREATE_FILE % json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CREATE_FILE % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_CREATE_FILE % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CREATE_FILE % e.response.status_code
    return answer


def update_remote_firmware(request, device_id, file):
    """
    Updates the firmware of the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to update the
            firmware of.
        file (String): The complete path to the firmware file to use.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL.
    request_url = WS_FIRMWARE_UPDATES_API.format(ID_INVENTORY)
    # Build the request.
    request_data = {ID_TARGETS: {ID_DEVICES: [device_id]}, ID_FILE: file}
    # Build the headers.
    headers = {ID_CONTENT_TYPE: CONTENT_TYPE_PRETTY_JSON}
    # Send request to update the firmware.
    try:
        response = dc.get_connection().post(request_url, data=json.dumps(request_data), headers=headers)
        if response.status_code != 200:
            if response.text is not None and response.text != "":
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % e.response.status_code

    return answer


def check_remote_firmware_update_running(request, device_id):
    """
    Checks if there is a firmware update running for the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to check if there is a
            firmware update running for.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    update_status = check_remote_firmware_update_status(request, device_id)
    if ID_STATUS in update_status and update_status[ID_STATUS] == STATUS_ACTIVE:
        answer[ID_UPDATE_RUNNING] = True
    else:
        answer[ID_UPDATE_RUNNING] = False

    return answer


def check_remote_firmware_update_status(request, device_id):
    """
    Checks the firmware update status for the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to check the
            firmware update status for.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL.
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_INVENTORY, device_id))
    # Send request to check whether firmware update is running in the device.
    try:
        response = dc.get_connection().get(request_url)
        if response.status_code == 200:
            status = json.loads(response.text)[ID_STATUS]
            answer[ID_STATUS] = status
            if status in [STATUS_FAILED, STATUS_CANCELED]:
                answer[ID_MESSAGE] = json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_MESSAGE] = json.loads(response.text)[ID_MESSAGE] if \
                    ID_MESSAGE in json.loads(response.text) else ""
        elif response.text is not None and response.text != "":
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % json.loads(response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % e.response.status_code

    return answer


def check_remote_firmware_update_progress(request, device_id):
    """
    Checks the firmware update progress for the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to check the
            firmware update progress for.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL.
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_PROGRESS, device_id))
    # Send request to check the firmware update progress.
    try:
        response = dc.get_connection().get(request_url)
        if response.status_code == 200:
            if ID_PROGRESS in json.loads(response.text):
                answer[ID_PROGRESS] = json.loads(response.text)[ID_PROGRESS][0][ID_STATUS]
                answer[ID_MESSAGE] = json.loads(response.text)[ID_PROGRESS][0][ID_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % ERROR_NO_PROGRESS_INFO
        elif response.text is not None and response.text != "":
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % json.loads(response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % e.response.status_code

    return answer


def cancel_remote_firmware_update(request, device_id):
    """
    Cancels the firmware update process for the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to cancel the
            firmware update process for.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL.
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_CANCEL, device_id))
    # Send request to check the firmware update progress.
    try:
        response = dc.get_connection().post(request_url, data="")
        if response.status_code != 200:
            if response.text is not None and response.text != "":
                answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % e.response.status_code

    return answer


def list_fileset(request, file_set):
    """
    Lists all the files of the Remote Manager account contained in the given file set.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        file_set (String): The file set to list all the available files.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL.
    request_url = WS_FILES_API.format("%s/%s" % (ID_INVENTORY, file_set))
    # Send request to retrieve the list of files.
    try:
        response = dc.get_connection().get(request_url)
        if response.status_code == 200:
            files = []
            for file in json.loads(response.text)[ID_LIST]:
                file_entry = {}
                name = file[ID_NAME]
                file_entry[ID_PATH] = "/".join(name.split("/")[:-1]) if "/" in name else ""
                file_entry[ID_NAME] = name.split("/")[-1] if "/" in name else name
                file_entry[ID_SIZE] = file[ID_SIZE]
                file_entry[ID_LAST_MODIFIED] = file[ID_LAST_MODIFIED]
                files.append(file_entry)
            answer[ID_FILES] = files
        else:
            if response.text is not None and response.text != "":
                answer[ID_ERROR] = ERROR_LIST_FILESET % json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_LIST_FILESET % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_LIST_FILESET % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_LIST_FILESET % e.response.status_code

    return answer


def get_system_monitor_settings(request, device_id):
    """
    Retrieves the device system monitor settings.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to retrieve the system monitor settings.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to retrieve device information from system monitor settings.
    response = dc.sci.send_sci(OPERATION_SEND_MESSAGE,
                               DeviceTarget(device_id),
                               REQ_QUERY_SETTING_SYSTEM_MONITOR,
                               allow_offline=False,
                               cache=False,
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
        # Check the sample rate.
        sample_rate = root.findall("%s%s" % (ID_ANY_LEVEL, ID_SAMPLE_RATE))
        answer[ID_SAMPLE_RATE] = sample_rate[0].text if sample_rate else DEFAULT_SAMPLE_RATE
        # Check the number of samples to upload.
        num_samples_upload = root.findall("%s%s" % (ID_ANY_LEVEL, ID_N_DP_UPLOAD))
        answer[ID_NUM_SAMPLES_UPLOAD] = num_samples_upload[0].text if num_samples_upload else DEFAULT_NUM_SAMPLES_UPLOAD
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING
    return answer


def set_system_monitor_settings(request, device_id, sample_rate, samples_buffer):
    """
    Changes the device system monitor settings with the provided ones.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to change the system monitor settings.
        sample_rate (String): The new system monitor sample rate.
        samples_buffer (string): The new system monitor samples buffer size to upload.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Send request to retrieve device information from system monitor settings.
    response = dc.sci.send_sci(OPERATION_SEND_MESSAGE,
                               DeviceTarget(device_id),
                               REQ_SET_SETTING_SYSTEM_MONITOR.format(sample_rate, samples_buffer),
                               allow_offline=False,
                               cache=False,
                               wait_for_reconnect=False,
                               sync_timeout=5)
    # If the status is not 200, throw an exception.
    if response.status_code != 200:
        raise DeviceCloudHttpException(response)
    # Parse the response
    try:
        root = et.fromstring(response.content)
        # Check error element in response.content.
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def get_account_data_usage(request):
    """
    Returns the DRM account data usage.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    # Initialize variables.
    answer = {}
    dc = get_device_cloud(request)
    # Build the URL for usage summary.
    request_url = WS_DATA_USAGE_API.format(ID_DATA_SUMMARY)
    # Send request to retrieve the data usage summary.
    try:
        response = dc.get_connection().get(request_url)
        if response.status_code == 200:
            json_answer = json.loads(response.text)
            answer[ID_DATA_USAGE_TOTAL] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_MB]
            answer[ID_DATA_USAGE_DEVICES] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_DEVICES_MB]
            answer[ID_DATA_USAGE_WEB] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_WS_MB]
            # Build the URL for usage details.
            request_url = WS_DATA_USAGE_API.format(ID_DATA_DETAILS)
            # Send request to retrieve the data usage summary.
            response = dc.get_connection().get(request_url)
            if response.status_code == 200:
                answer[ID_DEVICES] = []
                for entry in json.loads(response.text)[ID_LIST]:
                    if ID_DEVICE_ID in entry:
                        device = {ID_DEVICE_ID: entry[ID_DEVICE_ID], ID_USAGE: entry[ID_USAGE]}
                        answer[ID_DEVICES].append(device)
                    elif entry[ID_SERVICE_DESCRIPTION] == SERVICE_WEB_SERVICE:
                        answer[ID_DATA_USAGE_WEB_SERVICES] = entry[ID_USAGE]
                    elif entry[ID_SERVICE_DESCRIPTION] == SERVICE_MONITOR:
                        answer[ID_DATA_USAGE_MONITORS] = entry[ID_USAGE]
            else:
                if response.text is not None and response.text != "":
                    answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(response.text)[ID_ERROR_MESSAGE]
                else:
                    answer[ID_ERROR] = ERROR_GET_DATA_USAGE % response.status_code
        else:
            if response.text is not None and response.text != "":
                answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(response.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_GET_DATA_USAGE % response.status_code
    except DeviceCloudHttpException as e:
        if e.response.text is not None and e.response.text != "":
            answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(e.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_GET_DATA_USAGE % e.response.status_code

    return answer


def is_device_online(request, device_id):
    """
    Returns whether the device corresponding to the given ID is connected or
    not.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to check its
            connection status.

    Returns:
        Boolean: `True` if the device is online, `False` otherwise.
    """
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    for device in devices:
        if device.get_connectware_id() != device_id:
            continue
        return device.is_connected()
    return False


def register_datapoints_monitor(session, device_id, consumer):
    """
    Creates a Device Cloud monitor to be notified when the given device
    uploads a new data point.

    Args:
        session (:class:`.SessionStore`): The Django session.
        device_id (String): ID of the device.
        consumer (:class:`.WsConsumer`): The web socket consumer.

    Returns:
        The ID of the created monitor.
    """
    # Initialize variables.
    answer = {}
    topic = "DataPoint/{}".format(device_id)
    dc = get_device_cloud_session(session)
    if dc is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key in monitor_managers:
        monitor_manager = monitor_managers.get(session_key)
    else:
        monitor_manager = MonitorManager(dc.get_connection())
        monitor_managers[session_key] = monitor_manager

    # Clean inactive monitors.
    remove_inactive_monitors(dc, "DataPoint", device_id)

    # Build the monitor schema.
    schema = "["
    for stream in STREAMS_LIST:
        if STREAMS_LIST.index(stream) != len(STREAMS_LIST) - 1:
            # Separate data point entries with comma.
            schema = schema + SCHEMA_MONITOR_DP_FILTER.replace("@@SEPARATOR@@", ",") % stream
        else:
            # Remove last datapoint separator to avoid JSON error.
            schema = schema + SCHEMA_MONITOR_DP_FILTER.replace("@@SEPARATOR@@", "") % stream
    schema = schema + "]"

    # Create the monitor to receive data points updates.
    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema([topic],
                                                                 schema,
                                                                 batch_size=len(STREAMS_LIST) * DATA_POINTS_BUFFER_SIZE,
                                                                 batch_duration=DATA_POINTS_BUFFER_DURATION)

        # Define the monitor callback.
        def monitor_callback(json_data):
            for data_point in json_data:
                # Sanity checks.
                if ID_VALUE not in data_point or ID_STREAM not in data_point:
                    continue
                # Push new data point to the web socket.
                consumer.send(text_data=json.dumps(data_point))
            return True

        # Add the monitor callback.
        monitor.add_callback(monitor_callback)
        # Save the monitor ID.
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as e:
        re_search = re.search(REGEX_MONITOR_ERROR, str(e), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(e)

    return answer


def remove_datapoints_monitor(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for data point changes.

    Args:
        session (:class:`.SessionStore`): The Django session.
        monitor_id (int): The ID of the monitor to delete.
    """
    dc = get_device_cloud_session(session)
    if dc is None:
        return

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_key)

    # Stop the monitor.
    monitor_manager.stop_listeners()

    # Delete the monitor.
    try:
        dc.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as e:
        print(e)


def register_device_monitor(session, device_id, consumer):
    """
    Creates a Device Cloud monitor to be notified when devices of the
    account connect or disconnect.

    Args:
        session (:class:`.SessionStore`): The Django session.
        device_id (String): ID of the device.
        consumer (:class:`.WsConsumer`): The web socket consumer.

    Returns:
        The ID of the created monitor.
    """
    # Initialize variables.
    answer = {}
    topic = "devices/{}".format(device_id)
    dc = get_device_cloud_session(session)
    if dc is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key in monitor_managers:
        monitor_manager = monitor_managers.get(session_key)
    else:
        monitor_manager = MonitorManager(dc.get_connection())
        monitor_managers[session_key] = monitor_manager

    # Clean inactive monitors.
    remove_inactive_monitors(dc, "devices", device_id)

    # Create the monitor to receive device events for the given device id.
    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema([topic],
                                                                 SCHEMA_MONITOR_DEVICE,
                                                                 batch_size=1,
                                                                 batch_duration=0)

        # Define the monitor callback.
        def monitor_callback(json_data):
            for event in json_data:
                # Push new event to the web socket.
                consumer.send(text_data=json.dumps(event))
            return True

        # Add the monitor callback.
        monitor.add_callback(monitor_callback)
        # Save the monitor ID.
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as e:
        re_search = re.search(REGEX_MONITOR_ERROR, str(e), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(e)

    return answer


def remove_device_monitor(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for device connections.

    Args:
        session (:class:`.SessionStore`): The Django session.
        monitor_id (int): The ID of the monitor to delete.
    """
    dc = get_device_cloud_session(session)
    if dc is None:
        return

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_key)

    # Stop the monitor.
    monitor_manager.stop_listeners()

    # Delete the monitor.
    try:
        dc.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as e:
        print(e)


def remove_inactive_monitors(dc, topic_hint, device_id=None):
    """
    Removes inactive Remote Manager monitors containing the given topic hint and device ID.

    Args:
        dc (:class:`.DeviceCloud`): The Device Cloud instance.
        topic_hint (String): Hint that must be included in the inactive monitor topic.
        device_id (String): Device ID that must be contained in the inactive monitor topic.
    """
    # Clean inactive monitors.
    monitors = dc.monitor.get_monitors(MON_TRANSPORT_TYPE_ATTR == "tcp" and MON_STATUS_ATTR == "INACTIVE")
    for monitor in monitors:
        if topic_hint in monitor.get_metadata()["monTopic"]:
            del_monitor = True
            if device_id and device_id not in monitor.get_metadata()["monTopic"]:
                del_monitor = False
            if del_monitor:
                print("Deleted inactive monitor %s" % monitor.get_metadata()["monId"])
                monitor.delete()


class MonitorManager(MonitorAPI):
    """
    Class used to manage the use of Device Cloud monitors.
    """

    def __init__(self, conn):
        MonitorAPI.__init__(self, conn)
        self._tcp_client_manager = TCPClientManager(self._conn, secure=False)

    def create_tcp_monitor_with_schema(self, topics, schema, batch_size=1, batch_duration=0,
                                       compression='gzip', format_type='json'):
        """Creates a TCP Monitor instance in Device Cloud for a given list of topics

        :param topics: a string list of topics (e.g. ['DeviceCore[U]',
                  'FileDataCore']).
        :param schema: a string specifying the handlebars schema for the monitor push requests.
        :param batch_size: How many Msgs received before sending data.
        :param batch_duration: How long to wait before sending batch if it
            does not exceed batch_size.
        :param compression: Compression value (i.e. 'gzip').
        :param format_type: What format server should send data in (i.e. 'xml' or 'json').

        Returns an object of the created Monitor
        """

        monitor_xml = """\
        <Monitor>
            <monTopic>{topics}</monTopic>
            <monBatchSize>{batch_size}</monBatchSize>
            <monBatchDuration>{batch_duration}</monBatchDuration>
            <monFormatType>{format_type}</monFormatType>
            <monTransportType>tcp</monTransportType>
            <monCompression>{compression}</monCompression>
            <monSchemaType>handlebars</monSchemaType>
            <monSchemaData>{schema}</monSchemaData>
        </Monitor>
        """.format(
            topics=','.join(topics),
            batch_size=batch_size,
            batch_duration=batch_duration,
            format_type=format_type,
            compression=compression,
            schema=schema,
        )
        monitor_xml = textwrap.dedent(monitor_xml)
        response = self._conn.post("/ws/Monitor", monitor_xml)
        location = et.fromstring(response.text).find('.//location').text
        monitor_id = int(location.split('/')[-1])
        return TCPDeviceCloudMonitor(self._conn, monitor_id, self._tcp_client_manager)


class CancelRequestManager:
    """
    Dictionary of cancel requests with corresponding callback.
    """

    def __init__(self):
        self.callbacks = {}

    def add_callback(self, request_id, callback):
        """
        Adds a callback to the dictionary.
        """
        self.callbacks[request_id] = callback

    def remove_callback(self, request_id):
        """
        Removes a callback from the dictionary.
        """
        self.callbacks.pop(request_id, None)

    def notify_callback(self, request_id):
        """
        Notifies the callback associated with the given request ID.
        """
        if request_id in self.callbacks:
            self.callbacks[request_id]()


def get_cancel_request_manager():
    """
    Returns the cancel request manager.
    """
    return cancel_request_manager


# Default global instance of the cancel requests manager.
cancel_request_manager = CancelRequestManager()
