'use client';

import { useState } from 'react';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import MarkerPopover from '@components/map/marker-popover';
import DeviceMessageDialog from '@components/dialogs/device-message-dialog';
import { IoTDevice } from '@models/IoTDevice';
import { GROUP_BUSES } from '@configs/buses-config';

/**
 * Default MarkerPopover for devices without specific behavior.
 * Shows "Send message" button that opens the message dialog.
 */
const DefaultMarkerPopover = ({ device, closePopup }: { device: IoTDevice, closePopup: () => void }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen(!modalOpen);

    const buttonConfig = {
        text: 'Send message',
        icon: faPaperPlane,
        disabled: !device.connected,
        onClick: () => {
            closePopup();
            toggleModal();
        }
    };

    return (
        <>
            <MarkerPopover device={device} buttonConfig={buttonConfig} />
            <DeviceMessageDialog device={device} isOpen={modalOpen} onClose={toggleModal} />
        </>
    );
};

/**
 * Factory function that returns the appropriate MarkerPopover component
 * based on device group.
 *
 * @param device The IoT device.
 * @param closePopup Function to close the popup.
 *
 * @returns A fully configured MarkerPopover component for the device type
 */
export function createMarkerPopoverForDevice(device: IoTDevice, closePopup: () => void): JSX.Element {
    switch (device.group) {
        case GROUP_BUSES:
            return <DefaultMarkerPopover key={device.id} device={device} closePopup={closePopup} />;
        default:
            return <DefaultMarkerPopover key={device.id} device={device} closePopup={closePopup} />;
    }
}
