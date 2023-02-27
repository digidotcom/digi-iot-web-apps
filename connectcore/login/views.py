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

from devicecloud import DeviceCloud
from django.shortcuts import render, redirect

from login.auth import DeviceCloudUser
from login.models import CustomAuthForm

PARAM_DEST = "dest"

SUBDIR = os.getenv('SUBDIR', None)
ROOT_DIR = "/" if not SUBDIR else "/%s/" % SUBDIR


def login(request):
    # Create an empty authentication form.
    form = CustomAuthForm()
    if request.method == "POST":
        # Add received data to form.
        form = CustomAuthForm(data=request.POST)

        # Retrieve the credentials.
        server = form.data["server"]
        username = form.data["username"]
        password = form.data["password"]

        # Validate credentials.
        dc = request.session.get("dc")
        if not dc:
            dc = DeviceCloud(username, password, base_url=server)

        # If the user exists, do manual login and redirect to main page.
        if dc is not None and dc.has_valid_credentials():
            user = DeviceCloudUser(server, username, password)
            request.session["user"] = user.to_json()
            request.session["devices"] = {}
            request.session.modified = True
            return redirect_dest(request)

    return render(request, "login.html", {'form': form})


def logout(request):
    # End session.
    if request.session.get("user") is None:
        # Redirect to init page.
        return redirect("%saccess/login/" % ROOT_DIR)

    # Redirect to logout page.
    request.session["user"] = None
    request.session["devices"] = None
    return render(request, "logout.html")


def redirect_dest(request):
    """
    Redirects to the destination page based on the request arguments.

    Args:
        request (:class:`.WSGIRequest`): The HTTP request.

    Returns:
        An `HttpResponseRedirect` to the destination page.
    """
    url = ROOT_DIR
    if PARAM_DEST in request.GET:
        url += "{}/?".format((request.GET[PARAM_DEST].replace(ROOT_DIR, "")
                             if ROOT_DIR != "/" else request.GET[PARAM_DEST]).replace("/", ""))
        args = ""
        for arg in request.GET:
            if arg != PARAM_DEST:
                args += "{}={}&".format(arg, request.GET[arg])
        url += args[0:len(args) - 1]
    return redirect(url)
