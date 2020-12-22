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

from django.urls import path

from . import views

urlpatterns = [
    path('', views.farms_map, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('history/', views.history, name='history'),
    path('schedule/', views.schedule, name='schedule'),
    path('ajax/get_farm_status', views.get_farm_status, name="get_farm_status"),
    path('ajax/set_tank_valve', views.set_tank_valve, name="set_tank_valve"),
    path('ajax/refill_tank', views.refill_tank, name="refill_tank"),
    path('ajax/set_condition', views.set_weather_condition, name="set_weather_condition"),
    path('ajax/get_condition', views.get_weather_condition, name="get_weather_condition"),
    path('ajax/set_factor', views.set_time_factor, name="set_time_factor"),
    path('ajax/get_factor', views.get_time_factor, name="get_time_factor"),
    path('ajax/get_time', views.get_time, name="get_time"),
    path('ajax/set_schedule', views.set_schedule, name="set_schedule"),
    path('ajax/get_schedule', views.get_schedule, name="get_schedule"),
    path('ajax/get_smart_farms', views.get_smart_farms, name='get_smart_farms'),
    path('ajax/get_stations', views.get_irrigation_stations, name='get_irrigation_stations'),
    path('ajax/set_valve', views.set_valve, name='set_valve'),
    path('ajax/get_wind', views.get_wind, name="get_wind"),
    path('ajax/get_rain', views.get_rain, name="get_rain"),
    path('ajax/get_radiation', views.get_radiation, name="get_radiation"),
    path('ajax/get_temperature', views.get_temperature, name="get_temperature"),
    path('ajax/get_moisture', views.get_moisture, name="get_moisture"),
    path('ajax/get_valve', views.get_valve, name="get_valve"),
    path('ajax/verify_parameters', views.verify_parameters, name="verify_parameters"),
    path('ajax/check_farm_connection_status', views.check_farm_connection_status, name="check_farm_connection_status")
]
