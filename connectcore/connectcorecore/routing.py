# Copyright 2022,2023, Digi International Inc.
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

import os

from django.urls import re_path

from . import consumers

# Build URL root dir.
SUBDIR = os.getenv('SUBDIR', None)
ROOT_DIR = "" if not SUBDIR else "%s/" % SUBDIR

websocket_urlpatterns = [
    re_path(r'%sws/cli/(?P<device_id>[\w-]+)/(?P<cli_session_id>[\w-]+)$' % ROOT_DIR, consumers.WsCLIConsumer.as_asgi()),
    re_path(r'%sws/datapoints/(?P<device_id>[\w-]+)$' % ROOT_DIR, consumers.DataPointConsumer.as_asgi()),
    re_path(r'%sws/file_upload_progress/(?P<file_name>[\w\.-]+)$' % ROOT_DIR, consumers.FileUploadProgressConsumer.as_asgi()),
    re_path(r'%sws/device/(?P<device_id>[\w-]+)$' % ROOT_DIR, consumers.DeviceConsumer.as_asgi()),
]
