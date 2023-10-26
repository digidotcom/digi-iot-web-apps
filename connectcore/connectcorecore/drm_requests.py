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

import json
import re
import textwrap
import xml.etree.ElementTree as et

from datetime import datetime, timedelta, timezone
from xml.etree.ElementTree import ParseError

from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer
from devicecloud import DeviceCloud, DeviceCloudHttpException, DeviceCloudException
from devicecloud.monitor import MonitorAPI, TCPDeviceCloudMonitor, MON_TRANSPORT_TYPE_ATTR
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
CONTENT_TYPE_OCTET_STREAM = "application/octet-stream"

DATA_POINTS_BUFFER_DURATION = 5
DATA_POINTS_BUFFER_SIZE = 10

DEFAULT_FLASH_SIZE = "0"
DEFAULT_IP = "0.0.0.0"
DEFAULT_MEMORY_TOTAL = "0"
DEFAULT_MAC = "00:00:00:00:00:00"
DEFAULT_N_SAMPLES = "6"
DEFAULT_SAMPLE_RATE = "10"
DEFAULT_VIDEO_RESOLUTION = "No video device found"

DUMMY_FILE_CONTENT = "Ignore me"
DUMMY_FILE_NAME = "dummy_file_for_dir_creation"

ERROR_ADD_FW_VERSION = "Error adding new firmware version: %s"
ERROR_CANCEL_FW_UPDATE = "Error canceling firmware update process: %s"
ERROR_CHECK_FW_UPDATE_PROGRESS = "Error checking firmware update progress: %s"
ERROR_CHECK_FW_UPDATE_STATUS = "Error checking firmware update status: %s"
ERROR_CREATE_DIRECTORY = "Could not create directory"
ERROR_CREATE_FILE = "Error creating file: %s"
ERROR_DEVICE_NOT_ANSWER = "Device did not answer. Make sure the application is running in the device."
ERROR_DEVICE_NOT_SUPPORT_RCI = "Device does not support configuration through RCI"
ERROR_DOWNLOAD_FILE = "Error '%s' downloading file: %s"
ERROR_DRM_REQUEST = "Error in the DRM request: {}."
ERROR_GET_CONFIG = "Error reading configuration: %s"
ERROR_GET_DATA_USAGE = "Error reading account data usage: %s"
ERROR_LIST_DIR = "Error '%s' listing directory: %s"
ERROR_LIST_FW_REPO = "Error listing firmware repository files: %s"
ERROR_LIST_FILESET = "Error listing fileset files: %s"
ERROR_NO_POST_REQUEST = "AJAX request must be sent using POST"
ERROR_NO_PROGRESS_INFO = "No progress information"
ERROR_NO_SESSION_ID = "No CLI session ID received"
ERROR_NOT_AUTHENTICATED = "Not authenticated"
ERROR_PARSING = "Error parsing Digi Remote Manager answer"
ERROR_REMOVE_FILE = "Error '%s' removing file: %s"
ERROR_SET_CONFIG = "Error saving configuration: %s"
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
ID_DEPRECATED = "deprecated"
ID_DESC = "desc"
ID_DEVICE_ID = "device_id"
ID_DEVICE_TYPE = "device_type"
ID_DEVICES = "devices"
ID_DEY_VERSION = "dey_version"
ID_DPNAME = "dpName"
ID_ERROR = "error"
ID_ERROR_MSG = "error_msg"
ID_ERROR_MESSAGE = "error_message"
ID_FILE = "file"
ID_FILENAME = "filename"
ID_FILES = "files"
ID_FILE_SIZE = "file_size"
ID_FLASH_SIZE = "flash_size"
ID_FW_VERSION = "firmware_version"
ID_HARDWARE = "hardware"
ID_INFO = "information_link"
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
ID_N_DP_UPLOAD_CCCSD = "system_monitor_upload_samples_size"
ID_NUM_SAMPLES_UPLOAD = "num_samples_upload"
ID_PATH = "path"
ID_PLAY = "play"
ID_PRODUCTION = "production"
ID_PROGRESS = "progress"
ID_RESOLUTION = "resolution"
ID_SAMPLE_RATE = "sample_rate"
ID_SAMPLE_RATE_CCCSD = "system_monitor_sample_rate"
ID_SECURITY = "security_related"
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
ID_VERSION = "version"
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
REGEX_INFO_HW = "SN=([0-9a-zA-Z-_:\\/]+) MACHINE=([0-9a-zA-Z-_:\\/]+) VARIANT=([0-9a-zA-Z\\/]+) " \
                "SBC_VARIANT=([0-9a-zA-Z\\/]+) BOARD_ID=([0-9a-zA-Z\\/]+)"
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
REQ_QUERY_SETTING_SM = "<rci_request version='1.1'>" \
                       "  <query_setting>" \
                       "    <system_monitor/>" \
                       "  </query_setting>" \
                       "</rci_request>"
REQ_QUERY_STATE = "<rci_request version='1.1'>" \
                  "  <query_state/>" \
                  "</rci_request>"
REQ_SET_SETTING_SM = "<rci_request version='1.1'>" \
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
                           '},' \
                           '{{/if}}' \
                           '{{/endsWith}}' \
                           '{{/eachFiltered}}'
SCHEMA_MONITOR_DP_DUMMY = '{"a": 0}'

SERVICE_WEB_SERVICE = "WebService messaging"
SERVICE_MONITOR = "Push Monitoring"

STATUS_ACTIVE = "active"
STATUS_CANCELED = "canceled"
STATUS_FAILED = "failed"

STREAMS_LIST = ["wlan0/state", "wlan0/rx_bytes", "wlan0/tx_bytes",
                "hci0/state", "hci0/rx_bytes", "hci0/tx_bytes",
                "eth0/state", "eth0/rx_bytes", "eth0/tx_bytes",
                "eth1/state", "eth1/rx_bytes", "eth1/tx_bytes",
                "lo/state", "lo/rx_bytes", "lo/tx_bytes",
                "uptime", "frequency", "cpu_temperature", "cpu_load",
                "used_memory", "free_memory"]

