# Copyright 2020, Digi International Inc.
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

SMART_FARM_PREFIX = "agri-"

DEFAULT_LOCATION = (33.813980, -117.923089)  # Batuu (Star Wars Galaxy's Edge)


class SmartFarm:

    def __init__(self, name):
        """
        Class constructor. Instantiates a new ``SmartFarm``.

        Args:
            name (String): The name of the smart farm.
        """
        self._name = name.replace(SMART_FARM_PREFIX, "")
        self._location = DEFAULT_LOCATION
        self._devices = []
        self._main_controller = None
        self._online = False

    @property
    def name(self):
        """
        Returns the name of the smart farm.

        Returns:
             String: The name of the smart farm.
        """
        return self._name

    @property
    def location(self):
        """
        Returns the geo-location of the smart farm.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the smart farm.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the smart farm.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the smart farm.
        """
        self._location = location

    @property
    def devices(self):
        """
        Returns the list of devices (XBee Gateways) that are part of the smart
        farm.

        Returns:
            List : List of :class:`.Device` that are part of the smart farm.
        """
        return self._devices

    @devices.setter
    def devices(self, devices):
        """
        Sets the list of devices that are part of the smart farm.

        Args:
            devices (List): List of device IDs that are part of the smart farm.
        """
        self._devices = devices

    def add_device(self, device):
        """
        Adds the given device to the list of devices of the smart farm.

        Args:
            device (String): The device ID to add to the list.
        """
        if self._devices is None:
            self._devices = []
        self._devices.append(device)

    @property
    def main_controller(self):
        """
        Returns the ID of the main controller device of the smart farm.

        Returns:
            String: The ID of the main controller device of the smart farm.
        """
        return self._main_controller

    @main_controller.setter
    def main_controller(self, main_controller):
        """
        Sets the ID of the main controller device of the smart farm.

        Args:
            main_controller (String): The ID of the main controller device.
        """
        self._main_controller = main_controller

    @property
    def is_online(self):
        """
        Returns whether the farm is online or not.

        Returns:
            Boolean: `True` if the farm is online, `False` otherwise.
        """
        return self._online

    @is_online.setter
    def is_online(self, online):
        """
        Sets whether the farm is online or not.

        Args:
            online (Boolean): `True` if the farm is online, `False` otherwise.
        """
        self._online = online

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The Smart Farm object in JSON format.
        """
        json_dict = {
            "name": self._name,
            "location": self._location,
            "devices": self._devices,
            "main_controller": self._main_controller,
            "online": self._online
        }
        return json_dict


class IrrigationStation:

    def __init__(self, address, name):
        """
        Class constructor. Instantiates a new ``IrrigationStation``.

        Args:
            address (String): The MAC address of the irrigation station.
            name (String): The name of the irrigation station.
        """
        self._address = address
        self._name = name
        self._location = DEFAULT_LOCATION

    @property
    def address(self):
        """
        Returns the MAC address of the XBee representing the smart farm.

        Returns:
             String: The MAC address of the XBee representing the smart farm.
        """
        return self._address

    @property
    def name(self):
        """
        Returns the name of the irrigation station.

        Returns:
             String: The name of the irrigation station.
        """
        return self._name

    @property
    def location(self):
        """
        Returns the geo-location of the irrigation station.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the irrigation station.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the irrigation station.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the irrigation station.
        """
        self._location = location

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The Irrigation Station object in JSON format.
        """
        json_dict = {
            "address": self._address,
            "name": self._name,
            "location": self._location
        }
        return json_dict


class IrrigationController:

    def __init__(self, controller_id, name, is_main=False):
        """
        Class constructor. Instantiates a new ``IrrigationController``.

        Args:
            controller_id (String): The device ID of the irrigation controller.
            name (String): The name of the irrigation controller.
            is_main (Boolean, optional): Whether the irrigation controller is
                the main or not.
        """
        self._controller_id = controller_id
        self._name = name
        self._is_main = is_main
        self._location = DEFAULT_LOCATION

    @property
    def controller_id(self):
        """
        Returns the device ID of the irrigation controller.

        Returns:
             String: The device ID of the irrigation controller.
        """
        return self._controller_id

    @property
    def name(self):
        """
        Returns the name of the irrigation controller.

        Returns:
             String: The name of the irrigation controller.
        """
        return self._name

    @property
    def is_main_controller(self):
        """
        Returns whether the irrigation controller is the main or not.

        Returns:
             Boolean: `True` if it is the main controller, `False` otherwise.
        """
        return self._is_main

    @property
    def location(self):
        """
        Returns the geo-location of the irrigation controller.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the irrigation controller.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the irrigation controller.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the irrigation controller.
        """
        self._location = location

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The Irrigation Station object in JSON format.
        """
        json_dict = {
            "controller_id": self._controller_id,
            "name": self._name,
            "is_main": self._is_main,
            "location": self._location
        }
        return json_dict
