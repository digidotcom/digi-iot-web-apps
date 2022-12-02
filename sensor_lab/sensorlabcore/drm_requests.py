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
import re
import textwrap
import xml.etree.ElementTree as elementTree

from devicecloud import DeviceCloud, DeviceCloudHttpException, DeviceCloudException
from devicecloud.monitor import MonitorAPI, TCPDeviceCloudMonitor, MON_TRANSPORT_TYPE_ATTR, MON_STATUS_ATTR
from devicecloud.monitor_tcp import TCPClientManager
from django.http import JsonResponse
from login.auth import DeviceCloudUser
from sensorlabcore.models import XBeeCellularDevice

# Constants.
CELLULAR_VENDOR_ID = "4261412870"

DATA_POINTS_BUFFER_DURATION = 5
DATA_POINTS_BUFFER_SIZE = 10

ERROR_NO_POST_REQUEST = "AJAX request must be sent using POST"
ERROR_NOT_AUTHENTICATED = "Not authenticated"
ERROR_REFRESH_DATA_POINTS = "Error refreshing sensor data: %s"

ID_DATA_STREAMS = "data_streams"
ID_READ_DEVICES = "read_devices"
ID_READ_SENSOR_TYPES = "read_sensor_types"
ID_ERROR = "error"
ID_ERROR_MESSAGE = "error_message"
ID_MONITOR_ID = "monitor_id"
ID_STREAM = "stream"
ID_VALUE = "value"

REGEX_MONITOR_ERROR = ".*<error>(.*)<\\/error>.*"

SCHEMA_MONITOR_DP_FILTER = '{{#eachFiltered this}}' \
                           '{{#endsWith DataPoint.streamId "%s"}}' \
                           '{{#if @first}}' \
                           '{' \
                           '"stream": "{{DataPoint.streamId}}",' \
                           '"value": {{DataPoint.data}} ' \
                           '}@@SEPARATOR@@' \
                           '{{/if}}' \
                           '{{/endsWith}}' \
                           '{{/eachFiltered}}'

WS_MONITOR_API = "/ws/Monitor/{}"

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
    return DeviceCloud(user_serialized.username, user_serialized.password,
                       base_url=user_serialized.server)


def get_cellular_devices(request):
    """
    Returns a list containing the XBee Cellular devices of the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to generate the
            Device Cloud instance.

    Returns:
        Dictionary: A dictionary containing the list of XBee Cellular devices
            within the DRM account with their connection status
    """
    drm_devices = []
    dc = get_device_cloud(request)
    devices = list(dc.devicecore.get_devices())
    for device in devices:
        # Get the type of the device and verify it is a ConnectCore device.
        if device.get_vendor_id() != CELLULAR_VENDOR_ID:
            continue

        drm_devices.append(XBeeCellularDevice(device.get_connectware_id(),
                                              device.is_connected()))

    return drm_devices


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


def get_data_points(request, stream_ids):
    """
    Returns the latest data point of the given list of data streams in JSON
    format.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.
        stream_ids (List): the list of data streams.

    Returns:
        A JSON with the data points or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Obtain the list of data stream objects.
    dc = get_device_cloud(request)
    data_streams = {}
    answer = {}
    try:
        for stream_id in stream_ids:
            data_stream = dc.streams.get_stream(stream_id)
            data_streams[stream_id] = data_stream.get_current_value().get_data()
        answer[ID_DATA_STREAMS] = data_streams
    except DeviceCloudException as e:
        answer[ID_ERROR] = ERROR_REFRESH_DATA_POINTS % str(e)

    return answer


def register_datapoints_monitor(session, stream_ids, consumer):
    """
    Creates a Device Cloud monitor to be notified when the given device
    uploads a new data point.

    Args:
        session (:class:`.SessionStore`): The Django session.
        stream_ids (List): List of data stream IDs to monitor.
        consumer (:class:`.WsConsumer`): The web socket consumer.

    Returns:
        The ID of the created monitor.
    """
    # Initialize variables.
    answer = {}
    topic = "DataPoint/"
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
    remove_inactive_monitors(dc, "DataPoint")

    # Build the monitor schema.
    schema = "["
    for stream in stream_ids:
        if stream_ids.index(stream) != len(stream_ids) - 1:
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
                                                                 batch_size=len(stream_ids) * DATA_POINTS_BUFFER_SIZE,
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
        location = elementTree.fromstring(response.text).find('.//location').text
        monitor_id = int(location.split('/')[-1])
        return TCPDeviceCloudMonitor(self._conn, monitor_id, self._tcp_client_manager)