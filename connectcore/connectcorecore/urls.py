# Copyright 2022, 2023, Digi International Inc.
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
    path('', views.devices, name='index'),
    path('devices/', views.devices, name='devices'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('network/', views.network, name='network'),
    path('management/', views.management, name='management'),
    path('history/', views.history, name='history'),
    path('ajax/register_device', views.register_device, name="register_device"),
    path('ajax/get_device_status', views.get_device_status, name="get_device_status"),
    path('ajax/get_devices', views.get_devices, name='get_devices'),
    path('ajax/get_device_info', views.get_device_info, name="get_device_info"),
    path('ajax/play_music', views.play_music, name='play_music'),
    path('ajax/set_audio_volume', views.set_audio_volume, name='set_audio_volume'),
    path('ajax/set_video_brightness', views.set_video_brightness, name='set_video_brightness'),
    path('ajax/set_led_value', views.set_led_value, name='set_led_value'),
    path('ajax/cli_init_session', views.cli_init_session, name="cli_init_session"),
    path('ajax/cli_data', views.cli_data, name="cli_data"),
    path('ajax/cli_terminate_session', views.cli_terminate_session, name="cli_terminate_session"),
    path('ajax/fs_list_directory', views.fs_list_directory, name="fs_list_directory"),
    path('ajax/fs_remove_file', views.fs_remove_file, name="fs_remove_file"),
    path('ajax/fs_upload_file', views.fs_upload_file, name="fs_upload_file"),
    path('ajax/fs_download_file', views.fs_download_file, name="fs_download_file"),
    path('ajax/fs_create_dir', views.fs_create_dir, name="fs_create_dir"),
    path('ajax/history_temperature', views.history_temperature, name="history_temperature"),
    path('ajax/history_cpu', views.history_cpu, name="history_cpu"),
    path('ajax/history_memory', views.history_memory, name="history_memory"),
    path('ajax/reboot_device', views.reboot_device, name="reboot_device"),
    path('ajax/upload_firmware', views.upload_firmware, name="upload_firmware"),
    path('ajax/upload_firmware_to_fileset', views.upload_firmware_to_fileset, name="upload_firmware_to_fileset"),
    path('ajax/update_firmware', views.update_firmware, name="update_firmware"),
    path('ajax/update_firmware_from_fileset', views.update_firmware_from_fileset, name="update_firmware_from_fileset"),
    path('ajax/cancel_firmware_update', views.cancel_firmware_update, name="cancel_firmware_update"),
    path('ajax/check_firmware_update_running', views.check_firmware_update_running, name="check_firmware_update_running"),
    path('ajax/check_firmware_update_status', views.check_firmware_update_status, name="check_firmware_update_status"),
    path('ajax/check_firmware_update_progress', views.check_firmware_update_progress, name="check_firmware_update_progress"),
    path('ajax/list_repo_files', views.list_repo_files, name="list_repo_files"),
    path('ajax/list_fileset_files', views.list_fileset_files, name="list_fileset_files"),
    path('ajax/get_config', views.get_config, name="get_config"),
    path('ajax/set_config', views.set_config, name="set_config"),
    path('ajax/get_sample_rate', views.get_sample_rate, name="get_sample_rate"),
    path('ajax/set_sample_rate', views.set_sample_rate, name="set_sample_rate"),
    path('ajax/get_data_usage', views.get_data_usage, name="get_data_usage"),
    path('ajax/verify_parameters', views.verify_parameters, name="verify_parameters"),
    path('ajax/check_device_connection_status', views.check_device_connection_status,
         name="check_device_connection_status")
]
