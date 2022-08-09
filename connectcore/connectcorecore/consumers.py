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

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from connectcorecore import drm_requests

ERROR_REGISTER_CLI_MONITOR = "ERROR: could not register CLI monitor - %s"
ERROR_REGISTER_DATAPOINT_MONITOR = "ERROR: could not register data point monitor - %s"
ERROR_REGISTER_DEVICE_MONITOR = "ERROR: could not register device monitor - %s"
ERROR_START_CLI_SESSION = "ERROR: could not start CLI session - %s"

GROUP_UPLOAD_PROGRESS = "upload_progress.{}"

ID_ERROR = "error"
ID_MONITOR_ID = "monitor_id"

TEMPLATE_ERROR = "{" \
                 "  \"type\": \"error\"," \
                 "  \"error\": \"%s\"" \
                 "}"
TEMPLATE_PROGRESS = "{" \
                    "  \"progress\": %s" \
                    "}"


class WsCLIConsumer(WebsocketConsumer):
    """
    Class to manage web socket connection for CLI session.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._monitor_id = -1
        self._session_id = -1

    def connect(self):
        session = self.scope["session"]
        device_id = self.scope["url_route"]["kwargs"]["device_id"]
        self._session_id = self.scope["url_route"]["kwargs"]["cli_session_id"]
        # Sanity checks.
        if session is None or device_id is None or self._session_id is None:
            return
        # Accept the connection.
        self.accept()
        # Subscribe CLI monitor.
        answer = drm_requests.register_cli_monitor(session, device_id, self._session_id, self)
        # Check errors.
        if ID_ERROR in answer:
            self._monitor_id = -1
            self.send(text_data=TEMPLATE_ERROR % ERROR_REGISTER_CLI_MONITOR % answer[ID_ERROR])
            return
        self._monitor_id = answer[ID_MONITOR_ID]
        # Start CLI session.
        try:
            answer = drm_requests.start_cli_session(session, device_id, self._session_id)
            if answer and ID_ERROR in answer:
                self.send(text_data=TEMPLATE_ERROR % (ERROR_START_CLI_SESSION % answer[ID_ERROR]))
        except Exception as e:
            self.send(text_data=TEMPLATE_ERROR % (ERROR_START_CLI_SESSION % str(e)))

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe CLI monitor.
            drm_requests.remove_cli_monitor(self.scope["session"], self._session_id, self._monitor_id)
            self._monitor_id = -1
            self._session_id = -1


class DataPointConsumer(WebsocketConsumer):
    """
    Class to manage web socket connection for device Data Points.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._monitor_id = -1

    def connect(self):
        # Initialize variables.
        session = self.scope["session"]
        device_id = self.scope["url_route"]["kwargs"]["device_id"]
        # Sanity checks.
        if session is None or device_id is None:
            return

        # Accept the connection.
        self.accept()
        # Subscribe Data Point monitor.
        answer = drm_requests.register_datapoints_monitor(session, device_id, self)
        # Check errors.
        if ID_ERROR in answer:
            self._monitor_id = -1
            self.send(text_data=TEMPLATE_ERROR % ERROR_REGISTER_DATAPOINT_MONITOR % answer[ID_ERROR])
            return
        self._monitor_id = answer[ID_MONITOR_ID]

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe CLI monitor.
            drm_requests.remove_datapoints_monitor(self.scope["session"], self._monitor_id)
            self._monitor_id = -1


class FileUploadProgressConsumer(WebsocketConsumer):
    """
    Class to manage web socket connection for firmware upload progress updates.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._file_name = ""
        self._unique_group_name = ""

    def connect(self):
        self._file_name = self.scope["url_route"]["kwargs"]["file_name"]
        self._unique_group_name = GROUP_UPLOAD_PROGRESS.format(self._file_name)
        async_to_sync(self.channel_layer.group_add)(self._unique_group_name, self.channel_name)
        # Accept the connection.
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self._unique_group_name, self.channel_name)

    def receive(self, text_data=None, bytes_data=None):
        if "cancel" in text_data:
            drm_requests.get_cancel_request_manager().notify_callback(self._file_name)

    def progress_received(self, event):
        self.send(text_data=TEMPLATE_PROGRESS % event["data"])


class DeviceConsumer(WebsocketConsumer):
    """
    Class to manage web socket connection for device connections.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._monitor_id = -1

    def connect(self):
        # Initialize variables.
        session = self.scope["session"]
        device_id = self.scope["url_route"]["kwargs"]["device_id"]
        # Sanity checks.
        if session is None or device_id is None:
            return

        # Accept the connection.
        self.accept()
        # Subscribe device monitor.
        answer = drm_requests.register_device_monitor(session, device_id, self)
        # Check errors.
        if ID_ERROR in answer:
            self._monitor_id = -1
            self.send(text_data=TEMPLATE_ERROR % ERROR_REGISTER_DEVICE_MONITOR % answer[ID_ERROR])
            return
        self._monitor_id = answer[ID_MONITOR_ID]

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe monitor.
            drm_requests.remove_device_monitor(self.scope["session"], self._monitor_id)
            self._monitor_id = -1
