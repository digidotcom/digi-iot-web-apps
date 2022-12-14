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

from enum import Enum

# Constants.
WIDGET_SCALE = """
<div class='sensor-widget-v'>
    <div class='sensor-widget-image sensor-widget-image-v'>
        <img src='/static_files/images/widgets/scale.png'}'>
    </div>
    <div class='sensor-widget-data-v'>
        <div class='sensor-widget-value sensor-widget-value-v'>
            <span id='{0}/xbsl/scale'>-</span>
        </div>
        <div class='sensor-widget-units sensor-widget-units-v'>
            <span>Kg</span>
        </div>
    </div>
</div>
"""
WIDGET_SLIDER = """"""
WIDGET_ATMOSPHERE = """"""
WIDGET_AIR = """"""
WIDGET_LIGHT = """"""
WIDGET_MOISTURE = """"""
WIDGET_DISTANCE = """"""
WIDGET_NOISE = """"""
WIDGET_TILT = """"""
WIDGET_TEMP_HUM = """
<div class='sensor-widget-h' style='height: 50%'>
    <div class='sensor-widget-image sensor-widget-image-h'>
        <img src='/static_files/images/widgets/temperature.png'>
    </div>
    <div class='sensor-widget-value sensor-widget-value-h'>
        <span id='{0}/xbsl/xbibc/temperature'>-</span>
    </div>
    <div class='sensor-widget-units sensor-widget-units-h'>
        <span>C</span>
    </div>
</div>
<div class='sensor-widget-h' style='height: 50%'>
    <div class='sensor-widget-image sensor-widget-image-h'>
        <img src='/static_files/images/widgets/humidity.png'>
    </div>
    <div class='sensor-widget-value sensor-widget-value-h'>
        <span id='{0}/xbsl/xbibc/humidity'>-</span>
    </div>
    <div class='sensor-widget-units sensor-widget-units-h'>
        <span>%</span>
    </div>
</div>
"""


class XBeeCellularDevice:
    def __init__(self, device_id, online):
        """
        Class constructor. Instantiates a new ``XBeeCellularDevice``.

        Args:
            device_id (String): The ID of the device.
            online (Boolean): Whether the device is online or not.
        """
        self._device_id = device_id
        self._online = online

    @property
    def device_id(self):
        """
        Returns the device ID of the XBee Cellular device.

        Returns:
             String: The device ID of the XBee Cellular device.
        """
        return self._device_id

    @property
    def online(self):
        """
        Returns whether the device is online or not.

        Returns:
             Boolean: Whether the device is online or not.
        """
        return self._online

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The XBee Cellular device in JSON format.
        """
        json_dict = {
            "device_id": self._device_id,
            "online": self._online
        }
        return json_dict


class XBeeSensor:
    def __init__(self, name, xbee_device, sensor_type):
        """
        Class constructor. Instantiates a new ``XBeeSensor``.

        Args:
            name (String): The name of the XBee sensor.
            xbee_device (:class:`.SensorType`:): The XBee device Cellular
                device the sensor is attached to.
            sensor_type (SensorType): The type of XBee sensor.
        """
        self._name = name
        self._xbee_device = xbee_device
        self._sensor_type = sensor_type

    @property
    def name(self):
        """
        Returns the name of the XBee sensor.

        Returns:
             String: The name of the XBee sensor.
        """
        return self._name

    @property
    def xbee_device(self):
        """
        Returns the XBee Cellular device the sensor is attached to.

        Returns:
             :class:`.SensorType`: The XBee Cellular device the sensor is
                attached to.
        """
        return self._xbee_device

    @property
    def sensor_type(self):
        """
        Returns the type of sensor.

        Returns:
             :class:`.SensorType`: The tye of sensor.
        """
        return self._sensor_type

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The XBee sensor in JSON format.
        """
        json_dict = {
            "name": self._name,
            "xbee_device": self._xbee_device.to_json(),
            "sensor_type": self._sensor_type.to_json()
        }
        return json_dict


class SensorType(Enum):
    """
    Enumerates the available XBee sensor types.

    | Inherited properties:
    |     **name** (String): the name (id) of this XBeeProtocol.
    |     **value** (String): the value of this XBeeProtocol.
    """
    SCALE  =     (0, "Scale",         WIDGET_SCALE,      ["xbsl/scale"])
    SLIDER =     (1, "Slider",        WIDGET_SLIDER,     ["xbsl/slider"])
    ATMOSPHERE = (2, "Atmosphere",    WIDGET_ATMOSPHERE, ["xbsl/atmosphere/pressure",
                                                          "xbsl/atmosphere/humidity",
                                                          "xbsl/atmosphere/temperature"])
    AIR =        (3, "Air quality",   WIDGET_AIR,        ["xbsl/air/co2",
                                                          "xbsl/air/tvoc",
                                                          "xbsl/air/h2",
                                                          "xbsl/air/ethanol"])
    LIGHT =      (4, "Light level",   WIDGET_LIGHT,      ["xbsl/light"])
    MOISTURE =   (5, "Soil moisture", WIDGET_MOISTURE,   ["xbsl/moisture"])
    DISTANCE =   (6, "Distance",      WIDGET_DISTANCE,   ["xbsl/distance"])
    NOISE =      (7, "Noise level",   WIDGET_NOISE,      ["xbsl/noise"])
    TILT =       (8, "Tilt",          WIDGET_TILT,       ["xbsl/tilt"])
    TEMP_HUM =   (9, "XBIBC Board",   WIDGET_TEMP_HUM,   ["xbsl/xbibc/temperature",
                                                          "xbsl/xbibc/humidity"])

    def __init__(self, code, name, html_widget, stream_ids):
        self._code = code
        self._name = name
        self._html_widget = html_widget
        self._stream_ids = stream_ids

    @property
    def code(self):
        """
        Returns the code of the SensorType element.

        Returns:
            Integer: The code of the SensorType element.
        """
        return self._code

    @property
    def name(self):
        """
        Returns the name of the SensorType element.

        Returns:
            String: The name of the SensorType element.
        """
        return self._name

    @property
    def html_widget(self):
        """
        Returns the HTML widget code of the SensorType element.

        Returns:
            String: The HTML widget code of the SensorType element.
        """
        return self._html_widget

    @property
    def stream_ids(self):
        """
        Returns the data stream ID suffixes of the SensorType element.

        Returns:
            List: The data stream ID suffixes of the SensorType element.
        """
        return self._stream_ids

    def to_json(self):
        """
        Returns the object in JSON format.

        Returns:
            The sensor type object in JSON format.
        """
        json_dict = {
            "code": self._code,
            "name": self._name,
            "html_widget": self._html_widget,
            "streams": self._stream_ids
        }
        return json_dict

    @staticmethod
    def list_sensors():
        """
        Returns a JSON object containing all the sensor types.

        Returns:
            A JSON object containing all the sensor types.
        """
        return [sensor_type.to_json() for sensor_type in SensorType]
