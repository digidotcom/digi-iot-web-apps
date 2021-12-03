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

from django.shortcuts import redirect
from django.template.response import TemplateResponse
from agriculturecore.drm_requests import *

PARAM_CONTROLLER_ID = "controller_id"
PARAM_FARM_NAME = "farm_name"

ID_ERROR = "error"
ID_ERROR_TITLE = "error_title"
ID_ERROR_MSG = "error_msg"
ID_ERROR_GUIDE = "error_guide"

NO_FARMS_TITLE = "No smart farms found."
NO_FARMS_MSG = "No smart farms have been added to your DRM account. "

NO_STATIONS_TITLE = "No irrigation stations found."
NO_STATIONS_MSG = "No irrigation stations have been added to your farm. "

NO_CONTROLLERS_TITLE = "No irrigation controllers found."
NO_CONTROLLERS_MSG = "No irrigation controllers have been added to your farm. "

SETUP_MODULES_GUIDE = "Please, verify the <a target='_blank' rel='noopener noreferrer' href='https://www.digi.com/resources/documentation/digidocs/90002422/#tasks/t_config_devices.htm'>documentation</a> " \
                      "on how to set up your modules to run the Smart " \
                      "agriculture demo."


def farms_map(request):
    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'map.html')
    else:
        return redirect_login(request)


def dashboard(request):
    if not request_has_params(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'dashboard.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def history(request):
    if not request_has_params(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'history.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def schedule(request):
    if not request_has_params(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'schedule.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def verify_parameters(request):
    """
    Verifies the URL parameters to check if the given farm name and controller
    ID match an actual farm from the DRM account that was used to log in.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error and a redirect
         value, if the parameters were not successfully verified.
    """
    if is_authenticated(request):
        farms = get_farms(request)
        if len(farms) == 0:
            return JsonResponse({"redirect": "/"})

        # Get the controller ID and farm name from the POST request.
        data = json.loads(request.body.decode(request.encoding))
        controller_id = data[PARAM_CONTROLLER_ID]
        farm_name = data[PARAM_FARM_NAME]

        if ((controller_id is None or controller_id == "")
                or (farm_name is None or farm_name == "")):
            return JsonResponse({"redirect": "/"})

        # Find out if the supplied parameters correspond to an actual farm, if
        # not redirect to the main map.
        found_id = False
        found_name = False
        for farm in farms:
            if farm.name == farm_name:
                found_name = True
                for device in farm.devices:
                    if device == controller_id:
                        found_id = True
                        break

                # If no device was found in this farm, reset values to keep
                # searching.
                if not found_id:
                    found_name = False

        if not found_name or not found_id:
            return JsonResponse({"redirect": "/"})
        return JsonResponse({"valid": True}, status=200)
    else:
        return redirect_login(request)


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


def get_weather_condition(request):
    """
    Returns the weather condition.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "get_condition")


def set_weather_condition(request):
    """
    Sets the weather condition.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "set_condition")


def get_time_factor(request):
    """
    Returns the time factor.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "get_time_factor")


def set_time_factor(request):
    """
    Sets the time factor.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "set_time_factor")


def get_time(request):
    """
    Returns the current time.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "get_time")


def get_schedule(request):
    """
    Returns the irrigation schedule.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "get_schedule")


def set_schedule(request):
    """
    Sets the irrigation schedule.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the response or the error.
    """
    return send_device_request(request, "set_schedule")


def get_smart_farms(request):
    """
    Returns a JSON response containing the smart farms of the DRM account.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of the Smart
            Farms within the DRM account.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    smart_farms = get_farms(request)
    if len(smart_farms) > 0:
        return JsonResponse({"farms": [smart_farm.to_json() for smart_farm
                                       in smart_farms]},
                            status=200)
    else:
        return JsonResponse({ID_ERROR_TITLE: NO_FARMS_TITLE,
                             ID_ERROR_MSG: NO_FARMS_MSG,
                             ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})


def get_irrigation_stations(request):
    """
    Returns a JSON response containing a list with the Irrigation Stations
    corresponding to the controller with the ID provided in the request.

    Args:

        request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of Irrigation
            Stations corresponding to the controller with the ID provided in
            the request.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    # Get the controller ID from the POST request.
    controller_id = request.POST[PARAM_CONTROLLER_ID]

    try:
        stations = get_stations(request, controller_id)
        if len(stations) > 0:
            return JsonResponse({ID_STATIONS: [station.to_json() for station in stations]},
                                status=200)
        else:
            return JsonResponse({ID_ERROR_TITLE: NO_STATIONS_TITLE,
                                 ID_ERROR_MSG: NO_STATIONS_MSG,
                                 ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})
    except DeviceCloudHttpException as e:
        return JsonResponse({ID_ERROR: str(e)})


