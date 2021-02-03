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

from channels.generic.websocket import WebsocketConsumer

from tankscore import drm_requests


class WsConsumer(WebsocketConsumer):
    """
    Class to manage web socket connections.
    """
    def __init__(self):
        WebsocketConsumer.__init__(self)
        self._monitor_id = -1

    def connect(self):
        session = self.scope["session"]
        installation_name = self.scope["url_route"]["kwargs"]["installation_name"]
        if session is None or session.session_key is None or installation_name is None:
            return

        # Accept the connection.
        self.accept()

        # Subscribe to any alert change.
        self._monitor_id = drm_requests.subscribe_alerts(session, installation_name, self)

    def disconnect(self, close_code):
        if self._monitor_id != -1:
            # Unsubscribe from alert changes.
            drm_requests.unsubscribe_alerts(self.scope["session"], self._monitor_id)
            self._monitor_id = -1