TARGET_DEVICE_INFO = "device_info"
TARGET_GET_CONFIG = "get_config"
TARGET_GET_CCCSD_CONFIG = "cccsd_get_config"
TARGET_PLAY_MUSIC = "play_music"
TARGET_SET_AUDIO_VOLUME = "set_audio_volume"
TARGET_SET_CONFIG = "set_config"
TARGET_SET_CCCSD_CONFIG = "cccsd_set_config"
TARGET_SET_LED = "user_led"
TARGET_SET_VIDEO_BRIGHTNESS = "set_video_brightness"

WS_DATA_USAGE_API = "/ws/v1/reports/usage/{}"
WS_FILES_API = "/ws/v1/files/{}"
WS_FW_REPOSITORY_API = "/ws/v1/firmware/inventory/FE080003/{}"
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
    dc_session = get_device_cloud(request)
    if dc_session is not None and dc_session is not False and dc_session.has_valid_credentials():
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
    return DeviceCloud(user_serialized.username, user_serialized.password,
                       base_url=user_serialized.server)


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
        if (not request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
                or request.method != "POST"):
            return JsonResponse({ID_ERROR: ERROR_NO_POST_REQUEST}, status=400)
        return None
    return JsonResponse({ID_ERROR: ERROR_NOT_AUTHENTICATED}, status=401)


