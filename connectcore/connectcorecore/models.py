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

DEFAULT_LOCATION = (33.813980, -117.923089)  # Batuu (Star Wars Galaxy's Edge)


class ConnectCoreDevice:

    def __init__(self, device_id, device_type):
        """
        Class constructor. Instantiates a new ``ConnectCore``.

        Args:
            device_id (String): The ID of the ConnectCore device.
            device_type (String): The type of the ConnectCore device.
        """
        self._id = device_id
        self._type = device_type
        self._location = DEFAULT_LOCATION
        self._online = False

    @property
    def id(self):
        """
        Returns the ID of the ConnectCore device.

        Returns:
             String: The ID of the ConnectCore device.
        """
        return self._id

    @property
    def type(self):
        """
        Returns the type of the ConnectCore device.

        Returns:
             String: The type of the ConnectCore device.
        """
        return self._type

    @property
    def location(self):
        """
        Returns the geo-location of the ConnectCore device.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the ConnectCore device.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the ConnectCore device.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the ConnectCore device.
        """
        self._location = location

    @property
    def is_online(self):
        """
        Returns whether the ConnectCore device is online or not.

        Returns:
            Boolean: `True` if the ConnectCore device is online, `False` otherwise.
        """
        return self._online

    @is_online.setter
    def is_online(self, online):
        """
        Sets whether the ConnectCore device is online or not.

        Args:
            online (Boolean): `True` if the ConnectCore device is online, `False` otherwise.
        """
        self._online = online

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The Smart Farm object in JSON format.
        """
        json_dict = {
            "id": self._id,
            "type": self._type,
            "location": self._location,
            "online": self._online
        }
        return json_dict
