'use client';

import { useState, useRef } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { MESSAGE_REQUEST_SRC, MESSAGE_REQUEST_TARGET } from '@configs/app-config';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch, fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoTDevice } from '@models/IoTDevice';
import SCI from '@services/drm/sci/sci';
import { resolveIcon } from '@utils/icon-utils';
import { showError, showSuccess } from '@utils/toast-utils';

// Register all icon packs for dynamic usage
library.add(fas, far);

// Interface to exchange data using props.
interface Props {
    device: IoTDevice;
    isOpen: boolean;
    onClose: () => void;  // Function to close the modal
}

// Component definition.
const DeviceMessageDialog = (props: Props) => {
    // Initialize variables from props.
    const {device, isOpen, onClose} = props;

    // Declare message property with its set method and initial value as empty.
    const [message, setMessage] = useState("");

    // Declare sending message property with its set method and initial value as false.
    const [sendingMessage, setSendingMessage] = useState(false);

    // Input reference for the message.
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * When the modal is opened, reset the state and focus the input control.
     */
    const onModalOpened = () => {
        setMessage("");
        inputRef.current?.focus();
    };

    /**
     * Sends the given message to the configured device using a SCI device request.
     * 
     * @param msg Message to send.
     */
    const sendMessage = async (msg: string) => {
        setSendingMessage(true);
        // Send the message using SCI.
        const sci = new SCI();
        const devs = await sci.deviceRequests(device.id, [{ payload: msg, targetName: MESSAGE_REQUEST_TARGET }], MESSAGE_REQUEST_SRC);
        setSendingMessage(false);
        // Parse the SCI response.
        if (devs.length > 0) {
            const dev = devs.at(0);
            var error;
            if (dev.error) {
                error = dev.error.desc;
            } else if (dev.requests?.device_request?.["@status"] == "1") {
                error = dev.requests.device_request._;
            } else if (dev.requests?.device_request?._) {
                const json = JSON.parse(dev.requests.device_request._);
                if (json.status == "1") {
                    error = json.msg;
                }
            }
            if (error) {
                showError(`Could not send message: ${error}`);
                return;
            }
        }
        showSuccess("Message sent successfully")
        onClose();
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose} onOpened={onModalOpened}>
            <ModalHeader toggle={onClose}>
                <span style={{color: device.route?.color || "" }}>
                    <FontAwesomeIcon icon={resolveIcon(device.faIcon) as any} fixedWidth />
                </span> Change message of {device.name}
            </ModalHeader>
            <ModalBody>
                <p>New message:</p>
                <Input value={message} placeholder="Enter message to send..." innerRef={inputRef} onChange={e => setMessage(e.target.value)} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={sendingMessage || message.length == 0} onClick={() => sendMessage(message)}>
                    {sendingMessage && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
                    <span>{sendingMessage ? "Sending..." : "Send"}</span>
                </Button>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default DeviceMessageDialog;