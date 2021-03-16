# Copyright 2020, 2021, Digi International Inc.
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
import xml.etree.ElementTree as et
from datetime import datetime, timedelta, timezone
from xml.etree.ElementTree import ParseError

from devicecloud import DeviceCloud, DeviceCloudHttpException
from devicecloud.monitor import MonitorAPI
from devicecloud.monitor_tcp import TCPClientManager
from devicecloud.sci import DeviceTarget
from django.http import JsonResponse

from login.auth import DeviceCloudUser
from agriculturecore import models, views
from agriculturecore.models import SmartFarm, IrrigationController, IrrigationStation

TAG_MAIN_CONTROLLER = "main_controller"

PARAM_DATA = "data"
PARAM_MAC_ADDR = "mac_addr"
PARAM_SELECTED = "selected"

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

DO_CMD_XBEE_DISCOVER = "<discover option='current' />"
DO_CMD_XBEE_SETTING = "<radio_command addr='{}' id='{}' format='{}' timeout='1000' />"

ID_WIND = "wind"
ID_RADIATION = "radiation"
ID_RAIN = "rain"
ID_LEVEL = "level"
ID_VALVE = "valve"
ID_TEMPERATURE = "temperature"
ID_BATTERY = "battery"
ID_MOISTURE = "moisture"

ID_CONTROLLERS = "controllers"
ID_STATIONS = "stations"
ID_WEATHER = "weather"
ID_TANK = "tank"

ID_ERROR = "error"

REGEX_DEV_REQUEST_RESPONSE = ".*<device_request .*>(.*)<\\/device_request>.*"
REGEX_DO_CMD_RESPONSE = ".*<do_command target=[^>]*>(.*)<\\/do_command>.*"

TARGET_ZIGBEE = "zigbee"
TARGET_SET_STATON_VALVE = "set_station_valve"
TARGET_SET_TANK_VALVE = "set_tank_valve"
TARGET_REFILL_TANK = "refill_tank"

FORMAT_STRING = "string"

SETTING_LAT = "LX"
SETTING_LON = "LY"

PREFIX_STATION = "ST_"

STREAM_FORMAT_CONTROLLER = "{}/{}"
STREAM_FORMAT = "{}/{}/{}"

WS_REMOVE_MONITOR = "/ws/Monitor/{}"

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

    device_id = request.POST[views.PARAM_CONTROLLER_ID]
    data = request.POST[PARAM_DATA] if PARAM_DATA in request.POST else None

    try:
        resp = send_request(dc, device_id, target, data)
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


def get_farms(request):
    """
    Returns a list containing the smart farms of the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        :class:`.HttpResponse`: An HTTP response with the list of the Smart
            Farms within the DRM account in JSON format.
    """
    smart_farms = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    for device in devices:
        # Get the group name of the device and verify it is a smart farm.
        group = device.get_group_path()
        if group == "" or not group.startswith(models.SMART_FARM_PREFIX):
            continue

        # Get the smart farm from the list or create a new one.
        smart_farm = None
        for farm in smart_farms:
            if farm.name == group:
                smart_farm = farm
                break
        if smart_farm is None:
            smart_farm = SmartFarm(group)
            smart_farms.append(smart_farm)

        # Add the device to the farm.
        smart_farm.add_device(device.get_connectware_id())

        # Check if this is the main controller.
        if TAG_MAIN_CONTROLLER in device.get_tags():
            # Set the main controller of the farm.
            smart_farm.main_controller = device.get_connectware_id()

            # Set the online property to the farm.
            smart_farm.is_online = device.is_connected()

            # If the location of the device is valid, set it to the farm.
            lat, lon = device.get_latlon()
            if lat is not None and lon is not None:
                smart_farm.location = (lat, lon)

    return smart_farms


def get_controllers(request, device_id):
    """
    Returns the list of Irrigation Controllers associated to the device with the
    given ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the DRM device to get its
            associated Irrigation Controllers.

    Returns:
        list: A list with the Irrigation Controllers associated to the device
            with the given ID.
    """
    controllers = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    group = None

    # Find the group of the device with the given ID.
    for device in devices:
        if device.get_connectware_id() == device_id:
            group = device.get_group_path()
            break

    if group is None:
        return controllers

    # Add the devices of the group.
    for device in devices:
        if device.get_group_path() != group:
            continue

        controller = IrrigationController(device.get_connectware_id(),
                                          device.get_device_json().get("dpName"),
                                          TAG_MAIN_CONTROLLER in device.get_tags())
        lat, lon = device.get_latlon()
        if lat is not None and lon is not None:
            controller.location = (lat, lon)

        controllers.append(controller)

    return controllers


