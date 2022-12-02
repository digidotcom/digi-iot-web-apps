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

from django.shortcuts import redirect
from django.template.response import TemplateResponse
from sensorlabcore.drm_requests import *
from sensorlabcore.models import SensorType

# Constants.
ID_ERROR_GUIDE = "error_guide"
ID_ERROR_MSG = "error_msg"
ID_ERROR_TITLE = "error_title"
ID_STREAMS = "data_streams"

ERROR_MESSAGE_DATA_POINTS = "Could not read sensor value(s)."
ERROR_MESSAGE_NO_DEVICES = "Could not find any XBee Cellular device in the DRM account. "
ERROR_MESSAGE_SETUP_MODULES = "Please, verify the <a target='_blank' rel='noopener noreferrer' " \
                              "href='TBD'>documentation</a> on how to set up your XBee Cellular " \
                              "devices to run the XBee Sensor Lab MicroPython applications."

TITLE_NO_DEVICES = "No XBee Cellular devices found."


def dashboard(request):
    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'dashboard.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def get_request_data(request):
    """
    Gets the request data and saves it in a dictionary to be distributed as
    context variables.

    Args:
        request (:class:`.WSGIRequest`): The request to get the data from.

    Returns:
        dic: A dictionary containing the context variables.
    """
    return {}


def redirect_login(request):
    """
    Redirects to the login page, passing any argument if present.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        An `HttpResponseRedirect` to the login page.
    """
    url = "/access/login"
    if request.path is not None and request.GET is not None and len(request.GET) > 0:
        url += "?dest={}".format(request.path.replace("/", ""))
        for arg in request.GET:
            url += "&{}={}".format(arg, request.GET[arg])
    return redirect(url)


def get_devices(request):
    """
    Returns a JSON response containing the XBee Cellular devices of the DRM
    account.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of XBee Cellular
            device IDs within the DRM account and their connection status.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    cc_devices = get_cellular_devices(request)
    if len(cc_devices) > 0:
        return JsonResponse({ID_READ_DEVICES: [cc_device.to_json() for cc_device in cc_devices]},
                            status=200)
    else:
        return JsonResponse({ID_ERROR_TITLE: TITLE_NO_DEVICES,
                             ID_ERROR_MSG: ERROR_MESSAGE_NO_DEVICES,
                             ID_ERROR_GUIDE: ERROR_MESSAGE_SETUP_MODULES})


def get_sensor_types(request):
    """
    Returns a JSON response containing all the sensor types.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated.

    Returns:
        :class:`.JsonResponse`: A JSON response containing all the sensor
            types.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    return JsonResponse({ID_READ_SENSOR_TYPES: SensorType.list_sensors()},
                        status=200)


def get_data_streams(request):
    """
    Reads a list of data streams and returns the answer in JSON format.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

     Returns:
        :class:`.JsonResponse`: A JSON response with the operation result.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the data stream IDs from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    data_streams = data[ID_STREAMS]
    answer = get_data_points(request, data_streams)

    if answer is not None:
        if ID_ERROR in answer:
            return JsonResponse({ID_ERROR: answer[ID_ERROR]}, status=400)
        return JsonResponse(answer, status=200)
    return JsonResponse({ID_ERROR: ERROR_MESSAGE_DATA_POINTS}, status=400)
