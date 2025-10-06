'use client';

import IconButton from '@components/widgets/icon-button';
import { INewFirmware } from '@customTypes/firmware-types';
import { VendorIdAndType } from '@customTypes/report-types';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { AppError } from '@models/AppError';
import { createCustomFirmware } from '@services/drm/firmware';
import { isValidFirmwareVersion, isValidUrl } from '@utils/string-utils';
import { showError, showSuccess } from '@utils/toast-utils';
import React from 'react';
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';

// Constants.
export const SIZE_LEFT_COLUMN = 3;
export const SIZE_RIGHT_COLUMN = 9;

// Properties interface.
interface Props {
    vendorsAndTypes: VendorIdAndType[];
    closeModal: () => void;
}

const NewFirmware = (props: Props) => {
    const { vendorsAndTypes, closeModal } = props;

    // Used to determine if the form is valid or not.
    const [formValid, setFormValid] = React.useState(false);

    // Used to show a spinner while creating the template.
    const [creatingFirmware, setCreatingFirmware] = React.useState(false);

    // Values.
    const [vendorId, setVendorId] = React.useState(0);
    const [deviceType, setDeviceType] = React.useState("");
    const [firmwareVersion, setFirmwareVersion] = React.useState("");
    const [cvss, setCvss] = React.useState("not-identified");
    const [releaseNotes, setReleaseNotes] = React.useState("");
    const [firmwareFile, setFirmwareFile] = React.useState<File>();

    // Used to validate fields.
    const [firmwareVersionValid, setFirmwareVersionValid] = React.useState(true);
    const [releaseNotesUrlValid, setReleaseNotesUrlValid] = React.useState(true);

    // Change the valid status when the value of any element changes.
    React.useEffect(() => {
        setFormValid(vendorId !== 0 && deviceType !== "" && firmwareVersion !== "" && isValidFirmwareVersion(firmwareVersion)
            && releaseNotes !== "" && isValidUrl(releaseNotes) && firmwareFile !== undefined);
    }, [vendorId, deviceType, firmwareVersion, releaseNotes, firmwareFile]);

    /**
     * Sets the vendor ID and type based on the given type.
     * 
     * @param type Selected device type.
     */
    const onTypeChange = (type: string) => {
        // Make sure the selected type exists.
        const vendorAndType = vendorsAndTypes.find(vt => vt.values.type === type);
        if (vendorAndType) {
            setDeviceType(vendorAndType.values.type);
            setVendorId(Number(vendorAndType.values.vendor_id));
        }
    };

    /**
     * Saves and validates the given firmware version.
     * 
     * @param version Entered firmware version.
     */
    const onFirmwareVersionChange = (version: string) => {
        setFirmwareVersion(version);
        // Validate the version.
        setFirmwareVersionValid(isValidFirmwareVersion(version));
    };

    /**
     * Saves and validates the given release notes URL.
     * 
     * @param version Entered release notes URL.
     */
    const onReleaseNotesChange = (url: string) => {
        setReleaseNotes(url);
        // Validate the URL.
        setReleaseNotesUrlValid(isValidUrl(url));
    };

    /**
     * Creates the custom firmware with the entered data.
     */
    const createFirmware = async () => {
        setCreatingFirmware(true);
        const newFirmware: INewFirmware = {
            vendor_id: vendorId,
            type: deviceType,
            firmware_version: firmwareVersion,
            information_link: releaseNotes,
            security_related: cvss,
            // @ts-ignore
            file: firmwareFile
        };
        try {
            await createCustomFirmware(newFirmware);
            showSuccess("Firmware created successfully");
            // If the firmware was created successfully, close the modal.
            closeModal();
        } catch (e) {
            showError((e as AppError).message);
        }
        setCreatingFirmware(false);
    };

    return (
        <>
            <Form>
                <FormGroup row>
                    <Label for="device-type" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The type of the devices for this firmware version" /> Device Type:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="device-type" type="select" onChange={e => onTypeChange(e.target.value)} value={deviceType}>
                            <option value="" disabled>Select a device type...</option>
                            {vendorsAndTypes.map(vt => (
                                <option key={vt.values.type} value={vt.values.type}>{vt.values.type}</option>
                            ))}
                        </Input>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="firmware-version" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The 4-part firmware version (X.X.X.X)" /> Firmware version:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="firmware-version" placeholder="Enter the firmware version..." value={firmwareVersion} onChange={e => onFirmwareVersionChange(e.target.value)} maxLength={15} invalid={!firmwareVersionValid} />
                        <FormFeedback>Invalid firmware version, it must be X.X.X.X</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="cvss" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The Common Vulnerability Scoring System (CVSS) score of the highest security related bug in the firmware" /> CVSS:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="cvss" type="select" value={cvss} onChange={e => setCvss(e.target.value)}>
                            <option value="none">Contains no security fixes</option>
                            <option value="low">Contains security fixes rated low</option>
                            <option value="medium">Contains security fixes rated medium</option>
                            <option value="high">Contains security fixes rated high</option>
                            <option value="critical">Contains security fixes rated critical</option>
                            <option value="not-identified">Security fixes have not been identified</option>
                        </Input>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="release-notes" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The firmware release notes" /> Release notes:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="release-notes" placeholder="Enter the release notes URL..." value={releaseNotes} onChange={e => onReleaseNotesChange(e.target.value)} maxLength={512} invalid={!releaseNotesUrlValid} />
                        <FormFeedback>Invalid release notes URL</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="firmware-file" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The file system ZIP file" /> Binary file:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="firmware-file" type="file" onChange={e => setFirmwareFile(e.target.files ? e.target.files[0] : undefined)} />
                    </Col>
                </FormGroup>
            </Form>
            <div className="new-template-btn-container">
                <Button color="primary" onClick={createFirmware} disabled={!formValid || creatingFirmware}>
                    {creatingFirmware ? "Creating..." : "Create"}
                </Button>
            </div>
        </>
    );
};

export default NewFirmware;