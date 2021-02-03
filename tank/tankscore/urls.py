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

from django.urls import path

from . import views

urlpatterns = [
    path('', views.installations_map, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('history/', views.history, name='history'),
    path('configuration/', views.configuration, name='configuration'),
    path('alerts/', views.alerts, name='alerts'),
    path('ajax/get_installation_status', views.get_installation_status, name="get_installation_status"),
    path('ajax/set_tank_valve', views.set_tank_valve, name="set_tank_valve"),
    path('ajax/refill_tank', views.refill_tank, name="refill_tank"),
    path('ajax/get_tanks', views.get_tanks, name='get_tanks'),
    path('ajax/get_level', views.get_level, name="get_level"),
    path('ajax/get_temperature', views.get_temperature, name="get_temperature"),
    path('ajax/get_valve', views.get_valve, name="get_valve"),
    path('ajax/verify_parameters', views.verify_parameters, name="verify_parameters"),
    path('ajax/get_tank_configuration', views.get_tank_configuration, name="get_tank_configuration"),
    path('ajax/set_tanks_configuration', views.set_tanks_configuration, name="set_tanks_configuration"),
    path('ajax/get_tanks_installations', views.get_tanks_installations, name='get_tanks_installations'),
    path('ajax/get_alerts', views.get_alerts, name="get_alerts"),
    path('ajax/reset_alert', views.reset_alert, name="reset_alert"),
    path('ajax/remove_alert_definition', views.remove_alert_definition, name="remove_alert_definition"),
    path('ajax/create_alert_definition', views.create_alert_definition, name="create_alert_definition")
]