def get_exception_response(exc):
    """
    Returns the JSON response with the error contained in the given exception.

    Args:
        exc (:class:`.Exception`): The exception.

    Returns:
        A JSON response with the details of the exception.
    """
    return JsonResponse({ID_ERROR: (ERROR_DRM_REQUEST.format(exc.response.text)
                                    if isinstance(exc, DeviceCloudHttpException) else str(exc))},
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
    error = check_ajax_request(request)
    if error:
        return error

    dc_session = get_device_cloud(request)

    device_id = request.POST[ID_DEVICE_ID]
    data = request.POST[ID_DATA] if ID_DATA in request.POST else None

    try:
        resp = send_request(dc_session, device_id, target, data)
        if resp is not None:
            return JsonResponse({ID_DATA: resp}, status=200)
        return JsonResponse({ID_VALID: True}, status=200)
    except DeviceCloudHttpException as exc:
        return get_exception_response(exc)


def send_request(dc_session, device_id, target, data=None):
    """
    Sends a Device Request to the device with the given device ID using the
    given target and data.

    Args:
        dc_session (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        target (String): the target of the Device Request.
        data (String, optional): the data of the Device Request.

    Returns:
        The Device Request response (if any).

    Raises:
        DeviceCloudHttpException: if there is any error sending the Device
            Request.
    """
    request = REQ_DEVICE_REQUEST.format(
        target, data if data is not None else "").strip()

    resp = dc_session.sci.send_sci(OPERATION_DATA_SERVICE, DeviceTarget(device_id), request)

    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    re_search = re.search(REGEX_DEV_REQUEST_RESPONSE, resp.text, re.IGNORECASE)
    if re_search:
        return re_search.group(1)

    return None


def send_do_command(dc_session, device_id, target, data=None):
    """
    Sends a 'do_command' request to the device with the given device ID using
    the given data.

    Args:
        dc_session (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        target (String): the 'do_command' target.
        data (String, optional): the data of the 'do_command' request.

    Returns:
        String: The 'do_command' XML response (if any).

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    request = REQ_DO_COMMAND.format(target, data if data is not None else "")

    # Send the request and get the answer. Set cache to False in order to get
    # the answer from the device and not from DRM.
    resp = dc_session.sci.send_sci(OPERATION_SEND_MESSAGE, DeviceTarget(device_id),
                                   request, cache=False)

    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

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
    cc_devices = []
    dc_session = get_device_cloud(request)
    devices = list(dc_session.devicecore.get_devices())
    for device in devices:
        # Get the type of the device and verify it is a ConnectCore device.
        if (device.get_device_type() == ""
                or not device.get_device_type().startswith(PREFIX_VALID_DEVICE)):
            continue

        cc_device = ConnectCoreDevice(device.get_connectware_id(), device.get_device_type(),
                                      device.get_device_json()[ID_DPNAME] if ID_DPNAME in device.get_device_json()
                                      else "")
        cc_devices.append(cc_device)
        # Set the online property to the farm.
        cc_device.is_online = device.is_connected()
        # If the location of the device is valid, set it to the farm.
        lat, lon = device.get_latlon()
        if lat is not None and lon is not None:
            cc_device.location = (lat, lon)

    # Sort list.
    cc_devices.sort(key=lambda element: element.type)
    cc_devices.sort(key=lambda element: element.name)
    cc_devices.sort(key=lambda element: element.is_online, reverse=True)

    return cc_devices


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
    dc_session = get_device_cloud(request)
    resp = {}
    answer = {}

    try:
        if provision_type == PROVISION_TYPE_ID:
            resp = dc_session.devicecore.provision_device(device_id=provision_value)
        elif provision_type == PROVISION_TYPE_MAC:
            resp = dc_session.devicecore.provision_device(mac_address=provision_value)
        elif provision_type == PROVISION_TYPE_IMEI:
            resp = dc_session.devicecore.provision_device(imei=provision_value)
        if ID_ERROR in resp and resp[ID_ERROR] is True:
            answer[ID_ERROR] = resp[ID_ERROR_MSG]
    except DeviceCloudHttpException as exc:
        answer[ID_ERROR] = exc.response.text

    return answer


def set_play_music_state(request, device_id, play, music_file):
    """
    Sets the play music state for the given device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the ConnectCore DRM device.
        play (String): the new value of the play music.
        music_file (String): the music file to play.

    Returns:
        String: 'OK' on success, 'ERROR' otherwise.
    """
    dc_session = get_device_cloud(request)
    request_data = "%s" % json.dumps({"play": play, "music_file": music_file})

    try:
        return send_request(dc_session, device_id, TARGET_PLAY_MUSIC,
                            data=request_data)
    except DeviceCloudHttpException as exc:
        return exc.response.text


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
    dc_session = get_device_cloud(request)
    request_data = "%s" % value

    try:
        return send_request(dc_session, device_id, TARGET_SET_AUDIO_VOLUME,
                            data=request_data)
    except DeviceCloudHttpException as exc:
        return exc.response.text


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
    dc_session = get_device_cloud(request)
    request_data = "%s" % value

    try:
        return send_request(dc_session, device_id, TARGET_SET_VIDEO_BRIGHTNESS,
                            data=request_data)
    except DeviceCloudHttpException as exc:
        return exc.response.text


def set_led(request, device_id, _led_name, value):
    """
    Sets the new value of the given LED for the given device.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the ConnectCore DRM device.
        _led_name (String): the LED name.
        value (String): the new LED value.

    Returns:
        String: 'OK' on success, 'ERROR' otherwise.
    """
    dc_session = get_device_cloud(request)
    request_data = ("%s" % value).lower()

    try:
        return send_request(dc_session, device_id, TARGET_SET_LED,
                            data=request_data)
    except DeviceCloudHttpException as exc:
        return exc.response.text


def get_current_data_point(dc_session, stream_id):
    """
    Returns the latest data point value from the stream with the given ID.

    Args:
        dc_session (:class:`.DeviceCloud`): the Device Cloud instance.
        stream_id (String): the ID of the stream to get the data point from.

    Returns:
        String: the latest data point from the given stream, `None` if there is
            not any stream with the given ID.
    """
    stream = dc_session.streams.get_stream_if_exists(stream_id)
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
    error = check_ajax_request(request)
    if error:
        return error

    dc_session = get_device_cloud(request)
    data = json.loads(request.body.decode(request.encoding))
    device_id = data[ID_DEVICE_ID]
    interval = data[ID_INTERVAL]
    if interval is None:
        interval = 1
    else:
        interval = int(data[ID_INTERVAL])

    stream_id = "{}/{}".format(device_id, stream_name)

    strm = dc_session.streams.get_stream(stream_id)
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

    for d_point in strm.read(
            start_time=(datetime.now(timezone.utc) - timedelta(hours=interval)),
            newest_first=False,
            rollup_interval=rollup_interval,
            rollup_method=rollup_method):
        datapoints.append({
            ID_TIMESTAMP: d_point.get_timestamp().timestamp() * 1000,
            ID_DATA: (d_point.get_data() / 1024) if "memory" in stream_name else d_point.get_data()
        })

    return {ID_DATA: datapoints}


def query_rci_device_state(request, device_id):
    """
    Obtains the state information of the device using RCI.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID of the ConnectCore DRM device.

    Return:
        Dictionary: Dictionary containing the device information.
    """
    info = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_SEND_MESSAGE,
                                   DeviceTarget(device_id),
                                   REQ_QUERY_STATE,
                                   allow_offline=True,
                                   cache=False,
                                   wait_for_reconnect=False,
                                   sync_timeout=5)

    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            info[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return info
        uboot_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_UBOOT_VERSION))
        if uboot_version:
            info[ID_UBOOT_VERSION] = uboot_version[0].text
        kernel_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_KERNEL_VERSION))
        if kernel_version:
            info[ID_KERNEL_VERSION] = kernel_version[0].text
        dey_version = root.findall("%s%s" % (ID_ANY_LEVEL, ID_DEY_VERSION))
        if dey_version:
            info[ID_DEY_VERSION] = dey_version[0].text
        hardware = root.findall("%s%s" % (ID_ANY_LEVEL, ID_HARDWARE))
        if hardware:
            re_search = re.search(REGEX_INFO_HW, hardware[0].text, re.IGNORECASE)
            if re_search and len(re_search.groups()) >= 5:
                info[ID_SERIAL_NUMBER] = re_search.group(1)
                info[ID_DEVICE_TYPE] = re_search.group(2)
                info[ID_MODULE_VARIANT] = re_search.group(3)
                info[ID_BOARD_VARIANT] = re_search.group(4)
                info[ID_BOARD_ID] = re_search.group(5)
        kinetis = root.findall("%s%s" % (ID_ANY_LEVEL, ID_KINETIS))
        if kinetis:
            re_search = re.search(REGEX_INFO_KINETIS, kinetis[0].text, re.IGNORECASE)
            if re_search and len(re_search.groups()) >= 2:
                info[ID_MCA_HW_VERSION] = re_search.group(1)
                info[ID_MCA_FW_VERSION] = re_search.group(2)
    except ParseError:
        info[ID_ERROR] = ERROR_PARSING

    return info


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
    info = {}
    dc_session = get_device_cloud(request)

    try:
        resp = send_request(dc_session, device_id, TARGET_DEVICE_INFO, data="")
        if resp is None or "not registered" in resp:
            info[ID_ERROR] = ERROR_DEVICE_NOT_ANSWER
            return info
        if "CCAPI Error" in resp:
            info[ID_ERROR] = resp
            return info
        information = json.loads(resp)
        if ID_UBOOT_VERSION in information:
            info[ID_UBOOT_VERSION] = information[ID_UBOOT_VERSION]
        if ID_KERNEL_VERSION in information:
            info[ID_KERNEL_VERSION] = information[ID_KERNEL_VERSION]
        if ID_DEY_VERSION in information:
            info[ID_DEY_VERSION] = information[ID_DEY_VERSION]
        if ID_SERIAL_NUMBER in information:
            info[ID_SERIAL_NUMBER] = information[ID_SERIAL_NUMBER]
        if ID_DEVICE_TYPE in information:
            info[ID_DEVICE_TYPE] = information[ID_DEVICE_TYPE]
        if ID_MODULE_VARIANT in information:
            info[ID_MODULE_VARIANT] = information[ID_MODULE_VARIANT]
        if ID_BOARD_VARIANT in information:
            info[ID_BOARD_VARIANT] = information[ID_BOARD_VARIANT]
        if ID_BOARD_ID in information:
            info[ID_BOARD_ID] = information[ID_BOARD_ID]
        if ID_MCA_HW_VERSION in information:
            info[ID_MCA_HW_VERSION] = information[ID_MCA_HW_VERSION]
        if ID_MCA_FW_VERSION in information:
            info[ID_MCA_FW_VERSION] = information[ID_MCA_FW_VERSION]
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
    except DeviceCloudHttpException as exc:
        info[ID_ERROR] = exc.response.text
        return info

    # Get firmware version
    info[ID_FW_VERSION] = "-"
    devices = list(dc_session.devicecore.get_devices())
    for device in devices:
        if device.get_connectware_id() != device_id:
            continue
        info[ID_FW_VERSION] = device.get_firmware_level_description()

    # Check if we have all the required information.
    if not info.get(ID_UBOOT_VERSION, None):
        information = query_rci_device_state(request, device_id)
        error = information.get(ID_ERROR, None)
        if error:
            if ERROR_DEVICE_NOT_SUPPORT_RCI in error:
                information[ID_ERROR] = "Could not get device information"
            return information
        info[ID_UBOOT_VERSION] = information.get(ID_UBOOT_VERSION, None)
        info[ID_KERNEL_VERSION] = information.get(ID_KERNEL_VERSION, None)
        info[ID_DEY_VERSION] = information.get(ID_DEY_VERSION, None)
        info[ID_SERIAL_NUMBER] = information.get(ID_SERIAL_NUMBER, None)
        info[ID_DEVICE_TYPE] = information.get(ID_DEVICE_TYPE, None)
        info[ID_MODULE_VARIANT] = information.get(ID_MODULE_VARIANT, None)
        info[ID_BOARD_VARIANT] = information.get(ID_BOARD_VARIANT, None)
        info[ID_BOARD_ID] = information.get(ID_BOARD_ID, None)
        info[ID_MCA_HW_VERSION] = information.get(ID_MCA_HW_VERSION, None)
        info[ID_MCA_FW_VERSION] = information.get(ID_MCA_FW_VERSION, None)

    # Send request to retrieve device information from system monitor settings.
    try:
        resp = get_system_monitor_settings(request, device_id)
        if ID_ERROR in resp:
            info[ID_ERROR] = resp[ID_ERROR]
            return info
        info[ID_SAMPLE_RATE] = resp[ID_SAMPLE_RATE]
        info[ID_NUM_SAMPLES_UPLOAD] = resp[ID_NUM_SAMPLES_UPLOAD]
    except DeviceCloudHttpException as exc:
        info[ID_ERROR] = exc.response.text
        return info

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
    dc_session = get_device_cloud(request)
    status = {}
    streams = dc_session.streams.get_streams(stream_prefix=device_id)

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
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_CLI,
                                   DeviceTarget(device_id),
                                   REQ_CLI_INITIALIZE,
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
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
    answer = {}
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return -1

    resp = dc_session.sci.send_sci(OPERATION_CLI,
                                   DeviceTarget(device_id),
                                   REQ_CLI_START.format(CLI_SESSION_TIMEOUT, session_id),
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
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
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_CLI,
                                   DeviceTarget(device_id),
                                   REQ_CLI_TERMINATE.format(session_id),
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
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
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_CLI,
                                   DeviceTarget(device_id),
                                   REQ_CLI_SEND_DATA.format(session_id, data),
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
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
    answer = {}
    topic = "CLIEvent/%s/%s" % (device_id, session_id)
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    if session_id in monitor_managers:
        monitor_manager = monitor_managers.get(session_id)
    else:
        monitor_manager = MonitorManager(dc_session.get_connection())
        monitor_managers[session_id] = monitor_manager

    remove_inactive_monitors(dc_session)

    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema([topic], SCHEMA_MONITOR_CLI)

        def monitor_callback(json_data):
            for cli_event in json_data:
                payload = {ID_TYPE: cli_event[ID_TYPE]}
                if cli_event[ID_TYPE] == CLI_TYPE_START:
                    consumer.send(text_data=json.dumps(payload))
                elif cli_event[ID_TYPE] == CLI_TYPE_DATA:
                    payload[ID_DATA] = cli_event[ID_DATA]
                    consumer.send(text_data=json.dumps(payload))
                elif cli_event[ID_TYPE] == CLI_TYPE_TERMINATE:
                    remove_cli_monitor(session, cli_event[ID_SESSION_ID], monitor.get_id())
                    if ID_ERROR in cli_event:
                        payload[ID_ERROR] = cli_event[ID_ERROR]
                    consumer.send(text_data=json.dumps(payload))
            return True

        monitor.add_callback(monitor_callback)
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as exc:
        re_search = re.search(REGEX_MONITOR_ERROR, str(exc), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(exc)

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
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return

    global monitor_managers

    if session_id not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_id)

    monitor_manager.stop_listeners()

    try:
        dc_session.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as exc:
        print(exc)


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
    answer = {}
    dc_session = get_device_cloud(request)

    try:
        resp = dc_session.file_system_service.list_files(DeviceTarget(device_id), directory)
        for _, dev_data in resp.items():
            if isinstance(dev_data, ErrorInfo):
                if dev_data.message is not None:
                    answer[ID_ERROR] = ERROR_LIST_DIR % (dev_data.errno, dev_data.message)
                else:
                    answer[ID_ERROR] = ERROR_LIST_DIR % dev_data.errno
                break
            # It's of type LsInfo
            answer[ID_CURRENT_DIRECTORY] = directory
            answer[ID_FILES] = []
            # Look at all the directories
            for dinfo in dev_data.directories:
                directory = {ID_TYPE: FS_TYPE_DIRECTORY,
                             ID_NAME: dinfo.path,
                             ID_LAST_MODIFIED: dinfo.last_modified}
                answer[ID_FILES].append(directory)
            # Look at all the files
            for finfo in dev_data.files:
                file = {ID_TYPE: FS_TYPE_FILE,
                        ID_NAME: finfo.path,
                        ID_SIZE: finfo.size,
                        ID_LAST_MODIFIED: finfo.last_modified}
                answer[ID_FILES].append(file)

        def sort_name(entry):
            return entry[ID_NAME]

        def sort_type(entry):
            return entry[ID_TYPE]

        answer[ID_FILES].sort(key=sort_name)
        answer[ID_FILES].sort(key=sort_type)
    except FileSystemServiceException:
        answer[ID_ERROR] = ERROR_LIST_DIR % (ERROR_UNKNOWN, ERROR_UNRECOGNIZED_ANSWER)

    return answer


def remove_file(request, device_id, path, _is_file):
    """
    Removes the given file path for the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to remove the
            file from.
        path (String): The file path to remove.
        _is_file (Boolean): True if the path is a file, False if it is a directory.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)

    try:
        resp = dc_session.file_system_service.delete_file(DeviceTarget(device_id), path)
        for _, dev_data in resp.items():
            if isinstance(dev_data, ErrorInfo):
                if dev_data.message is not None:
                    answer[ID_ERROR] = ERROR_REMOVE_FILE % (dev_data.errno, dev_data.message)
                else:
                    answer[ID_ERROR] = ERROR_REMOVE_FILE % dev_data.errno
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
    answer = {}
    dc_session = get_device_cloud(request)

    try:
        resp = dc_session.file_system_service.put_file(DeviceTarget(device_id),
                                                       path,
                                                       file_data=content)
        for _, dev_data in resp.items():
            if isinstance(dev_data, ErrorInfo):
                if dev_data.message is not None:
                    answer[ID_ERROR] = ERROR_UPLOAD_FILE % (dev_data.errno, dev_data.message)
                else:
                    answer[ID_ERROR] = ERROR_UPLOAD_FILE % dev_data.errno
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
    answer = {}
    dc_session = get_device_cloud(request)

    try:
        resp = dc_session.file_system_service.get_file(DeviceTarget(device_id), path)
        for _, dev_data in resp.items():
            if isinstance(dev_data, ErrorInfo):
                if dev_data.message is not None:
                    answer[ID_ERROR] = ERROR_DOWNLOAD_FILE % (dev_data.errno, dev_data.message)
                else:
                    answer[ID_ERROR] = ERROR_DOWNLOAD_FILE % dev_data.errno
                break
            # It's of type LsInfo
            answer = dev_data
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
    answer = upload_file(request, device_id, dummy_file_path,
                         DUMMY_FILE_CONTENT.encode(encoding='ascii'))
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
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_REBOOT,
                                   DeviceTarget(device_id),
                                   "",
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

    return answer


