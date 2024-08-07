/*
 * Copyright (C) 2022-2024, Digi International Inc.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
class CCMP157 extends ConnectCoreDevice {

    // Public constants.
    static DEVICE_TYPE = "ccmp157-dvk";
    static PLATFORM_NAME = "ConnectCore MP157";

    // Variables.
    BOARD_IMAGE = "ccmp157_board.png";
    BOARD_IMAGE_SCALE = 82;

    CPU_COMPONENT_VISIBLE = true;
    CPU_COMPONENT_HAS_PANEL = true;
    CPU_COMPONENT_HAS_ARROW = true;
    CPU_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    CPU_COMPONENT_PANEL_ORIENTATION = VALUE_RIGHT;
    CPU_COMPONENT_PANEL_HORIZONTAL_PERCENT = 68.5;
    CPU_COMPONENT_PANEL_VERTICAL_PERCENT = 45;
    CPU_COMPONENT_ARROW_PERCENT = 54.5;
    CPU_COMPONENT_AREA_TOP_PERCENT = 50;
    CPU_COMPONENT_AREA_LEFT_PERCENT = 32.9;
    CPU_COMPONENT_AREA_WIDTH_PERCENT = 10;
    CPU_COMPONENT_AREA_HEIGHT_PERCENT = 13;

    MEMORY_COMPONENT_VISIBLE = true;
    MEMORY_COMPONENT_HAS_PANEL = true;
    MEMORY_COMPONENT_HAS_ARROW = true;
    MEMORY_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    MEMORY_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    MEMORY_COMPONENT_PANEL_HORIZONTAL_PERCENT = 25;
    MEMORY_COMPONENT_PANEL_VERTICAL_PERCENT = 67.5;
    MEMORY_COMPONENT_ARROW_PERCENT = 37;
    MEMORY_COMPONENT_AREA_TOP_PERCENT = 34.5;
    MEMORY_COMPONENT_AREA_LEFT_PERCENT = 31.1;
    MEMORY_COMPONENT_AREA_WIDTH_PERCENT = 15.4;
    MEMORY_COMPONENT_AREA_HEIGHT_PERCENT = 15.5;

    WIFI_BT_COMPONENT_VISIBLE = true;
    WIFI_BT_COMPONENT_HAS_PANEL = true;
    WIFI_BT_COMPONENT_HAS_ARROW = true;
    WIFI_BT_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    WIFI_BT_COMPONENT_PANEL_ORIENTATION = VALUE_LEFT;
    WIFI_BT_COMPONENT_PANEL_HORIZONTAL_PERCENT = 55;
    WIFI_BT_COMPONENT_PANEL_VERTICAL_PERCENT = 28;
    WIFI_BT_COMPONENT_ARROW_PERCENT = 43.5;
    WIFI_BT_COMPONENT_AREA_TOP_PERCENT = 41;
    WIFI_BT_COMPONENT_AREA_LEFT_PERCENT = 46.7;
    WIFI_BT_COMPONENT_AREA_WIDTH_PERCENT = 6.8;
    WIFI_BT_COMPONENT_AREA_HEIGHT_PERCENT = 9;

    ETHERNET0_COMPONENT_VISIBLE = true;
    ETHERNET0_COMPONENT_HAS_PANEL = true;
    ETHERNET0_COMPONENT_HAS_ARROW = true;
    ETHERNET0_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    ETHERNET0_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    ETHERNET0_COMPONENT_PANEL_HORIZONTAL_PERCENT = -3;
    ETHERNET0_COMPONENT_PANEL_VERTICAL_PERCENT = 73;
    ETHERNET0_COMPONENT_ARROW_PERCENT = 8;
    ETHERNET0_COMPONENT_AREA_TOP_PERCENT = 29;
    ETHERNET0_COMPONENT_AREA_LEFT_PERCENT = 3.8;
    ETHERNET0_COMPONENT_AREA_WIDTH_PERCENT = 12.2;
    ETHERNET0_COMPONENT_AREA_HEIGHT_PERCENT = 12.5;

    CONSOLE_COMPONENT_VISIBLE = true;
    CONSOLE_COMPONENT_HAS_PANEL = false;
    CONSOLE_COMPONENT_HAS_ARROW = false;
    CONSOLE_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    CONSOLE_COMPONENT_AREA_TOP_PERCENT = 79.9;
    CONSOLE_COMPONENT_AREA_LEFT_PERCENT = 90.5;
    CONSOLE_COMPONENT_AREA_WIDTH_PERCENT = 3.3;
    CONSOLE_COMPONENT_AREA_HEIGHT_PERCENT = 6.2;

    VIDEO_COMPONENT_VISIBLE = true;
    VIDEO_COMPONENT_HAS_PANEL = true;
    VIDEO_COMPONENT_HAS_ARROW = true;
    VIDEO_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    VIDEO_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    VIDEO_COMPONENT_PANEL_HORIZONTAL_PERCENT = 55;
    VIDEO_COMPONENT_PANEL_VERTICAL_PERCENT = 16;
    VIDEO_COMPONENT_ARROW_PERCENT = 72.8;
    VIDEO_COMPONENT_AREA_TOP_PERCENT = 4.8;
    VIDEO_COMPONENT_AREA_LEFT_PERCENT = 70.2;
    VIDEO_COMPONENT_AREA_WIDTH_PERCENT = 8.6;
    VIDEO_COMPONENT_AREA_HEIGHT_PERCENT = 9.1;

    AUDIO_COMPONENT_VISIBLE = true;
    AUDIO_COMPONENT_HAS_PANEL = true;
    AUDIO_COMPONENT_HAS_ARROW = true;
    AUDIO_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    AUDIO_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    AUDIO_COMPONENT_PANEL_HORIZONTAL_PERCENT = 81;
    AUDIO_COMPONENT_PANEL_VERTICAL_PERCENT = 37;
    AUDIO_COMPONENT_ARROW_PERCENT = 87;
    AUDIO_COMPONENT_AREA_TOP_PERCENT = 28;
    AUDIO_COMPONENT_AREA_LEFT_PERCENT = 83.5;
    AUDIO_COMPONENT_AREA_WIDTH_PERCENT = 10.2;
    AUDIO_COMPONENT_AREA_HEIGHT_PERCENT = 7;

    LED_COMPONENT_VISIBLE = true;
    LED_COMPONENT_HAS_PANEL = true;
    LED_COMPONENT_HAS_ARROW = false;
    LED_COMPONENT_PANEL_ALWAYS_VISIBLE = true;
    LED_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    LED_COMPONENT_PANEL_HORIZONTAL_PERCENT = 69;
    LED_COMPONENT_PANEL_VERTICAL_PERCENT = 10;
    LED_COMPONENT_AREA_TOP_PERCENT = 91;
    LED_COMPONENT_AREA_LEFT_PERCENT = 70.6;
    LED_COMPONENT_AREA_WIDTH_PERCENT = 1.8;
    LED_COMPONENT_AREA_HEIGHT_PERCENT = 4;

    FLASH_MEMORY_COMPONENT_VISIBLE = true;
    FLASH_MEMORY_COMPONENT_HAS_PANEL = true;
    FLASH_MEMORY_COMPONENT_HAS_ARROW = true;
    FLASH_MEMORY_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    FLASH_MEMORY_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    FLASH_MEMORY_COMPONENT_PANEL_HORIZONTAL_PERCENT = 27;
    FLASH_MEMORY_COMPONENT_PANEL_VERTICAL_PERCENT = 65;
    FLASH_MEMORY_COMPONENT_ARROW_PERCENT = 46.7;
    FLASH_MEMORY_COMPONENT_AREA_TOP_PERCENT = 50;
    FLASH_MEMORY_COMPONENT_AREA_LEFT_PERCENT = 43.5;
    FLASH_MEMORY_COMPONENT_AREA_WIDTH_PERCENT = 10;
    FLASH_MEMORY_COMPONENT_AREA_HEIGHT_PERCENT = 13;


    // Capabilities
    SUPPORTS_VIDEO_BRIGHTNESS = false;
    SUPPORTS_NUM_ETHERNET = 1;

    // Misc info
    PCB_COLOR = ID_COLOR_BLUE;

    // Constructor.
    constructor(deviceID, deviceData) {
        super(CCMP157.DEVICE_TYPE, CCMP157.PLATFORM_NAME, deviceID, deviceData);
    }
}