def get_stations(request, device_id, request_locations=False):
    """
    Returns the list of Irrigation Stations associated to the device with the
    given ID.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): the device ID of the DRM device to get its
            associated Irrigation Stations.
        request_locations (Boolean, optional): `True` to request the GPS
            locations of the stations, `False` otherwise.

    Returns:
        list: A list with the Irrigation Stations associated to the device
            with the given ID.
    """
    # Initialize variables.
    stations = []
    dc = get_device_cloud(request)

    # Generate the 'do_command' data.
    do_cmd_data = DO_CMD_XBEE_DISCOVER

    # Send the 'do_command' and get the answer.
    try:
        response = send_do_command(dc, device_id, TARGET_ZIGBEE, do_cmd_data)
    except DeviceCloudHttpException as e:
        raise e

    # Parse the answer and generate the irrigation stations.
    if response is None:
        return stations

    try:
        xml_response = et.fromstring(response)
        for xbee_device in xml_response.findall("device"):
            # Get the name of the XBee device.
            name = xbee_device.find("node_id").text
            if name is None or not name.startswith(PREFIX_STATION):
                continue

            # Get the MAC address of the XBee device.
            ext_addr = xbee_device.find("ext_addr").text
            if ext_addr is None:
                continue

            address = normalize_mac(ext_addr)

            # Instantiate the irrigation station.
            station = IrrigationStation(address, name)

            # Get the geo-location of the XBee device.
            latitude = None
            longitude = None
            locations = request.session.get("locations")

            # If the location of this stations is in the session, return it from there.
            if address in locations:
                latitude = locations[address][SETTING_LAT]
                longitude = locations[address][SETTING_LON]
            elif request_locations:
                # Obtain the location from DRM.
                try:
                    latitude = float(get_xbee_setting(dc, device_id, station.address, SETTING_LAT))
                    longitude = float(get_xbee_setting(dc, device_id, station.address, SETTING_LON))
                    if latitude is not None and longitude is not None:
                        locations[address] = {}
                        locations[address][SETTING_LAT] = latitude
                        locations[address][SETTING_LON] = longitude
                except Exception as e:
                    print(e)
                    continue

            if latitude is not None and longitude is not None:
                station.location = (latitude, longitude)

            # Add the station to the list.
            stations.append(station)
    except ParseError:
        return stations

    return stations


def get_xbee_setting(dc, device_id, xbee_addr, setting):
    """
    Returns the value of the setting from the given XBee device.

    Args:
        dc (:class:`.DeviceCloud`): the Device Cloud instance.
        device_id (String): the device ID of the DRM device that owns the
            XBee device.
        xbee_addr (String): the MAC address of the XBee device to read the
            setting from. Must follow this format: XX:XX:XX:XX:XX:XX:XX:XX!
        setting (String): the XBee setting to read.

    Returns:
        String: the value of the XBee setting.
    """
    # Generate the 'do_command' data.
    do_cmd_data = DO_CMD_XBEE_SETTING.format(xbee_addr, setting, FORMAT_STRING)
    # Send the 'do_command' and get the answer.
    try:
        response = send_do_command(dc, device_id, TARGET_ZIGBEE, do_cmd_data)
    except DeviceCloudHttpException as e:
        raise e

    if response is None:
        return
    try:
        xml_response = et.fromstring(response)
        if xml_response.find("error") is not None:
            return None
        return xml_response.text
    except ParseError:
        return None


def set_valve_value(request, controller_id, station_id, value):
    """
    Sets the value of a valve.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        controller_id (String): the device ID of the DRM device that owns the
            station.
        station_id (String): the ID of the station to set its valve.
        value (String): the new value to set to the valve (one of "0" or "1").

    Returns:
        String: the new value of the valve (one of "0" or "1").
    """
    dc = get_device_cloud(request)
    request_data = "%s%s%s" % (station_id, DATA_SEPARATOR, value)

    return send_request(dc, controller_id, TARGET_SET_STATON_VALVE,
                        data=request_data)


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


def normalize_mac(mac_address):
    """
    Normalizes the given MAC address.

    Args:
        mac_address (String): The MAC address to normalize.

    Returns:
        String: the normalized MAC address
    """
    return mac_address.replace(":", "").replace("!", "")


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

    device_id = request.POST[views.PARAM_CONTROLLER_ID]
    interval = int(
        request.POST[PARAM_DATA]) if PARAM_DATA in request.POST else 1
    mac_addr = request.POST[
        PARAM_MAC_ADDR] if PARAM_MAC_ADDR in request.POST else None

    if mac_addr is None:
        stream_id = "{}/{}".format(device_id, stream_name)
    else:
        stream_id = "{}/{}/{}".format(device_id, mac_addr, stream_name)

    strm = dc.streams.get_stream(stream_id)
    datapoints = []

    for dp in strm.read(
            start_time=(datetime.now(timezone.utc) - timedelta(hours=interval)),
            newest_first=False):
        datapoints.append({"timestamp": dp.get_timestamp().timestamp() * 1000,
                           "data": dp.get_data()})

    return JsonResponse({"data": datapoints}, status=200)


