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

from django.shortcuts import redirect
from django.template.response import TemplateResponse
from tankscore.drm_requests import *

PARAM_TANK_ID = "tank_id"
PARAM_TANK_IDS = "tank_ids"
PARAM_MO = "mo"
PARAM_DF = "df"

ID_ERROR_TITLE = "error_title"
ID_ERROR_MSG = "error_msg"
ID_ERROR_GUIDE = "error_guide"

NO_INSTALLATIONS_TITLE = "No tanks installations found."
NO_INSTALLATIONS_MSG = "No tanks installations have been added to your DRM account. "

NO_TANKS_TITLE = "No smart tanks found."
NO_TANKS_MSG = "No smart tanks have been added to your DRM account. "

SETUP_MODULES_GUIDE = "Please, verify the <a target='_blank' rel='noopener noreferrer' href='https://www.digi.com/resources/documentation/digidocs/90002422/#tasks/t_tank_config_devices.htm'>documentation</a> " \
                      "on how to set up your modules to run the Smart " \
                      "tank monitoring demo."


def dashboard(request):
    if not request_has_name(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'dashboard.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def history(request):
    if not request_has_name(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'history.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def configuration(request):
    if not request_has_name(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'configuration.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def alerts(request):
    if not request_has_name(request):
        return redirect("/")

    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'alerts.html',
                                    get_request_data(request))
    else:
        return redirect_login(request)


def installations_map(request):
    if is_authenticated(request):
        if request.method == "GET":
            return TemplateResponse(request, 'map.html')
    else:
        return redirect_login(request)


def verify_parameters(request):
    """
    Verifies the URL parameters to check if the given installation name and
    installation ID match an actual installation from the DRM account that was
    used to log in.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error and a redirect
         value, if the parameters were not successfully verified.
    """
    if is_authenticated(request):
        installations = get_installations(request)
        if len(installations) == 0:
            return JsonResponse({"redirect": "/"})

        # Get the installation ID and installation name from the POST request.
        data = json.loads(request.body.decode(request.encoding))
        installation_name = data[PARAM_INSTALLATION_NAME]

        if installation_name is None or installation_name == "":
            return JsonResponse({"redirect": "/"})

        # Find out if the supplied parameters correspond to an actual
        # installation, if not redirect to the main map.
        found_name = False
        for installation in installations:
            if installation.name == installation_name:
                found_name = True
                break

        if not found_name:
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


def set_tank_valve(request):
    """
    Sets the value of the tank valve.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the set status.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the tank ID and status of the valve from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    tank_id = data[PARAM_TANK_ID]
    value = data["status"]

    new_value = set_tank_valve_value(request, tank_id, value)
    if new_value is not None:
        return JsonResponse({"value": new_value}, status=200)
    return JsonResponse({ID_ERROR: "Could not set the valve."}, status=400)


def refill_tank(request):
    """
    Refills the water tank.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the set status.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the tank ID of the tank from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    tank_id = data[PARAM_TANK_ID]

    new_value = refill_tank_request(request, tank_id)
    if new_value is not None:
        return JsonResponse({"value": new_value}, status=200)
    return JsonResponse({ID_ERROR: "Could not set the valve."}, status=400)


def get_tanks(request):
    """
    Returns a JSON response containing a list with the Smart Tanks
    corresponding to the installation with the name provided in the request.

    Args:

        request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of Smart Tanks
            corresponding to the installation with the name provided in
            the request.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the installation name from the POST request.
    controller_id = request.POST[PARAM_INSTALLATION_NAME]

    try:
        tanks = get_smart_tanks(request, controller_id)
        if len(tanks) > 0:
            return JsonResponse({ID_TANKS: [tank.to_json() for tank in tanks]},
                                status=200)
        else:
            return JsonResponse({ID_ERROR_TITLE: NO_TANKS_TITLE,
                                 ID_ERROR_MSG: NO_TANKS_MSG,
                                 ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})
    except DeviceCloudHttpException as e:
        return get_exception_response(e)


def get_installation_status(request):
    """
    Returns a dictionary containing the status of the installation.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the status of the
            installation.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the controller ID from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    installation_name = data[PARAM_INSTALLATION_NAME]

    installation_status = {}

    try:
        # Get tanks.
        tanks = get_smart_tanks(request, installation_name)
        if len(tanks) == 0:
            installation_status[ID_ERROR_TITLE] = NO_TANKS_TITLE
            installation_status[ID_ERROR_MSG] = NO_TANKS_MSG
            installation_status[ID_ERROR_GUIDE] = SETUP_MODULES_GUIDE
        else:
            installation_status[ID_TANKS] = [tank.to_json() for tank in tanks]

        # Get the installation status.
        status = get_general_installation_status(request, tanks)
        installation_status["status"] = status

        return JsonResponse(installation_status, status=200)
    except Exception as e:
        return get_exception_response(e)


def get_level(request):
    """
    Returns the water level data of the tank contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_LEVEL)


def get_temperature(request):
    """
    Returns the temperature data of the tank contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_TEMPERATURE)


def get_valve(request):
    """
    Returns the valve position data of the tank contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the list of data points or the error.
    """
    return get_data_points(request, ID_VALVE)


def get_tank_configuration(request):
    """
    Returns the configuration of the tank contained in the request.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the configuration of the tank or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the tank ID of the tank from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    tank_id = data[PARAM_TANK_ID]

    return get_tank_configuration_request(request, tank_id)


def set_tanks_configuration(request):
    """
    Sets the configuration of the tanks contained in the request and returns
    the current configuration.

    Args:
        request (:class:`.WSGIRequest`): the AJAX request.

    Returns:
        A JSON with the current configuration or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the tank ID of the tanks from the POST request.
    data = json.loads(request.body.decode(request.encoding))
    tank_ids = data[PARAM_TANK_IDS]
    # Get the configuration parameters from the POST request.
    mo_value = data[PARAM_MO]
    df_value = data[PARAM_DF]

    return set_tanks_configuration_request(request, tank_ids,
                                           mo_value, df_value)


def get_tanks_installations(request):
    """
    Returns a JSON response containing the tanks installations of the DRM
    account.

    Args:
         request (:class:`.WSGIRequest`): The request used to check if the
            user is authenticated and to generate the Device Cloud instance.

    Returns:
        :class:`.JsonResponse`: A JSON response with the list of the tanks
            installations within the DRM account.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    installations = get_installations(request)
    if len(installations) > 0:
        return JsonResponse({"installations": [installation.to_json()
                                               for installation in
                                               installations]},
                            status=200)
    else:
        return JsonResponse({ID_ERROR_TITLE: NO_INSTALLATIONS_TITLE,
                             ID_ERROR_MSG: NO_INSTALLATIONS_MSG,
                             ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})


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
    if request_has_name(request):
        data[PARAM_INSTALLATION_NAME] = request.GET[PARAM_INSTALLATION_NAME]
    return data


def request_has_name(request):
    """
    Returns whether the request has the 'installation_name' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (PARAM_INSTALLATION_NAME in request.GET
            and request.GET[PARAM_INSTALLATION_NAME] is not None)


def get_alerts(request):
    """
    Returns the fired alerts, alert definitions and list of tanks of the
    installation contained in the request.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.

    Returns:
        :class:`.JsonResponse`: A JSON response with the alerts of the
            installation or the error.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the installation name from the POST request.
    installation_name = request.POST[PARAM_INSTALLATION_NAME]

    return get_alerts_request(request, installation_name)


def reset_alert(request):
    """
    Resets the alert with the ID contained in the given request.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error in case the
            process fails.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the alert and tank IDs from the POST request.
    alert_id = request.POST[PARAM_DATA]
    tank_id = request.POST[PARAM_TANK_ID]

    return reset_alert_request(request, alert_id, tank_id)


def remove_alert_definition(request):
    """
    Removes the alert definition with the ID contained in the given request.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.

    Returns:
        :class:`.JsonResponse`: A JSON response with an error in case the
            process fails.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the alert ID from the POST request.
    alert_id = request.POST[PARAM_DATA]

    return remove_alert_definition_request(request, alert_id)


def create_alert_definition(request):
    """
    Creates a new alert definition with the data contained in the request.

    Args:
        request (:class:`.WSGIRequest`): The AJAX request.

    Returns:
        :class:`.JsonResponse`: A JSON response with the ID of the created alert
            or the error in case the process fails.
    """
    # Check if the AJAX request is valid.
    error = check_ajax_request(request)
    if error is not None:
        return error

    # Get the installation name and threshold from the POST request.
    installation_name = request.POST[PARAM_INSTALLATION_NAME]
    data = json.loads(request.POST[PARAM_DATA])
    threshold = data["threshold"]
    auto_reset = data["reset"]

    return create_alert_definition_request(request, installation_name, threshold, auto_reset)
