'use client';

import DeviceMapDialog from '@components/dialogs/device-map-dialog';
import DeviceMessageDialog from '@components/dialogs/device-message-dialog';
import IconButton from '@components/widgets/icon-button';
import { ColorStyles } from '@configs/style-constants';
import { faCommentDots, faCompass } from '@fortawesome/free-regular-svg-icons';
import { Bus } from '@models/Bus';
import React, { SyntheticEvent } from 'react';

// Properties interface.
interface Props {
    bus: Bus;
}

const BusActions = (props: Props) => {
    const { bus } = props;

    // Declare is message dialog open property with its set method and initial value as false.
    const [isMessageDialogOpen, setMessageDialogOpen] = React.useState(false);

    // Declare is map dialog open property with its set method and initial value as false.
    const [isMapDialogOpen, setMapDialogOpen] = React.useState(false);

    // Method to toggle map dialog visibility
    const toggleBusMapDialog = () => {
        setMapDialogOpen(prevState => !prevState);
    };

    // Method to toggle message dialog visibility
    const toggleBusMessageDialog = () => {
        setMessageDialogOpen(prevState => !prevState);
    };

    // Method called when the Map button is pressed.
    const onMapClicked = (e?: SyntheticEvent) => {
        e?.stopPropagation(); // Prevent event from bubbling up to <tr> to avoid 'onSelectionChanged'.

        // Open the dialog.
        toggleBusMapDialog();
    };

    // Method called when the Message button is pressed.
    const onMessageClicked = (e?: SyntheticEvent) => {
        e?.stopPropagation(); // Prevent event from bubbling up to <tr> to avoid 'onSelectionChanged'.

        // Open the dialog.
        toggleBusMessageDialog();
    };

    return (
        <>
            <span style={{marginRight: "10px"}}>
                <IconButton icon={faCompass} title="Show bus location" onClick={onMapClicked} color={ColorStyles.actionButton} size="lg" />
            </span>
            <span>
                <IconButton icon={faCommentDots} title="Send message" onClick={onMessageClicked} color={ColorStyles.actionButton} size="lg" enabled={bus.connected} />
            </span>
            <DeviceMessageDialog device={bus} isOpen={isMessageDialogOpen} onClose={toggleBusMessageDialog} />
            <DeviceMapDialog device={bus} isOpen={isMapDialogOpen} onClose={toggleBusMapDialog} />
        </>
    );
};

export default BusActions;