def list_repository(request, device_type):
    """
    Lists all the firmware files of the Remote Manager account for the given device type.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_type (String): The device type of the firmwares to list.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FW_REPOSITORY_API.format(device_type)

    try:
        resp = dc_session.get_connection().get(request_url)
        if resp.status_code == 200:
            files = []
            for file in json.loads(resp.text)[ID_LIST]:
                file_entry = {
                    ID_FW_VERSION: file[ID_FW_VERSION],
                    ID_NAME: file[ID_FILENAME],
                    ID_SIZE: file[ID_FILE_SIZE],
                    ID_PRODUCTION: file[ID_PRODUCTION],
                    ID_SECURITY: file[ID_SECURITY],
                    ID_INFO: file[ID_INFO],
                    ID_DEPRECATED: file[ID_DEPRECATED]
                }
                files.append(file_entry)
            answer[ID_FILES] = files
        else:
            if resp.text:
                answer[ID_ERROR] = ERROR_LIST_FW_REPO % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_LIST_FW_REPO % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_LIST_FW_REPO % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_LIST_FW_REPO % exc.response.status_code

    return answer


def add_fw_version(request, file, device_type, file_name, version, release_notes,
                   security="not-identified", production=False, deprecated=False):
    """
    Uploads the provided firmware to the firmware repository.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        file (:class:.`TemporaryUploadedFile`): The firmware file to upload.
        device_type (String): The device type of the firmware to upload.
        file_name (String): Firmware file name to store in the repository.
        version (String): Version string of the firmware.
        release_notes (String): URL of the firmware release notes.
        security (String): String with the CVSS score.
        production (Boolean): `True` to mark firmware as production.
        deprecated (Boolean): `True` to mark as drepecated.
    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FW_REPOSITORY_API.format(
            "%s?firmware_version=%s&information_link=%s&security_related=%s&production=%s&deprecated=%s&filename=%s" %
            (device_type, version, release_notes, security, production, deprecated, file_name))
    headers = {ID_CONTENT_TYPE: CONTENT_TYPE_OCTET_STREAM}
    timeouts = (2.0, 2.0)

    try:
        if file.multiple_chunks():
            resp = dc_session.get_connection().post(
                request_url, IterableToFileAdapter(file, file_name),
                timeout=timeouts, headers=headers)
        else:
            resp = dc_session.get_connection().post(
                request_url, file.file.getvalue(), timeout=timeouts,
                headers=headers)
        if resp.status_code != 200:
            if resp.text:
                answer[ID_ERROR] = ERROR_ADD_FW_VERSION % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_ADD_FW_VERSION % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_ADD_FW_VERSION % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_ADD_FW_VERSION % exc.response.status_code

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
    answer = {}
    dc_session = get_device_cloud(request)
    file_url = WS_FILES_API.format("%s/%s/%s/%s" % (ID_INVENTORY, file_set, path, file_name))
    file_exists = False

    try:
        resp = dc_session.get_connection().get(file_url)
        if resp.status_code == 200:
            file_exists = True
    except DeviceCloudHttpException:
        pass

    if file_exists:
        try:
            dc_session.get_connection().delete(file_url)
        except DeviceCloudHttpException:
            pass

    timeouts = (2.0, 2.0)
    try:
        if file.multiple_chunks():
            resp = dc_session.get_connection().post(
                file_url, IterableToFileAdapter(file, file_name), timeout=timeouts)
        else:
            resp = dc_session.get_connection().post(
                file_url, file.file.getvalue(), timeout=timeouts)
        if resp.status_code != 200:
            if resp.text:
                answer[ID_ERROR] = ERROR_CREATE_FILE % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CREATE_FILE % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_CREATE_FILE % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CREATE_FILE % exc.response.status_code
    return answer


