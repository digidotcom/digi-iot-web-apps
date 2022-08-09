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

from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/cli/(?P<device_id>[\w-]+)/(?P<cli_session_id>[\w-]+)$', consumers.WsCLIConsumer.as_asgi()),
    re_path(r'wss/cli/(?P<device_id>[\w-]+)/(?P<cli_session_id>[\w-]+)$', consumers.WsCLIConsumer.as_asgi()),
    re_path(r'ws/datapoints/(?P<device_id>[\w-]+)$', consumers.DataPointConsumer.as_asgi()),
    re_path(r'wss/datapoints/(?P<device_id>[\w-]+)$', consumers.DataPointConsumer.as_asgi()),
    re_path(r'ws/file_upload_progress/(?P<file_name>[\w\.-]+)$', consumers.FileUploadProgressConsumer.as_asgi()),
    re_path(r'wss/file_upload_progress/(?P<file_name>[\w\.-]+)$', consumers.FileUploadProgressConsumer.as_asgi()),
    re_path(r'ws/device/(?P<device_id>[\w-]+)$', consumers.DeviceConsumer.as_asgi()),
    re_path(r'wss/device/(?P<device_id>[\w-]+)$', consumers.DeviceConsumer.as_asgi()),
]
