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

from devicecloud import DeviceCloud

from login.auth import DeviceCloudUser


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
