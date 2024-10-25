/*
 * Copyright (C) 2024, Digi International Inc.
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
class CCIMX91 extends ConnectCoreDevice {

    // Public constants.
    static DEVICE_TYPE = "ccimx91-dvk";
    static PLATFORM_NAME = "ConnectCore 91 DVK";

    // Variables.
    BOARD_IMAGE = "ccimx93-dvk_board.png";
    BOARD_IMAGE_SCALE = 85;

    CPU_COMPONENT_VISIBLE = true;
    CPU_COMPONENT_HAS_PANEL = true;    
    CPU_COMPONENT_HAS_ARROW = true;
    CPU_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    CPU_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    CPU_COMPONENT_PANEL_HORIZONTAL_PERCENT = 33.5;
    CPU_COMPONENT_PANEL_VERTICAL_PERCENT = 55;
    CPU_COMPONENT_ARROW_PERCENT = 39.4;
    CPU_COMPONENT_AREA_TOP_PERCENT = 44.9;
    CPU_COMPONENT_AREA_LEFT_PERCENT = 38.6;
    CPU_COMPONENT_AREA_WIDTH_PERCENT = 4.8;
    CPU_COMPONENT_AREA_HEIGHT_PERCENT = 7.8;

    MEMORY_COMPONENT_VISIBLE = true;
    MEMORY_COMPONENT_HAS_PANEL = true; 
    MEMORY_COMPONENT_HAS_ARROW = true;
    MEMORY_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    MEMORY_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    MEMORY_COMPONENT_PANEL_HORIZONTAL_PERCENT = 34;
    MEMORY_COMPONENT_PANEL_VERTICAL_PERCENT = 67.5;
    MEMORY_COMPONENT_ARROW_PERCENT = 39.4;
    MEMORY_COMPONENT_AREA_TOP_PERCENT = 35.1;
    MEMORY_COMPONENT_AREA_LEFT_PERCENT = 38.2;
    MEMORY_COMPONENT_AREA_WIDTH_PERCENT = 6;
    MEMORY_COMPONENT_AREA_HEIGHT_PERCENT = 7;

    WIFI_BT_COMPONENT_VISIBLE = true;
    WIFI_BT_COMPONENT_HAS_PANEL = true; 
    WIFI_BT_COMPONENT_HAS_ARROW = true;
    WIFI_BT_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    WIFI_BT_COMPONENT_PANEL_ORIENTATION = VALUE_RIGHT;
    WIFI_BT_COMPONENT_PANEL_HORIZONTAL_PERCENT = 68.6;
    WIFI_BT_COMPONENT_PANEL_VERTICAL_PERCENT = 36;
    WIFI_BT_COMPONENT_ARROW_PERCENT = 44.5;
    WIFI_BT_COMPONENT_AREA_TOP_PERCENT = 43.5;
    WIFI_BT_COMPONENT_AREA_LEFT_PERCENT = 32.9;
    WIFI_BT_COMPONENT_AREA_WIDTH_PERCENT = 3.8;
    WIFI_BT_COMPONENT_AREA_HEIGHT_PERCENT = 6.7;

    ETHERNET0_COMPONENT_VISIBLE = true;
    ETHERNET0_COMPONENT_HAS_PANEL = true;
    ETHERNET0_COMPONENT_HAS_ARROW = true;
    ETHERNET0_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    ETHERNET0_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    ETHERNET0_COMPONENT_PANEL_HORIZONTAL_PERCENT = 0;
    ETHERNET0_COMPONENT_PANEL_VERTICAL_PERCENT = 24.5;
    ETHERNET0_COMPONENT_ARROW_PERCENT = 12;
    ETHERNET0_COMPONENT_AREA_TOP_PERCENT = 77.5;
    ETHERNET0_COMPONENT_AREA_LEFT_PERCENT = 10;
    ETHERNET0_COMPONENT_AREA_WIDTH_PERCENT = 7.2;
    ETHERNET0_COMPONENT_AREA_HEIGHT_PERCENT = 14.5;

    ETHERNET1_COMPONENT_VISIBLE = true;
    ETHERNET1_COMPONENT_HAS_PANEL = true;
    ETHERNET1_COMPONENT_HAS_ARROW = true;
    ETHERNET1_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    ETHERNET1_COMPONENT_PANEL_ORIENTATION = VALUE_LEFT;
    ETHERNET1_COMPONENT_PANEL_HORIZONTAL_PERCENT = 27.3;
    ETHERNET1_COMPONENT_PANEL_VERTICAL_PERCENT = 74;
    ETHERNET1_COMPONENT_ARROW_PERCENT = 82;
    ETHERNET1_COMPONENT_AREA_TOP_PERCENT = 77.5;
    ETHERNET1_COMPONENT_AREA_LEFT_PERCENT = 19;
    ETHERNET1_COMPONENT_AREA_WIDTH_PERCENT = 7.2;
    ETHERNET1_COMPONENT_AREA_HEIGHT_PERCENT = 14.5;

    CONSOLE_COMPONENT_VISIBLE = true;
    CONSOLE_COMPONENT_HAS_PANEL = false; 
    CONSOLE_COMPONENT_HAS_ARROW = false;
    CONSOLE_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    CONSOLE_COMPONENT_AREA_TOP_PERCENT = 7.1;
    CONSOLE_COMPONENT_AREA_LEFT_PERCENT = 25.4;
    CONSOLE_COMPONENT_AREA_WIDTH_PERCENT = 4;
    CONSOLE_COMPONENT_AREA_HEIGHT_PERCENT = 6;

    VIDEO_COMPONENT_VISIBLE = false;
    VIDEO_COMPONENT_HAS_PANEL = true; 
    VIDEO_COMPONENT_HAS_ARROW = true;
    VIDEO_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    VIDEO_COMPONENT_PANEL_ORIENTATION = VALUE_BOTTOM;
    VIDEO_COMPONENT_PANEL_HORIZONTAL_PERCENT = 55;
    VIDEO_COMPONENT_PANEL_VERTICAL_PERCENT = 19.5;
    VIDEO_COMPONENT_ARROW_PERCENT = 59.8;
    VIDEO_COMPONENT_AREA_TOP_PERCENT = 82.7;
    VIDEO_COMPONENT_AREA_LEFT_PERCENT = 58.3;
    VIDEO_COMPONENT_AREA_WIDTH_PERCENT = 6.5;
    VIDEO_COMPONENT_AREA_HEIGHT_PERCENT = 8.4;

    AUDIO_COMPONENT_VISIBLE = true;
    AUDIO_COMPONENT_HAS_PANEL = true; 
    AUDIO_COMPONENT_HAS_ARROW = true;
    AUDIO_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    AUDIO_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    AUDIO_COMPONENT_PANEL_HORIZONTAL_PERCENT = 0;
    AUDIO_COMPONENT_PANEL_VERTICAL_PERCENT = 22;
    AUDIO_COMPONENT_ARROW_PERCENT = 16.5;
    AUDIO_COMPONENT_AREA_TOP_PERCENT = 7.1;
    AUDIO_COMPONENT_AREA_LEFT_PERCENT = 16;
    AUDIO_COMPONENT_AREA_WIDTH_PERCENT = 4;
    AUDIO_COMPONENT_AREA_HEIGHT_PERCENT = 12.5;

    LED_COMPONENT_VISIBLE = true;
    LED_COMPONENT_HAS_PANEL = true; 
    LED_COMPONENT_HAS_ARROW = false;
    LED_COMPONENT_PANEL_ALWAYS_VISIBLE = true;
    LED_COMPONENT_PANEL_ORIENTATION = VALUE_TOP;
    LED_COMPONENT_PANEL_HORIZONTAL_PERCENT = 62;
    LED_COMPONENT_PANEL_VERTICAL_PERCENT = 16.5;
    LED_COMPONENT_AREA_TOP_PERCENT = 13.6;
    LED_COMPONENT_AREA_LEFT_PERCENT = 63.3;
    LED_COMPONENT_AREA_WIDTH_PERCENT = 2.2;
    LED_COMPONENT_AREA_HEIGHT_PERCENT = 2.2;

    FLASH_MEMORY_COMPONENT_VISIBLE = true;
    FLASH_MEMORY_COMPONENT_HAS_PANEL = true;
    FLASH_MEMORY_COMPONENT_HAS_ARROW = true;
    FLASH_MEMORY_COMPONENT_PANEL_ALWAYS_VISIBLE = false;
    FLASH_MEMORY_COMPONENT_PANEL_ORIENTATION = VALUE_LEFT;
    FLASH_MEMORY_COMPONENT_PANEL_HORIZONTAL_PERCENT = 52;
    FLASH_MEMORY_COMPONENT_PANEL_VERTICAL_PERCENT = 33;
    FLASH_MEMORY_COMPONENT_ARROW_PERCENT = 36;
    FLASH_MEMORY_COMPONENT_AREA_TOP_PERCENT = 35.1;
    FLASH_MEMORY_COMPONENT_AREA_LEFT_PERCENT = 44.7;
    FLASH_MEMORY_COMPONENT_AREA_WIDTH_PERCENT = 5.8;
    FLASH_MEMORY_COMPONENT_AREA_HEIGHT_PERCENT = 8;


    // Capabilities
    SUPPORTS_VIDEO_BRIGHTNESS = false;
    SUPPORTS_NUM_ETHERNET = 2;

    // Misc info
    PCB_COLOR = ID_COLOR_BLUE;

    // Constructor.
    constructor(deviceID, deviceData) {
        super(CCIMX91.DEVICE_TYPE, CCIMX91.PLATFORM_NAME, deviceID, deviceData);
    }
}