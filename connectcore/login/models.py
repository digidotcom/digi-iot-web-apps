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

from django import forms
from django.contrib.auth.forms import AuthenticationForm

SERVER_CHOICES = (
    ("https://remotemanager.digi.com", "Official server"),
    ("https://test.idigi.com", "Test server")
)


class CustomAuthForm(AuthenticationForm):
    server = forms.ChoiceField(choices=SERVER_CHOICES, label='')
    username = forms.CharField(widget=forms.TextInput(
        attrs={"class": "validate", "placeholder": "DRM Username",
               "autocomplete": "username"}), label="")
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={"placeholder": "DRM Password",
               "autocomplete": "current-password"}), label="")

    field_order = ["server", "username", "password"]