def get_general_farm_status(request, device_id, stations):
    """
    Obtains the status of the farm.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        device_id (String): The device ID of the DRM device associated to
            the main controller of the farm.
        stations (List): The list of irrigation stations.

    Return:
        Dictionary: Dictionary containing the farm general status.
    """
    # Initialize variables.
    dc = get_device_cloud(request)

    status = {ID_WEATHER: {}, ID_TANK: {}, ID_STATIONS: {}}

    for station in stations:
        status[ID_STATIONS][normalize_mac(station.address)] = {}

    # Get all streams of the given controller.
    streams = dc.streams.get_streams(stream_prefix=device_id)

    # Get the data of the weather station, water tank, and irrigation stations.
    for stream in streams:
        try:
            data = stream.get_current_value(True).get_data()
        except:
            continue
        stream_id = stream.get_stream_id()
        # Weather station.
        if stream_id == STREAM_FORMAT_CONTROLLER.format(device_id, ID_WIND):
            status[ID_WEATHER][ID_WIND] = data
        elif stream_id == STREAM_FORMAT_CONTROLLER.format(device_id, ID_RAIN):
            status[ID_WEATHER][ID_RAIN] = data
        elif stream_id == STREAM_FORMAT_CONTROLLER.format(device_id, ID_RADIATION):
            status[ID_WEATHER][ID_RADIATION] = data
        # Water tank.
        elif stream_id == STREAM_FORMAT_CONTROLLER.format(device_id, ID_LEVEL):
            status[ID_TANK][ID_LEVEL] = data
        elif stream_id == STREAM_FORMAT_CONTROLLER.format(device_id, ID_VALVE):
            status[ID_TANK][ID_VALVE] = data

        # Station status.
        for station in stations:
            mac_address = normalize_mac(station.address)
            if not stream_id.startswith(STREAM_FORMAT_CONTROLLER.format(device_id, mac_address)):
                continue

            if stream_id == STREAM_FORMAT.format(device_id, mac_address, ID_TEMPERATURE):
                status[ID_STATIONS][mac_address][ID_TEMPERATURE] = data
            elif stream_id == STREAM_FORMAT.format(device_id, mac_address, ID_MOISTURE):
                status[ID_STATIONS][mac_address][ID_MOISTURE] = data
            elif stream_id == STREAM_FORMAT.format(device_id, mac_address, ID_BATTERY):
                status[ID_STATIONS][mac_address][ID_BATTERY] = data
            elif stream_id == STREAM_FORMAT.format(device_id, mac_address, ID_VALVE):
                status[ID_STATIONS][mac_address][ID_VALVE] = data

    return status


def set_tank_valve_value(request, controller_id, value):
    """
    Sets the value of the tank valve.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        controller_id (String): the device ID of the DRM device associated to
            the main controller of the farm.
        value (String): the new value to set to the valve (one of "0" or "1").

    Returns:
        String: the new value of the valve (one of "0" or "1").
    """
    dc = get_device_cloud(request)
    request_data = "%s" % value

    return send_request(dc, controller_id, TARGET_SET_TANK_VALVE,
                        data=request_data)


def refill_tank_request(request, controller_id):
    """
    Refills the water tank.

    Args:
        request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        controller_id (String): the device ID of the DRM device associated to
            the main controller of the farm.

    Returns:
        String: the new value of the valve (one of "0" or "1").
    """
    dc = get_device_cloud(request)
    return send_request(dc, controller_id, TARGET_REFILL_TANK)


def is_device_online(request, controller_id):
    """
    Returns whether the device corresponding to the given ID is connected or
    not.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.
        controller_id (String): The ID of the device to check its connection
            status.

    Returns:
        Boolean: `True` if the device is online, `False` otherwise.
    """
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    for device in devices:
        if device.get_connectware_id() != controller_id:
            continue
        return device.is_connected()
    return False


def subscribe_valves(session, farm_name, consumer):
    """
    Creates a Device Cloud monitor to be notified when any valve of the given
    farm, either from the tank or from any irrigation station, changes.

    Args:
        session (:class:`.SessionStore`): The Django session.
        farm_name (String): The name of the farm.
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

    # Create a monitor for the valves.
    monitor = monitor_manager.create_tcp_monitor(["[group={}{}]DataPoint".format(models.SMART_FARM_PREFIX, farm_name)])

    # Define the monitor callback.
    def monitor_callback(json_data):
        stream_id = json_data["Document"]["Msg"]["DataPoint"]["streamId"]
        valve = json_data["Document"]["Msg"]["DataPoint"]["data"]

        # Only process data streams for any valve.
        if stream_id.endswith(ID_VALVE):
            parts = stream_id.split("/")
            device = parts[1] if len(parts) == 3 else ID_TANK
            consumer.send(text_data=json.dumps({"device": device, "value": valve}))

        return True

    # Add the monitor callback.
    monitor.add_callback(monitor_callback)

    return monitor.get_id()


def unsubscribe_valves(session, monitor_id):
    """
    Disconnects and deletes the Device Cloud monitor with the given ID that was
    listening for valve changes.

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