def update_remote_firmware(request, device_id, version):
    """
    Updates the firmware of the remote device with the given device ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the ConnectCore device to update the
            firmware of.
        version (String): The firmware version in the custom firmware
            repository to use in the update.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FIRMWARE_UPDATES_API.format(ID_INVENTORY)
    request_data = {ID_TARGETS: {ID_DEVICES: [device_id]}, ID_VERSION: version}
    headers = {ID_CONTENT_TYPE: CONTENT_TYPE_PRETTY_JSON}

    try:
        resp = dc_session.get_connection().post(
            request_url, data=json.dumps(request_data), headers=headers)
        if resp.status_code != 200:
            if resp.text:
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % exc.response.status_code

    return answer


def update_remote_firmware_from_fileset(request, device_id, file):
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
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FIRMWARE_UPDATES_API.format(ID_INVENTORY)
    request_data = {ID_TARGETS: {ID_DEVICES: [device_id]}, ID_FILE: file}
    headers = {ID_CONTENT_TYPE: CONTENT_TYPE_PRETTY_JSON}

    try:
        resp = dc_session.get_connection().post(
            request_url, data=json.dumps(request_data), headers=headers)
        if resp.status_code != 200:
            if resp.text:
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_UPDATE_FW_REQUEST % exc.response.status_code

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
    answer[ID_UPDATE_RUNNING] = update_status.get(ID_STATUS, None) == STATUS_ACTIVE

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
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_INVENTORY, device_id))

    try:
        resp = dc_session.get_connection().get(request_url)
        if resp.status_code == 200:
            status = json.loads(resp.text)[ID_STATUS]
            answer[ID_STATUS] = status
            if status in (STATUS_FAILED, STATUS_CANCELED):
                answer[ID_MESSAGE] = json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_MESSAGE] = json.loads(resp.text)[ID_MESSAGE] if \
                    ID_MESSAGE in json.loads(resp.text) else ""
        elif resp.text:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % json.loads(resp.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_STATUS % exc.response.status_code

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
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_PROGRESS, device_id))

    try:
        resp = dc_session.get_connection().get(request_url)
        if resp.status_code == 200:
            if ID_PROGRESS in json.loads(resp.text):
                answer[ID_PROGRESS] = json.loads(resp.text)[ID_PROGRESS][0][ID_STATUS]
                answer[ID_MESSAGE] = json.loads(resp.text)[ID_PROGRESS][0][ID_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % ERROR_NO_PROGRESS_INFO
        elif resp.text:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % json.loads(resp.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CHECK_FW_UPDATE_PROGRESS % exc.response.status_code

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
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FIRMWARE_UPDATES_API.format("%s/%s" % (ID_CANCEL, device_id))

    try:
        resp = dc_session.get_connection().post(request_url, data="")
        if resp.status_code != 200:
            if resp.text:
                answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_CANCEL_FW_UPDATE % exc.response.status_code

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
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_FILES_API.format("%s/%s" % (ID_INVENTORY, file_set))

    try:
        resp = dc_session.get_connection().get(request_url)
        if resp.status_code == 200:
            files = []
            for file in json.loads(resp.text)[ID_LIST]:
                name = file[ID_NAME]
                file_entry = {
                    ID_PATH: "/".join(name.split("/")[:-1]) if "/" in name else "",
                    ID_NAME: name.split("/")[-1] if "/" in name else name,
                    ID_SIZE: file[ID_SIZE],
                    ID_LAST_MODIFIED: file[ID_LAST_MODIFIED]
                }
                files.append(file_entry)
            answer[ID_FILES] = files
        else:
            if resp.text:
                answer[ID_ERROR] = ERROR_LIST_FILESET % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_LIST_FILESET % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_LIST_FILESET % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_LIST_FILESET % exc.response.status_code

    return answer


def _get_cfg(request, device_id, settings, target=None):
    """
    Retrieves the device configuration for the given element.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to retrieve the configuration.
        settings (List): The settings to retrieve their configuration.
        target (String): Request target. If not set, 'cccsd_get_config' is used.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    dc_session = get_device_cloud(request)
    request_data = "%s" % json.dumps(settings)
    answer = {}

    if not target:
        target = TARGET_GET_CCCSD_CONFIG

    try:
        resp = send_request(dc_session, device_id, target, data=request_data)
        if not resp:
            answer[ID_ERROR] = ERROR_DEVICE_NOT_ANSWER
        elif ("not registered" in resp
              or "Invalid format" in resp
              or "CCAPI Error" in resp):
            answer[ID_ERROR] = resp
        else:
            answer[ID_DATA] = resp
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_GET_CONFIG % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_GET_CONFIG % exc.response.status_code

    return answer


