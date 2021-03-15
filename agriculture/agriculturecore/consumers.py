# Copyright 2021, Digi International Inc.
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

from channels.generic.websocket import WebsocketConsumer

from agriculturecore import drm_requests


class WsConsumer(WebsocketConsumer):
    """
    Class to manage web socket connections.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._monitor_id = -1

    def connect(self):
        session = self.scope["session"]
        farm_name = self.scope["url_route"]["kwargs"]["farm_name"]
        if session is None or session.session_key is None or farm_name is None:
            return

        # Accept the connection.
        self.accept()

        # Subscribe to any valve change.
        self._monitor_id = drm_requests.subscribe_valves(session, farm_name, self)

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe from valve changes.
            drm_requests.unsubscribe_valves(self.scope["session"], self._monitor_id)
            self._monitor_id = -1
