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

from channels.generic.websocket import WebsocketConsumer
from sensorlabcore import drm_requests

# Constants.
ERROR_REGISTER_DATAPOINT_MONITOR = "ERROR: could not register data point monitor - %s"

ID_ERROR = "error"
ID_MONITOR_ID = "monitor_id"

TEMPLATE_ERROR = "{" \
                 "  \"type\": \"error\"," \
                 "  \"error\": \"%s\"" \
                 "}"


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
        # Sanity checks.
        if session is None:
            return
        # Accept the connection.
        self.accept()

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe CLI monitor.
            drm_requests.remove_datapoints_monitor(self.scope["session"], self._monitor_id)
            self._monitor_id = -1

    def receive(self, text_data=None, bytes_data=None):
        if self._monitor_id != -1:
            return
        # Get data streams.
        data_streams = json.loads(text_data)
        # Subscribe Data Point monitor.
        answer = drm_requests.register_datapoints_monitor(self.scope["session"], data_streams, self)
        # Check errors.
        if ID_ERROR in answer:
            self._monitor_id = -1
            self.send(text_data=TEMPLATE_ERROR % ERROR_REGISTER_DATAPOINT_MONITOR % answer[ID_ERROR])
            return
        self._monitor_id = answer[ID_MONITOR_ID]