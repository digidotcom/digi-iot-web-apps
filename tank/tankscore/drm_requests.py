# Copyright 2021, Digi International Inc.
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
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
from datetime import datetime, timedelta, timezone

from devicecloud import DeviceCloud, DeviceCloudHttpException
from devicecloud.monitor import MonitorAPI
from devicecloud.monitor_tcp import TCPClientManager
from devicecloud.sci import DeviceTarget
from django.http import JsonResponse

from login.auth import DeviceCloudUser
from tankscore import views, models
from tankscore.models import SmartTank, SmartTankInstallation

PARAM_DATA = "data"
PARAM_MAC_ADDR = "mac_addr"
PARAM_SELECTED = "selected"
PARAM_INSTALLATION_NAME = "installation_name"

DATA_SEPARATOR = "@@"

SCI_DATA_SERVICE = "data_service"
SCI_SEND_MESSAGE = "send_message"

REQ_DEVICE_REQUEST = "<requests>" \
                     "  <device_request target_name='{}'>" \
                     "    {}" \
                     "  </device_request>" \
                     "</requests>"
REQ_DO_COMMAND = "<rci_request version='1.1'>" \
                 "  <do_command target='{}'>" \
                 "    {}" \
                 "  </do_command>" \
                 "</rci_request>"
REQ_QUERY_SETTING = "<rci_request version='1.1'>" \
                    "  <query_setting>" \
                    "    <{}/>" \
                    "  </query_setting>" \
                    "</rci_request>"
REQ_SET_DRM_SETTINGS = "<rci_request version='1.1'>" \
                       "  <set_setting>" \
                       "    <remote_manager>" \
                       "      {}" \
                       "    </remote_manager>" \
                       "  </set_setting>" \
                       "</rci_request>"
REQ_SETTING_MO = "<MO>{}</MO>"
REQ_SETTING_DF = "<DF>{}</DF>"

DO_CMD_XBEE_DISCOVER = "<discover option='current' />"
DO_CMD_XBEE_SETTING = "<radio_command addr='{}' id='{}' format='{}' timeout='1000' />"

SETTINGS_GROUP_DRM = "remote_manager"

ID_LEVEL = "level"
ID_TEMPERATURE = "temperature"
ID_VALVE = "valve"
ID_TANK = "tank"
ID_TANKS = "tanks"

ID_ERROR = "error"

REGEX_DEV_REQUEST_RESPONSE = ".*<device_request .*>(.*)<\\/device_request>.*"
REGEX_DO_CMD_RESPONSE = ".*<do_command target=[^>]*>(.*)<\\/do_command>.*"
REGEX_QUERY_SETTING_RESPONSE = ".*<query_setting>(.*)<\\/query_setting>.*"
REGEX_SETTING_MO = ".*<MO>(.*)</MO>.*"
REGEX_SETTING_DF = ".*<DF>(.*)</DF>.*"
REGEX_ERROR = ".*<error id=\"(.*)\">(.*)</error>.*"
REGEX_ERROR_TITLE = ".*<desc>(.*)</desc>.*"
REGEX_ERROR_HINT = ".*<hint>(.*)</hint>.*"
REGEX_ERROR_GENERAL = ".*<error>(.*)</error>.*"
REGEX_REMOTE_MANAGER_GROUP = ".*<remote_manager>.*<\\/remote_manager>.*"

TARGET_MICROPYTHON = "micropython"
REQ_VALVE_ON = "VALVE_ON"
REQ_VALVE_OFF = "VALVE_OFF"
REQ_REFILL = "REFILL"

FORMAT_STRING = "string"

PREFIX_TANK = "TANK_"

STREAM_FORMAT = "{}/{}"

VALUE_UNDEFINED = "UNDEFINED"

ALERT_NAME = "tank_level_{}"

