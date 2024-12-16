'use client';

import { useState } from 'react';
import { Button } from "reactstrap";

import DeviceMessageDialog from '@components/dialogs/device-message-dialog';
import { far } from '@fortawesome/free-regular-svg-icons';
import { faPaperPlane, fas, faSquare } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoTDevice } from '@models/IoTDevice';
import { resolveIcon } from '@utils/icon-utils';

// Register all icon packs for dynamic usage
library.add(fas, far);

// Interface to exchange data using props.
interface Props {
    device: IoTDevice;
    closePopup: () => void;
}

// Component definition.
const MarkerPopover = ({device, closePopup}: Props) => {
    // Track the message dialog modal open status value.
    const [modalOpen, setModalOpen] = useState(false);

    // Function to toggle the visibility of the device message dialog modal.
    const toggleModal = () => setModalOpen(!modalOpen);

    return (
        <div key={device.id}>
            <FontAwesomeIcon icon={resolveIcon(device.faIcon) as any} fixedWidth />
            <strong>{device.name}</strong>{device.maintenance && " (in maintenance)"}<br/>
            {device.route && <div><FontAwesomeIcon icon={faSquare} color={device.route.color} fixedWidth /> <strong>Route {device.route.id}</strong> ({device.route.name})</div>}
            <hr className="marker-popover-separator" />
            {
                device.properties && device.properties.map(property => (
                    <div key={property.id}>
                        <FontAwesomeIcon icon={resolveIcon(property.faIcon) as any} fixedWidth />
                        {` ${property.name}:`} <strong>{property.value ? `${property.value} ${property.units ?? ""}` : "-"}</strong><br/>
                    </div>
                ))
            }
            <hr className="marker-popover-separator" />
            Device ID: {device.id.substring(18)}<br/>
            Last update: {device.lastUpdate?.toLocaleString()}<br/><br/>
            <Button color="primary" style={{ width: "100%" }} disabled={!device.connected} onClick={() => {
                toggleModal();
                closePopup();
            }}>
                <FontAwesomeIcon icon={faPaperPlane} fixedWidth /> Send message
            </Button>
            <DeviceMessageDialog device={device} isOpen={modalOpen} onClose={toggleModal} />
        </div>
    );
};

export default MarkerPopover;