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
