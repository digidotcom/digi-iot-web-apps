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

SMART_TANKS_PREFIX = "tanks-"

DEFAULT_LOCATION = (33.813980, -117.923089)  # Batuu (Star Wars Galaxy's Edge)


class SmartTankInstallation:

    def __init__(self, name):
        """
        Class constructor. Instantiates a new ``SmartTankInstallation``.

        Args:
            name (String): The name of the smart tank installation.
        """
        self._name = name.replace(SMART_TANKS_PREFIX, "")
        self._devices = []
        self._lats = []
        self._lons = []

    @property
    def name(self):
        """
        Returns the name of the smart tank installation.

        Returns:
             String: The name of the smart tank installation.
        """
        return self._name

    @property
    def location(self):
        """
        Returns the geo-location of the smart tank installation.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the smart tank installation.
        """
        if len(self._lats) == 0 or len(self._lons) == 0:
            return DEFAULT_LOCATION
        return sum(self._lats) / len(self._lats), sum(self._lons) / len(self._lons)

    @property
    def devices(self):
        """
        Returns the list of devices (XBee Gateways) that are part of the smart
        tank installation.

        Returns:
            List : List of :class:`.Device` that are part of the smart tank
                installation.
        """
        return self._devices

    @devices.setter
    def devices(self, devices):
        """
        Sets the list of devices that are part of the smart tank installation.

        Args:
            devices (List): List of device IDs that are part of the smart tank
                installation.
        """
        self._devices = devices

    def add_device(self, device):
        """
        Adds the given device to the list of devices of the smart tank
        installation.

        Args:
            device (String): The device ID to add to the list.
        """
        if self._devices is None:
            self._devices = []
        self._devices.append(device)

    def add_device_location(self, lat, lon):
        """
        Adds the given device location to the list of locations of the smart
        tank installation.

        Args:
            lat (float): The device latitude.
            lon (float): The device longitude.
        """
        self._lats.append(lat)
        self._lons.append(lon)

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The smart tank installation object in JSON format.
        """
        json_dict = {
            "name": self._name,
            "location": self.location,
            "devices": self._devices,
            "num_devices": len(self._devices)
        }
        return json_dict


class SmartTank:

    def __init__(self, dev_id, name):
        """
        Class constructor. Instantiates a new ``SmartTank``.

        Args:
            dev_id (String): The device ID of the smart tank.
            name (String): The name of the smart tank.
        """
        self._dev_id = dev_id
        self._name = name
        self._location = DEFAULT_LOCATION
        self._online = False

    @property
    def dev_id(self):
        """
        Returns the device ID of the smart tank.

        Returns:
             String: The device ID of the smart tank.
        """
        return self._dev_id

    @property
    def name(self):
        """
        Returns the name of the smart tank.

        Returns:
             String: The name of the smart tank.
        """
        return self._name

    @property
    def location(self):
        """
        Returns the geo-location of the smart tank.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the smart tank.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the smart tank.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the smart tank.
        """
        self._location = location

    @property
    def is_online(self):
        """
        Returns whether the smart tank is online or not.

        Returns:
            Boolean: `True` if the smart tank is online, `False` otherwise.
        """
        return self._online

    @is_online.setter
    def is_online(self, online):
        """
        Sets whether the smart tank is online or not.

        Args:
            online (Boolean): `True` if the smart tank is online, `False`
                otherwise.
        """
        self._online = online

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The smart tank object in JSON format.
        """
        json_dict = {
            "dev_id": self._dev_id,
            "name": self._name,
            "location": self._location,
            "online": self._online
        }
        return json_dict