def get_configuration(request, device_id, elements):
    """
    Retrieves the device configuration for the given element.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to retrieve the configuration.
        elements (List): The elements to retrieve their configuration.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    settings = {
               "element": elements
               }

    return _get_cfg(request, device_id, settings, target=TARGET_GET_CONFIG)


def _set_cfg(request, device_id, configuration, target=None):
    """
    Changes the device configuration with the provided one.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to change the configuration.
        configuration (Dictionary): The new configuration.
        target (String): Request target. If not set, 'cccsd_set_config' is used.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    dc_session = get_device_cloud(request)
    request_data = "%s" % json.dumps(configuration)
    answer = {}

    if not target:
        target = TARGET_SET_CCCSD_CONFIG

    try:
        resp = send_request(dc_session, device_id, target, data=request_data)
        if not resp:
            answer[ID_ERROR] = ERROR_DEVICE_NOT_ANSWER
        elif ("not registered" in resp
              or "Invalid format" in resp
              or "CCAPI Error" in resp):
            answer[ID_ERROR] = resp
        else:
            answer[ID_DATA] = resp
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_SET_CONFIG % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_SET_CONFIG % exc.response.status_code

    return answer


def set_configuration(request, device_id, configuration):
    """
    Changes the device configuration with the provided one.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to change the configuration.
        configuration (Dictionary): The new configuration.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    return _set_cfg(request, device_id, configuration, target=TARGET_SET_CONFIG)


def query_rci_system_monitor_settings(request, device_id):
    """
    Retrieves the device system monitor settings using RCI.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to retrieve the system monitor settings.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_SEND_MESSAGE,
                                   DeviceTarget(device_id),
                                   REQ_QUERY_SETTING_SM,
                                   allow_offline=False,
                                   cache=False,
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
            return answer

        sample_rate = root.findall("%s%s" % (ID_ANY_LEVEL, ID_SAMPLE_RATE))
        answer[ID_SAMPLE_RATE] = sample_rate[0].text if sample_rate else DEFAULT_SAMPLE_RATE

        n_samples = root.findall("%s%s" % (ID_ANY_LEVEL, ID_N_DP_UPLOAD))
        answer[ID_NUM_SAMPLES_UPLOAD] = n_samples[0].text if n_samples else DEFAULT_N_SAMPLES
    except ParseError:
        answer[ID_ERROR] = ERROR_PARSING

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
    answer = {}
    settings = {
                 "settings": [ID_SAMPLE_RATE_CCCSD, ID_N_DP_UPLOAD_CCCSD]
               }

    resp = _get_cfg(request, device_id, settings, target=TARGET_GET_CCCSD_CONFIG)
    if ID_ERROR not in resp:
        data = json.loads(resp.get(ID_DATA, "{}"))
        answer[ID_SAMPLE_RATE] = data.get(ID_SAMPLE_RATE_CCCSD, DEFAULT_SAMPLE_RATE)
        answer[ID_NUM_SAMPLES_UPLOAD] = data.get(ID_N_DP_UPLOAD_CCCSD, DEFAULT_N_SAMPLES)
        return answer

    if "not registered" not in resp[ID_ERROR]:
        return {ID_ERROR: resp[ID_ERROR]}

    # Try legacy 'get_config' with 'sys-monitor'
    settings = {
               "element": ["sys-monitor"]
               }

    resp = _get_cfg(request, device_id, settings, target=TARGET_GET_CONFIG)
    if ID_ERROR not in resp:
        data = json.loads(resp.get(ID_DATA, "{}")).get("sys-monitor", {})
        answer[ID_SAMPLE_RATE] = data.get(ID_SAMPLE_RATE, DEFAULT_SAMPLE_RATE)
        answer[ID_NUM_SAMPLES_UPLOAD] = data.get(ID_N_DP_UPLOAD, DEFAULT_N_SAMPLES)

        return answer

    if "Invalid format" not in resp[ID_ERROR]:
        return {ID_ERROR: resp[ID_ERROR]}

    # Try with RCI.
    try:
        resp = query_rci_system_monitor_settings(request, device_id)
        if not resp:
            return {ID_ERROR: "Could not get system monitor settings"}
        if ID_ERROR in resp:
            return {ID_ERROR: resp[ID_ERROR]}

        answer[ID_SAMPLE_RATE] = resp[ID_SAMPLE_RATE]
        answer[ID_NUM_SAMPLES_UPLOAD] = resp[ID_NUM_SAMPLES_UPLOAD]

        return answer
    except DeviceCloudHttpException as exc:
        return {ID_ERROR: exc.response.text}


