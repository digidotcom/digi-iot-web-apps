import { DeviceGroupConfig } from '@customTypes/device-types';
import { GROUP_BUSES, BUS_FA_ICON, GROUP_BUSES_DISPLAY_NAME, GROUP_BUSES_COLOR } from './buses-config';

/**
 * Configuration defining the metadata of all the application groups.
 */
export const DEVICE_GROUPS_CONFIG: DeviceGroupConfig[] = [
    {
        id: GROUP_BUSES,
        name: GROUP_BUSES_DISPLAY_NAME,
        icon: BUS_FA_ICON,
        color: GROUP_BUSES_COLOR
    },
];

/**
 * Helper function to get group configuration by ID.
 *
 * @param groupId The ID of the group to get.
 *
 * @returns The group configuration with the given ID, undefined if not found.
 */
export function getGroupConfig(groupId: string): DeviceGroupConfig | undefined {
    return DEVICE_GROUPS_CONFIG.find(g => g.id === groupId);
}