WS_ALERTS_INVENTORY = "/ws/v1/alerts/inventory"
WS_GET_ALERTS_SUMMARY = "/ws/v1/alerts/summary?query=name='{}'"
WS_GET_ALERTS_INVENTORY = WS_ALERTS_INVENTORY + "?query=name='{}'"
WS_GET_ALERT_DETAILS = "/ws/v1/alerts/summary?query=id={}"
WS_RESET_ALERT = "/ws/AlarmStatus"
WS_REMOVE_ALERT = WS_ALERTS_INVENTORY + "/{}"
WS_REMOVE_MONITOR = "/ws/Monitor/{}"

RESET_ALERT_XML = "<AlarmStatus><id><almId>{}</almId><almsSourceEntityId>{}</almsSourceEntityId></id>" \
                  "<almsStatus>0</almsStatus></AlarmStatus>"
CREATE_ALERT_JSON = '{{' \
                        '"name": "{0}", ' \
                        '"description": "Tank level below {1}%", ' \
                        '"type": "DataPoint condition", ' \
                        '"priority": "high", ' \
                        '"scope": {{' \
                            '"type": "Resource", ' \
                            '"value": "*/level"' \
                        '}}, ' \
                        '"fire": {{' \
                            '"parameters": {{' \
                                '"thresholdValue": "{1}", ' \
                                '"type": "numeric", ' \
                                '"operator": "<", ' \
                                '"timeout": "1", ' \
                                '"timeUnit": "seconds"' \
                            '}}' \
                        '}}, ' \
                        '"reset": {{' \
                            '"parameters": {{' \
                                '"thresholdValue": "{2}", ' \
                                '"type": "numeric", ' \
                                '"operator": ">=", ' \
                                '"timeout": "1", ' \
                                '"timeUnit": "seconds"' \
                            '}}' \
                        '}}' \
                    '}}'

ERROR_NOT_CONNECTED = "Device Not Connected"

SCHEDULE_SAVE_TEMPLATE = "" \
                         "<Schedule on=\"IMMEDIATE\">" \
                         "  <targets>" \
                         "    <device id=\"{}\"/> " \
                         "  </targets>" \
                         "  <task>" \
                         "    <description>Configure Reporting Frequency</description>" \
                         "    <command>" \
                         "      <name>SM/UDP Request Connect</name>" \
                         "      <event>" \
                         "        <on_error>" \
                         "          <end_task/>" \
                         "        </on_error>" \
                         "      </event>" \
                         "      <sci>" \
                         "        <send_message reply=\"none\">" \
                         "          <sm_udp>" \
                         "            <request_connect/>" \
                         "          </sm_udp>" \
                         "        </send_message>" \
                         "      </sci>" \
                         "    </command>" \
                         "    <command>" \
                         "      <name>RCI Command</name>" \
                         "      <event>" \
                         "        <on_error>" \
                         "          <end_task/>" \
                         "        </on_error>" \
                         "      </event>" \
                         "      <sci>" \
                         "        <send_message allowOffline=\"true\" cache=\"false\">" \
                         "          <rci_request>" \
                         "            <set_setting>" \
                         "              <remote_manager>" \
                         "                {}" \
                         "              </remote_manager>" \
                         "            </set_setting>" \
                         "          </rci_request>" \
                         "        </send_message>" \
                         "      </sci>" \
                         "    </command>" \
                         "    <command>" \
                         "      <name>Disconnect</name>" \
                         "      <event>" \
                         "        <on_error>" \
                         "          <end_task/>" \
                         "        </on_error>" \
                         "      </event>" \
                         "      <sci>" \
                         "        <disconnect allowOffline=\"true\" waitForReconnect=\"false\"/>" \
                         "      </sci>" \
                         "    </command>" \
                         "  </task>" \
                         "</Schedule>"

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
        if not request.is_ajax or request.method != "POST":
            return JsonResponse({ID_ERROR: "AJAX request must be sent using POST"}, status=400)
        return None
    else:
        return JsonResponse({ID_ERROR: "Not authenticated"}, status=401)