def set_rci_system_monitor_settings(request, device_id, sample_rate, samples_buffer):
    """
    Changes the device system monitor settings with the provided ones using RCI.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID for which to change the system monitor settings.
        sample_rate (String): The new system monitor sample rate.
        samples_buffer (string): The new system monitor samples buffer size to upload.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)

    resp = dc_session.sci.send_sci(OPERATION_SEND_MESSAGE,
                                   DeviceTarget(device_id),
                                   REQ_SET_SETTING_SM.format(sample_rate, samples_buffer),
                                   allow_offline=False,
                                   cache=False,
                                   wait_for_reconnect=False,
                                   sync_timeout=5)
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    try:
        root = et.fromstring(resp.content)
        errors = root.findall("%s%s" % (ID_ANY_LEVEL, ID_ERROR))
        if errors:
            desc_element = errors[0].findall("%s%s" % (ID_ANY_LEVEL, ID_DESC))
            answer[ID_ERROR] = desc_element[0].text if desc_element else ERROR_TIMEOUT
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
        samples_buffer (String): The new system monitor samples buffer size to upload.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    config = {
                 ID_SAMPLE_RATE_CCCSD: int(sample_rate),
                 ID_N_DP_UPLOAD_CCCSD: int(samples_buffer)
             }

    resp = _set_cfg(request, device_id, config, target=TARGET_SET_CCCSD_CONFIG)

    if ID_ERROR not in resp:
        return json.loads(resp.get(ID_DATA, "{}"))

    if "not registered" not in resp[ID_ERROR]:
        return {ID_ERROR: resp[ID_ERROR]}

    # Try legacy 'set_config' with 'sys-monitor'
    config = {
                 "sys-monitor": {
                     ID_SAMPLE_RATE: int(sample_rate),
                     ID_N_DP_UPLOAD: int(samples_buffer)
                 }
             }

    resp = _set_cfg(request, device_id, config, target=TARGET_SET_CONFIG)

    if ID_ERROR not in resp:
        return json.loads(resp.get(ID_DATA, "{}"))

    if "Invalid format" not in resp[ID_ERROR]:
        return {ID_ERROR: resp[ID_ERROR]}

    # Try with RCI.
    try:
        resp = set_rci_system_monitor_settings(request, device_id, sample_rate, samples_buffer)
        if not resp:
            return resp
        if ID_ERROR in resp:
            return {ID_ERROR: resp[ID_ERROR] if ERROR_DEVICE_NOT_SUPPORT_RCI not in resp[ID_ERROR] else "Could not set system monitor"}

        return resp
    except DeviceCloudHttpException as exc:
        return {ID_ERROR: exc.response.text}


def get_account_data_usage(request):
    """
    Returns the DRM account data usage.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        Dictionary: Dictionary containing the answer.
    """
    answer = {}
    dc_session = get_device_cloud(request)
    request_url = WS_DATA_USAGE_API.format(ID_DATA_SUMMARY)

    try:
        resp = dc_session.get_connection().get(request_url)
        if resp.status_code == 200:
            json_answer = json.loads(resp.text)
            answer[ID_DATA_USAGE_TOTAL] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_MB]
            answer[ID_DATA_USAGE_DEVICES] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_DEVICES_MB]
            answer[ID_DATA_USAGE_WEB] = json_answer[ID_LIST][0][ID_TOTAL_DATA_USAGE_WS_MB]
            # Get usage details
            request_url = WS_DATA_USAGE_API.format(ID_DATA_DETAILS)
            resp = dc_session.get_connection().get(request_url)
            if resp.status_code == 200:
                answer[ID_DEVICES] = []
                for entry in json.loads(resp.text)[ID_LIST]:
                    if ID_DEVICE_ID in entry:
                        device = {
                            ID_DEVICE_ID: entry[ID_DEVICE_ID],
                            ID_USAGE: entry[ID_USAGE]
                        }
                        answer[ID_DEVICES].append(device)
                    elif entry[ID_SERVICE_DESCRIPTION] == SERVICE_WEB_SERVICE:
                        answer[ID_DATA_USAGE_WEB_SERVICES] = entry[ID_USAGE]
                    elif entry[ID_SERVICE_DESCRIPTION] == SERVICE_MONITOR:
                        answer[ID_DATA_USAGE_MONITORS] = entry[ID_USAGE]
            else:
                if resp.text:
                    answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(resp.text)[ID_ERROR_MESSAGE]
                else:
                    answer[ID_ERROR] = ERROR_GET_DATA_USAGE % resp.status_code
        else:
            if resp.text:
                answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(resp.text)[ID_ERROR_MESSAGE]
            else:
                answer[ID_ERROR] = ERROR_GET_DATA_USAGE % resp.status_code
    except DeviceCloudHttpException as exc:
        if exc.response.text:
            answer[ID_ERROR] = ERROR_GET_DATA_USAGE % json.loads(exc.response.text)[ID_ERROR_MESSAGE]
        else:
            answer[ID_ERROR] = ERROR_GET_DATA_USAGE % exc.response.status_code

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
    dc_session = get_device_cloud(request)
    devices = list(dc_session.devicecore.get_devices())
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
    answer = {}
    topic = "DataPoint/{}".format(device_id)
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key in monitor_managers:
        monitor_manager = monitor_managers.get(session_key)
    else:
        monitor_manager = MonitorManager(dc_session.get_connection())
        monitor_managers[session_key] = monitor_manager

    remove_inactive_monitors(dc_session)

    # Build the monitor schema.
    schema = "["
    for stream in STREAMS_LIST:
        schema = schema + SCHEMA_MONITOR_DP_FILTER % stream
    schema = schema + SCHEMA_MONITOR_DP_DUMMY + "]"

    # Create the monitor to receive data points updates.
    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema(
            [topic],
            schema,
            batch_size=len(STREAMS_LIST) * DATA_POINTS_BUFFER_SIZE,
            batch_duration=DATA_POINTS_BUFFER_DURATION)

        def monitor_callback(json_data):
            for data_point in json_data:
                if ID_VALUE not in data_point or ID_STREAM not in data_point:
                    continue
                # Push new data point to the web socket.
                consumer.send(text_data=json.dumps(data_point))
            return True

        monitor.add_callback(monitor_callback)
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as exc:
        re_search = re.search(REGEX_MONITOR_ERROR, str(exc), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(exc)

    return answer


def remove_datapoints_monitor(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for data point changes.

    Args:
        session (:class:`.SessionStore`): The Django session.
        monitor_id (int): The ID of the monitor to delete.
    """
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_key)

    monitor_manager.stop_listeners()

    try:
        dc_session.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as exc:
        print(exc)


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
    answer = {}
    topic = "devices/{}".format(device_id)
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return -1

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key in monitor_managers:
        monitor_manager = monitor_managers.get(session_key)
    else:
        monitor_manager = MonitorManager(dc_session.get_connection())
        monitor_managers[session_key] = monitor_manager

    remove_inactive_monitors(dc_session)

    # Create the monitor to receive device events for the given device id.
    try:
        monitor = monitor_manager.create_tcp_monitor_with_schema([topic],
                                                                 SCHEMA_MONITOR_DEVICE,
                                                                 batch_size=1,
                                                                 batch_duration=0)

        def monitor_callback(json_data):
            for event in json_data:
                # Push new event to the web socket.
                consumer.send(text_data=json.dumps(event))
            return True

        monitor.add_callback(monitor_callback)
        answer[ID_MONITOR_ID] = monitor.get_id()
    except Exception as exc:
        re_search = re.search(REGEX_MONITOR_ERROR, str(exc), re.IGNORECASE)
        if re_search:
            answer[ID_ERROR] = re_search.group(1)
        else:
            answer[ID_ERROR] = str(exc)

    return answer


