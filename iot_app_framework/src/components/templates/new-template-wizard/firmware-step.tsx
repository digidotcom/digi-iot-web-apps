'use client';

import { SIZE_LEFT_COLUMN, SIZE_RIGHT_COLUMN } from '@components/templates/new-template-wizard/new-template-wizard';
import IconButton from '@components/widgets/icon-button';
import { IFirmware } from '@customTypes/firmware-types';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { AppError } from '@models/AppError';
import { getCustomFirmware } from '@services/drm/firmware';
import { toHexString } from '@utils/string-utils';
import { showError, showWarning } from '@utils/toast-utils';
import React, { Ref } from 'react';
import { Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';

// Properties interface.
interface Props {
    setValid: (valid: boolean) => void;
    visible: boolean;
    vendorId: number;
    deviceType: string;
}

// Interface with the methods exposed to the parent component.
export interface FirmwareStepRef {
    getFirmwareVersion: () => string;
}

const FirmwareStep = React.forwardRef((props: Props, ref: Ref<FirmwareStepRef>) => {
    const { setValid, visible, vendorId, deviceType } = props;

    // State values.
    const [firmwareVersion, setFirmwareVersion] = React.useState("");

    // Used to store the list of firmware versions.
    const [firmwareVersions, setFirmwareVersions] = React.useState<IFirmware[]>([]);

    // Used to show a 'Loading' text while the firmware versions are fetched.
    const [loadingFirmware, setLoadingFirmware] = React.useState(false);

    // Used to store the complete object of the selected firmware version.
    const [selectedFirmware, setSelectedFirmware] = React.useState<IFirmware>();

    // Change the valid status when the selected firmware version changes.
    React.useEffect(() => {
        if (visible) {
            setValid(firmwareVersion !== "");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmwareVersion, visible]);

    // Fetch the firmware versions when the selected vendor ID and type change.
    React.useEffect(() => {
        const fetchFirmware = async () => {
            setLoadingFirmware(true);
            try {
                const availableFirmware = await getCustomFirmware([{ vendorId, deviceType }]);
                setFirmwareVersions(availableFirmware);
                // If no firmware is found, show a warning.
                if (availableFirmware.length == 0) {
                    showWarning("To create a template for this device type, you need to add a custom firmware first");
                }
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingFirmware(false);
        };
        if (vendorId != 0 && deviceType !== "") {
            fetchFirmware();
        }
        setFirmwareVersion("");
        setSelectedFirmware(undefined);
    }, [vendorId, deviceType]);

    /**
     * Sets the firmware version based on the given version.
     * 
     * @param version Selected firmware version.
     */
    const onVersionSelected = (version: string) => {
        // Make sure the selected version exists.
        const fw = firmwareVersions.find(v => v.firmware_version === version);
        if (fw) {
            setFirmwareVersion(fw.firmware_version);
            setSelectedFirmware(fw);
        }
    };

    // Export the following function so that it can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        getFirmwareVersion() {
            return firmwareVersion;
        }
    }));

    return (
        <>
            <Form>
                <FormGroup row>
                    <Label for="version" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The version of the firmware" /> Firmware version:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="version" type="select" onChange={e => onVersionSelected(e.target.value)} value={firmwareVersion} disabled={loadingFirmware}>
                            <option value="" disabled>{loadingFirmware ? "Loading..." : "Select a firmware version..."}</option>
                            {firmwareVersions.map(fw => (
                                <option key={fw.id} value={fw.firmware_version}>{fw.firmware_version}</option>
                            ))}
                        </Input>
                    </Col>
                </FormGroup>
                <FormGroup row style={{display: firmwareVersion !== "" ? "" : "none"}}>
                    <Label sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="Details of the selected firmware version" /> Firmware details:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Container>
                            <Row className="selected-fw-container">
                                <Col className="selected-fw-col">
                                    <span>Vendor ID: <strong>{toHexString(selectedFirmware?.vendor_id ?? 0)}</strong></span>
                                    <span>Device type: <strong>{selectedFirmware?.type}</strong></span>
                                    <span>Firmware version: <strong>{selectedFirmware?.firmware_version}</strong></span>
                                </Col>
                                <Col className="selected-fw-col">
                                    <span>Release notes: <a href={selectedFirmware?.information_link} target="_blank">View</a></span>
                                    <span>File size: <strong>{selectedFirmware?.file_size} bytes</strong></span>
                                    <span>Updated at: <strong>{new Date(selectedFirmware?.update_time ?? 0).toLocaleString()}</strong></span>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </FormGroup>
            </Form>
        </>
    );
});

FirmwareStep.displayName = "FirmwareStep";

export default FirmwareStep;