def get_exception_response(e):
    """
    Returns the JSON response with the error contained in the given exception.

    Args:
        e (:class:`.Exception`): The exception.

    Returns:
        A JSON response with the details of the exception.
    """
    return JsonResponse({ID_ERROR: ("Error in the DRM request: {}.".format(e.response.text)
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

    tank_id = request.POST[views.PARAM_TANK_ID]
    data = request.POST[PARAM_DATA] if PARAM_DATA in request.POST else None

    try:
        resp = send_request(dc, tank_id, target, data)
        if resp is not None:
            return JsonResponse({"data": resp}, status=200)
        return JsonResponse({"valid": True}, status=200)
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
    resp = dc.sci.send_sci("data_service", DeviceTarget(device_id), request)

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
    resp = dc.sci.send_sci(SCI_SEND_MESSAGE, DeviceTarget(device_id),
                           request, cache=False)

    # If the status is not 200, throw an exception.
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    # Find and return the response (if any).
    re_search = re.search(REGEX_DO_CMD_RESPONSE, resp.text, re.IGNORECASE)
    if re_search:
        return re_search.group(1)

    return None


def send_query_setting(dc, device_id, settings_group):
    """
    Sends a 'query_setting' request to the device with the given device ID
    to get all the settings from the provided settings group.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        settings_group (String): the name of the settings group to get.

    Returns:
        String: The 'query_setting' XML response (if any).

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    # Generate the 'query_setting' request.
    request = REQ_QUERY_SETTING.format(settings_group)

    # Send the request and get the answer.
    resp = dc.sci.send_sci(SCI_SEND_MESSAGE, DeviceTarget(device_id),
                           request, cache=True)

    # If the status is not 200, throw an exception.
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    # Find and return the error (if any).
    re_search = re.search(REGEX_ERROR, resp.text, re.IGNORECASE)
    if re_search:
        error_msg = ""
        re_search = re.search(REGEX_ERROR_TITLE, resp.text, re.IGNORECASE)
        if re_search:
            error_msg = re_search.group(1)
        re_search = re.search(REGEX_ERROR_HINT, resp.text, re.IGNORECASE)
        if re_search:
            error_msg += ": %s" % re_search.group(1)
        return error_msg

    # Find and return the response (if any).
    re_search = re.search(REGEX_QUERY_SETTING_RESPONSE, resp.text,
                          re.IGNORECASE)

    if re_search:
        return re_search.group(1)

    return None


def send_set_drm_settings(dc, device_id, mo_value, df_value):
    """
    Sends a 'set_setting' request to the device with the given device ID
    to set the remote manager's MO and DF settings.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device.
        mo_value (String): the value of the MO setting.
        df_value (String): the value of the DF setting.

    Returns:
        String: The error message if there was an error setting the DRM
            settings. `None` otherwise.

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    # Generate the settings to set.
    settings = ""
    if mo_value != VALUE_UNDEFINED:
        settings += REQ_SETTING_MO.format(mo_value)
    if df_value != VALUE_UNDEFINED:
        settings += REQ_SETTING_DF.format(df_value)

    # Generate the 'set_setting' request with the DRM settings.
    request = REQ_SET_DRM_SETTINGS.format(settings)

    # Send the request and get the answer.
    resp = dc.sci.send_sci(SCI_SEND_MESSAGE, DeviceTarget(device_id),
                           request, cache=False)

    # If the status is not 200, throw an exception.
    if resp.status_code != 200:
        raise DeviceCloudHttpException(resp)

    # Find and return the error (if any).
    re_search = re.search(REGEX_ERROR, resp.text, re.IGNORECASE)
    if re_search:
        error_msg = ""
        re_search = re.search(REGEX_ERROR_TITLE, resp.text, re.IGNORECASE)
        if re_search:
            error_msg = re_search.group(1)
        re_search = re.search(REGEX_ERROR_HINT, resp.text, re.IGNORECASE)
        if re_search:
            error_msg += ": %s" % re_search.group(1)
        return error_msg

    return None


def get_installations(request):
    """
    Returns a list containing the smart tank monitoring installations of the
    DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        :class:`.HttpResponse`: An HTTP response with the list of the Smart
            tank monitoring installations within the DRM account in JSON format.
    """
    installations = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())

    for device in devices:
        # Get the group name of the device and verify it is a tank installation.
        group = device.get_group_path()
        if group == "" or not group.startswith(models.SMART_TANKS_PREFIX):
            continue

        # Get the tank installation from the list or create a new one.
        installation = None
        for inst in installations:
            if inst.name == group.replace(models.SMART_TANKS_PREFIX, ""):
                installation = inst
                break
        if installation is None:
            installation = SmartTankInstallation(group)
            installations.append(installation)

        # Add the device to the installation.
        installation.add_device(device.get_connectware_id())

        # If the location of the device is valid, add it to the list.
        lat, lon = device.get_latlon()
        if lat is not None and lon is not None:
            installation.add_device_location(lat, lon)

    return installations


def get_smart_tanks(request, installation_name):
    """
    Returns the list of Smart Tanks associated to the given installation.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        installation_name (String): the name of the installation.

    Returns:
        list: A list with the Smart Tanks associated to the given installation.

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    tanks = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())

    # Add the devices of the group.
    for device in devices:
        if device.get_group_path() != (models.SMART_TANKS_PREFIX + installation_name):
            continue

        tank = SmartTank(device.get_connectware_id(),
                         device.get_device_json().get("dpName"))
        tank.is_online = device.is_connected()
        lat, lon = device.get_latlon()
        if lat is not None and lon is not None:
            tank.location = (lat, lon)

        tanks.append(tank)

    return tanks


def get_general_installation_status(request, tanks):
    """
    Obtains the status of the installation.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        tanks (List): The list of smart tanks.

    Return:
        Dictionary: Dictionary containing the installation general status.
    """
    # Initialize variables.
    dc = get_device_cloud(request)

    status = {ID_TANKS: {}}

    for tank in tanks:
        status[ID_TANKS][tank.dev_id] = {}

    # Get all streams.
    streams = dc.streams.get_streams()

    # Get the data of the tanks.
    for stream in streams:
        try:
            data = stream.get_current_value(True).get_data()
        except:
            continue
        stream_id = stream.get_stream_id()

        # Tank status.
        for tank in tanks:
            device_id = tank.dev_id
            if not stream_id.startswith(device_id):
                continue

            if stream_id == STREAM_FORMAT.format(device_id, ID_LEVEL):
                status[ID_TANKS][device_id][ID_LEVEL] = data
            elif stream_id == STREAM_FORMAT.format(device_id, ID_TEMPERATURE):
                status[ID_TANKS][device_id][ID_TEMPERATURE] = data
            elif stream_id == STREAM_FORMAT.format(device_id, ID_VALVE):
                status[ID_TANKS][device_id][ID_VALVE] = data

    return status


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

    tank_id = request.POST[views.PARAM_TANK_ID]
    interval = int(
        request.POST[PARAM_DATA]) if PARAM_DATA in request.POST else 1

    stream_id = STREAM_FORMAT.format(tank_id, stream_name)

    strm = dc.streams.get_stream(stream_id)
    datapoints = []

    for dp in strm.read(
            start_time=(datetime.now(timezone.utc) - timedelta(hours=interval)),
            newest_first=False):
        datapoints.append({"timestamp": dp.get_timestamp().timestamp() * 1000,
                           "data": dp.get_data()})

    return JsonResponse({"data": datapoints}, status=200)


def set_tank_valve_value(request, device_id, value):
    """
    Sets the value of the tank valve.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the DRM device associated to
            the selected tank.
        value (String): the new value to set to the valve (one of "0" or "1").

    Returns:
        String: the new value of the valve (one of "0" or "1").
    """
    dc = get_device_cloud(request)
    request_data = REQ_VALVE_ON if value == "1" else REQ_VALVE_OFF

    return send_request(dc, device_id, TARGET_MICROPYTHON, request_data)


def refill_tank_request(request, device_id):
    """
    Refills the water tank.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the DRM device associated to
            the selected tank.

    Returns:
        String: the new water level of the tank.
    """
    dc = get_device_cloud(request)
    return send_request(dc, device_id, TARGET_MICROPYTHON, REQ_REFILL)


def is_device_online(request, device_id):
    """
    Returns whether the device corresponding to the given ID is connected or
    not.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The ID of the device to check its connection
            status.

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


def get_tank_configuration_request(request, device_id):
    """
    Returns the DRM configuration of the tank with the provided ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the DRM device associated to
            the selected tank.

    Returns:
        A JSON with the tank configuration or the error.
    """
    dc = get_device_cloud(request)
    mo_value = ""
    df_value = ""

    try:
        xml_response = send_query_setting(dc, device_id,  SETTINGS_GROUP_DRM)
        if xml_response is not None:
            # If the response is not an XML structure, it is an error.
            re_search = re.search(REGEX_REMOTE_MANAGER_GROUP, xml_response, re.IGNORECASE)
            if re_search:
                # Find and get the MO value.
                re_search = re.search(REGEX_SETTING_MO, xml_response, re.IGNORECASE)
                if re_search:
                    mo_value = re_search.group(1)
                # Find and get the DF value.
                re_search = re.search(REGEX_SETTING_DF, xml_response, re.IGNORECASE)
                if re_search:
                    df_value = re_search.group(1)
                return JsonResponse({"configuration": {"mo": mo_value, "df": df_value}}, status=200)
            else:
                return JsonResponse({ID_ERROR: xml_response}, status=400)
        else:
            return JsonResponse({ID_ERROR: "Invalid answer from the DRM device."}, status=400)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def set_tanks_configuration_request(request, device_ids, mo_value, df_value):
    """
    Sets the DRM configuration of the tanks with the provided IDs.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_ids (List): the IDs of the DRM devices to configure.
        mo_value (String): the new value of the MO setting.
        df_value (String): the new value of the DF setting.

    Returns:
        A JSON with the new configuration or the error.
    """
    scheduled_configs = []
    dc = get_device_cloud(request)

    # Configure all the devices one by one. Stop at the first error unless it is a "Device not connected" error.
    # In that case schedule a device configuration.
    for device_id in device_ids:
        try:
            error_msg = send_set_drm_settings(dc, device_id, mo_value, df_value)
            if error_msg is not None:
                if error_msg.lower() == ERROR_NOT_CONNECTED.lower():
                    # Schedule a configuration
                    schedule_tank_configuration(dc, device_id, mo_value, df_value)
                    scheduled_configs.append(device_id)
                else:
                    return JsonResponse({ID_ERROR: error_msg})
        except DeviceCloudHttpException as e:
            error_msg = e.response.text
            re_search = re.search(REGEX_ERROR_GENERAL, error_msg, re.IGNORECASE)
            if re_search:
                error_msg = re_search.group(1)
            return JsonResponse(
                {ID_ERROR: "Error in the DRM request: {}".format(error_msg)},
                status=400)

    # If all devices were configured successfully, return the current configuration.
    return JsonResponse( {
        "configuration": {
            "mo": mo_value,
            "df": df_value
        },
        "scheduled_configs": scheduled_configs
    }, status=200)


def schedule_tank_configuration(dc, device_id, mo_value, df_value):
    """
    Schedules the DRM configuration of the tank with the provided ID. This
    method should be used when the device is not connected to DRM.

    Args:
        dc (:class:`.DeviceCloud`): The Device Cloud instance to use.
        device_id (String): the device ID of the DRM device associated to
            the selected tank.
        mo_value (String): the new value of the MO setting.
        df_value (String): the new value of the DF setting.

    Raises:
        DeviceCloudHttpException: if there is any error sending the schedule.
    """
    dc_connection = dc.get_connection()

    # Generate the settings to set.
    settings = ""
    if mo_value != VALUE_UNDEFINED:
        settings += REQ_SETTING_MO.format(mo_value)
    if df_value != VALUE_UNDEFINED:
        settings += REQ_SETTING_DF.format(df_value)

    # Generate the request message.
    schedule_message = SCHEDULE_SAVE_TEMPLATE.format(device_id, settings)

    # Post the schedule. If the post fails, it will raise an exception.
    dc_connection.post("/ws/Schedule", schedule_message)


def get_alerts_request(request, installation_name):
    """
    Returns the fired alerts, alert definitions and list of tanks of the given
    installation.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.
        installation_name (String): The installation name.

    Returns:
        :class:`.JsonResponse`: A JSON response with the alerts of the
            installation.
    """
    dc = get_device_cloud(request)

    response = {}

    tanks = get_smart_tanks(request, installation_name)
    response[ID_TANKS] = [tank.to_json() for tank in tanks]

    try:
        # Get the fired alerts.
        fired_alerts = []
        ws = WS_GET_ALERTS_SUMMARY.format(ALERT_NAME.format(installation_name))
        resp = dc.get_connection().get(ws)
        if resp.status_code == 200:
            data = json.loads(resp.content.decode(resp.encoding))
            for alert in data["list"]:
                tank_id = alert["device_id"]
                tank_name = get_tank_name(tank_id, tanks)
                # Only add the alert if it belongs to a known tank and its status is fired.
                if tank_name is None or alert["status"] != "fired":
                    continue

                fired_alerts.append({"id": alert["id"], "tank_name": tank_name, "tank_id": tank_id,
                                     "description": alert["description"], "last_update": alert["last_update"]})
            response["alerts"] = fired_alerts

        # Get the alert definitions.
        alert_definitions = []
        ws = WS_GET_ALERTS_INVENTORY.format(ALERT_NAME.format(installation_name))
        resp = dc.get_connection().get(ws)
        if resp.status_code == 200:
            data = json.loads(resp.content.decode(resp.encoding))
            for alert in data["list"]:
                if "parameters" in alert["fire"]:
                    alert_definitions.append({"id": alert["id"], "description": alert["description"],
                                             "threshold": alert["fire"]["parameters"]["thresholdValue"]})
            response["definitions"] = alert_definitions

        return JsonResponse({"data": response}, status=200)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def get_alert_details(dc, alert_id, tank_id):
    """
    Returns the details of the alert with the given ID.

    Args:
        dc (:class:`.DeviceCloud`): The Device Cloud instance.
        alert_id (int): The ID of the alert to retrieve.
        tank_id (String): The ID of the tank associated to the alert.

    Returns:
        A JSON with the alert details, or `None` if the alert does not exist.

    Raises:
        DeviceCloudHttpException: if there is any error sending the request.
    """
    ws = WS_GET_ALERT_DETAILS.format(alert_id)
    resp = dc.get_connection().get(ws)
    if resp.status_code == 200:
        data = json.loads(resp.content.decode(resp.encoding))
        if data["count"] > 0:
            for alm in data["list"]:
                if alm["device_id"] == tank_id:
                    return alm
    return None


def reset_alert_request(request, alert_id, tank_id):
    """
    Resets the alert with the given ID.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.
        alert_id (int): The ID of the alert to reset.
        tank_id (String): The ID of the tank corresponding to the alert.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error in case the
            process fails.
    """
    dc = get_device_cloud(request)

    # Format the request content.
    content = RESET_ALERT_XML.format(alert_id, STREAM_FORMAT.format(tank_id, ID_LEVEL))

    try:
        # Update the alert status.
        dc.get_connection().put(WS_RESET_ALERT, content)

        return JsonResponse({"valid": True}, status=200)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def remove_alert_definition_request(request, alert_id):
    """
    Removes the alert definition with the given ID.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.
        alert_id (int): The ID of the alert definition to remove.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error in case the
            process fails.
    """
    dc = get_device_cloud(request)

    # Format the alerts web service path.
    ws = WS_REMOVE_ALERT.format(alert_id)

    try:
        # Remove the alert.
        dc.get_connection().delete(ws)

        return JsonResponse({"valid": True}, status=200)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def create_alert_definition_request(request, installation_name, threshold, auto_reset):
    """
    Creates a new alert definition with the given data.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.
        installation_name (String): The name of the installation.
        threshold (float): The tank level threshold.
        auto_reset (bool): `True` to reset the alert automatically, `False`
            otherwise.

    Returns:
        :class:`.JsonResponse`: A JSON response with the ID of the created alert
            or the error in case the process fails.
    """
    dc = get_device_cloud(request)

    try:
        # Create the alert definition.
        resp = dc.get_connection().post(WS_ALERTS_INVENTORY,
                                        CREATE_ALERT_JSON.format(ALERT_NAME.format(installation_name), threshold,
                                                                 threshold if auto_reset else 1000))

        if resp.status_code == 201:
            data = json.loads(resp.content.decode(resp.encoding))
            alert = data["list"][0]
            return JsonResponse({"id": alert["id"], "description": alert["description"],
                                 "threshold": alert["fire"]["parameters"]["thresholdValue"]}, status=200)

        return JsonResponse({ID_ERROR: "Invalid response."}, status=400)
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def get_tank_name(device_id, tanks):
    """
    Returns the name of the tank with the given ID contained in the given list.

    Args:
        device_id (String): The device ID of the tank to find.
        tanks (List): The list with tanks.

    Returns:
        The name of the tank if it is found, `None` otherwise.
    """
    for tank in tanks:
        if tank.dev_id == device_id:
            return tank.name
    return None


def subscribe_alerts(session, installation_name, consumer):
    """
    Creates a Device Cloud monitor to be notified when an alert of the given
    installation is fired.

    Args:
        session (:class:`.SessionStore`): The Django session.
        installation_name (String): The name of the installation.
        consumer (:class:`.WsConsumer`): The web socket consumer.

    Returns:
        The ID of the created monitor.
    """
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

    # Create a monitor for the alarms.
    monitor = monitor_manager.create_tcp_monitor(["AlarmStatus"])

    # Define the monitor callback.
    def monitor_callback(json_data):
        alert_status = json_data["Document"]["Msg"]["AlarmStatus"]
        alert_id = alert_status["id"]["almId"]
        alert_src_id = alert_status["id"]["almsSourceEntityId"]
        status = alert_status["almsStatus"]
        last_update = alert_status["almsUpdateTime"]
        tank_id = alert_status["devConnectwareId"] if "devConnectwareId" in alert_status else None

        # Only process alerts that are for the tank level.
        if tank_id is not None and alert_src_id == STREAM_FORMAT.format(tank_id, ID_LEVEL):
            send_data_ws = False
            # Check if the alert was fired or not.
            if status == 1:
                # Get the details of the fired alert.
                try:
                    alert = get_alert_details(dc, alert_id, tank_id)
                except DeviceCloudHttpException as e:
                    print(e)
                    return True

                # If the alert is none, its definition has been removed, so send it to the web socket for removal.
                if alert is None:
                    status = 0
                    send_data_ws = True
                # If the alert is for a tank of this installation, send it to the web socket to add it.
                elif alert["device_id"] == tank_id and alert["name"] == ALERT_NAME.format(installation_name):
                    send_data_ws = True
            else:
                # The alert was acknowledged or reset, so send it to the web socket for removal.
                send_data_ws = True

            if send_data_ws:
                consumer.send(text_data=json.dumps({"id": alert_id, "tank_id": tank_id,
                                                    "status": status, "last_update": last_update}))
        return True

    # Add the monitor callback.
    monitor.add_callback(monitor_callback)

    return monitor.get_id()


def unsubscribe_alerts(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for alert changes.

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
        dc.get_connection().delete(WS_REMOVE_MONITOR.format(monitor_id))
    except DeviceCloudHttpException as e:
        print(e)


class MonitorManager(MonitorAPI):
    """
    Class used to manage the use of Device Cloud monitors.
    """
    def __init__(self, conn):
        MonitorAPI.__init__(self, conn)
        self._tcp_client_manager = TCPClientManager(self._conn, secure=False)