def remove_device_monitor(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for device connections.

    Args:
        session (:class:`.SessionStore`): The Django session.
        monitor_id (int): The ID of the monitor to delete.
    """
    dc_session = get_device_cloud_session(session)
    if dc_session is None:
        return

    global monitor_managers

    # Get or create the monitor manager for the given session.
    session_key = session.session_key
    if session_key not in monitor_managers:
        return
    monitor_manager = monitor_managers.pop(session_key)

    monitor_manager.stop_listeners()

    try:
        dc_session.get_connection().delete(WS_MONITOR_API.format(monitor_id))
    except DeviceCloudHttpException as exc:
        print(exc)


def remove_inactive_monitors(dc_session):
    """
    Removes inactive Remote Manager monitors.

    Args:
        dc_session (:class:`.DeviceCloud`): The Device Cloud instance.
    """
    monitors = dc_session.monitor.get_monitors(MON_TRANSPORT_TYPE_ATTR == "tcp")
    for monitor in monitors:
        if monitor.get_metadata()["monStatus"] != "ACTIVE":
            print("Deleted inactive monitor %s" % monitor.get_metadata()["monId"])
            monitor.delete()


class IterableToFileAdapter:
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


class MonitorManager(MonitorAPI):
    """
    Class used to manage the use of Device Cloud monitors.
    """

    def __init__(self, conn):
        MonitorAPI.__init__(self, conn)
        self._tcp_client_manager = TCPClientManager(self._conn, secure=False)

    def create_tcp_monitor_with_schema(self, topics, schema, batch_size=1, batch_duration=0,
                                       compression='gzip', format_type='json'):
        """
        Creates a TCP Monitor instance in Device Cloud for a given list of topics

        Args:
            topics (List): a string list of topics (e.g. ['DeviceCore[U]', 'FileDataCore']).
            schema (String): a string specifying the handlebars schema for the monitor push requests.
            batch_size (Integer): How many Msgs received before sending data.
            batch_duration (Integer): How long to wait before sending batch if it does not exceed batch_size.
            compression (String): Compression value (i.e. 'gzip').
            format_type (String): What format server should send data in (i.e. 'xml' or 'json').

        Returns:
            An object of the created Monitor.
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
        resp = self._conn.post("/ws/Monitor", monitor_xml)
        location = et.fromstring(resp.text).find('.//location').text
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