def get_farm_status(request):
    """
    Returns a dictionary containing the status of the farm.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the status of the farm.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    try:
        # Get the controller ID from the POST request.
        data = json.loads(request.body.decode(request.encoding))
        controller_id = data[PARAM_CONTROLLER_ID]
        first = data["first"] if "first" in data else False

        farm_status = {}

        # Get controllers.
        controllers = get_controllers(request, controller_id)
        if len(controllers) == 0:
            farm_status[ID_ERROR_TITLE] = NO_CONTROLLERS_TITLE
            farm_status[ID_ERROR_MSG] = NO_CONTROLLERS_MSG
            farm_status[ID_ERROR_GUIDE] = SETUP_MODULES_GUIDE
        else:
            farm_status[ID_CONTROLLERS] = [controller.to_json() for controller in controllers]

        # Get stations.
        stations = get_stations(request, controller_id, first)
        if len(stations) == 0:
            farm_status[ID_ERROR_TITLE] = NO_STATIONS_TITLE
            farm_status[ID_ERROR_MSG] = NO_STATIONS_MSG
            farm_status[ID_ERROR_GUIDE] = SETUP_MODULES_GUIDE
        else:
            farm_status[ID_STATIONS] = [station.to_json() for station in stations]

        # Get the farm status.
        status = get_general_farm_status(request, controller_id, stations)
        farm_status["status"] = status

        return JsonResponse(farm_status, status=200)
    except Exception as e:
        return JsonResponse({ID_ERROR: str(e)})


def set_valve(request):
    """
    Sets the value of a valve.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the set status.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    # Get the controller ID and irrigation station from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    controller_id = data[PARAM_CONTROLLER_ID]
    station_id = data["station_id"]
    value = data["status"]

    new_value = set_valve_value(request, controller_id, station_id, value)
    if new_value is not None:
        return JsonResponse({"value": new_value}, status=200)
    return JsonResponse({"error": "Could not set the valve."}, status=400)


def set_tank_valve(request):
    """
    Sets the value of the tank valve.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the set status.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    # Get the controller ID and status of the valve from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    controller_id = data[PARAM_CONTROLLER_ID]
    value = data["status"]

    new_value = set_tank_valve_value(request, controller_id, value)
    if new_value is not None:
        return JsonResponse({"value": new_value}, status=200)
    return JsonResponse({"error": "Could not set the valve."}, status=400)


def refill_tank(request):
    """
    Refills the water tank.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the set status.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    # Get the controller ID and level of the tank from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    controller_id = data[PARAM_CONTROLLER_ID]

    new_value = refill_tank_request(request, controller_id)
    if new_value is not None:
        return JsonResponse({"value": new_value}, status=200)
    return JsonResponse({"error": "Could not set the valve."}, status=400)


def get_request_data(request):
    """
    Gets the request data and saves it in a dictionary to be distributed as
    context variables.

    Args:
        request (:class:`.WSGIRequest`): The request to get the data from.

    Returns:
        dic: A dictionary containing the context variables.
    """
    data = {}
    if request_has_id(request):
        data[PARAM_CONTROLLER_ID] = request.GET[PARAM_CONTROLLER_ID]
    if request_has_name(request):
        data[PARAM_FARM_NAME] = request.GET[PARAM_FARM_NAME]
    return data


def get_wind(request):
    """
    Returns the wind speed data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """

    return get_data_points(request, ID_WIND)


def get_wind_dir(request):
    """
    Returns the wind direction data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """

    return get_data_points(request, ID_WIND_DIR)


def get_luminosity(request):
    """
    Returns the luminosity data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """

    return get_data_points(request, ID_LUMINOSITY)


def get_rain_acc(request):
    """
    Returns the rain data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_RAIN_ACC)


def get_rain(request):
    """
    Returns the rain accumulated data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_RAIN)


def get_radiation(request):
    """
    Returns the radiation data of the main controller.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_RADIATION)


def get_temperature(request):
    """
    Returns the temperature data of the station contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_TEMPERATURE)


def get_moisture(request):
    """
    Returns the soil moisture data of the station contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_MOISTURE)


def get_valve(request):
    """
    Returns the valve position data of the station contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_VALVE)


def check_farm_connection_status(request):
    """
    Checks whether the farm with the ID specified in the request is online
    or offline.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the status of the farm or the error.
    """
    if is_authenticated(request):
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/access/login')

    # Get the controller ID and irrigation station from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    controller_id = data["controller_id"]

    online = is_device_online(request, controller_id)
    return JsonResponse({"status": online}, status=200)


def request_has_id(request):
    """
    Returns whether the request has the 'controller_id' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (PARAM_CONTROLLER_ID in request.GET
            and request.GET[PARAM_CONTROLLER_ID] is not None)


def request_has_name(request):
    """
    Returns whether the request has the 'farm_name' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (PARAM_FARM_NAME in request.GET
            and request.GET[PARAM_FARM_NAME] is not None)


def request_has_params(request):
    """
    Returns whether the request has the required parameters.

    Returns:
        `True` if the request has the required parameters, `False` otherwise.
    """
    return request_has_id(request) and request_has_name(request)
