import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import MapComponent from '@components/map/map-component';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoTDevice } from '@models/IoTDevice';
import { resolveIcon } from '@utils/icon-utils';

// Register all icon packs for dynamic usage.
library.add(fas, far);

// Interface to exchange data using props.
interface Props {
    device: IoTDevice;
    isOpen: boolean;
    onClose: () => void;  // Function to close the modal
}

// Component definition.
const DeviceMapDialog = (props: Props) => {
    // Initialize variables from props.
    const {device, isOpen, onClose} = props;

    return (
        <Modal className="device-map-modal" isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>
                <span style={{color: device.route?.color || "" }}>
                    <FontAwesomeIcon icon={resolveIcon(device.faIcon) as any} fixedWidth />
                </span> Location of {device.name}
            </ModalHeader>
            <ModalBody>
                <MapComponent
                    devices={[device]}
                    routes={device.route ? [device.route] : []}
                    forceShowRoutes={true}
                    autoCenter={true}
                    allowSelection={false}
                    saveLocation={false}
                />
            </ModalBody>
        </Modal>
    )
};

export default DeviceMapDialog;