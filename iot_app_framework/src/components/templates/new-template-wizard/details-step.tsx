'use client';

import { SIZE_LEFT_COLUMN, SIZE_RIGHT_COLUMN } from '@components/templates/new-template-wizard/new-template-wizard';
import IconButton from '@components/widgets/icon-button';
import { GROUP_BUSES } from '@configs/buses-config';
import { VendorIdAndType } from '@customTypes/report-types';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { AppError } from '@models/AppError';
import { getVendorIdAndType } from '@services/drm/reports';
import { showError } from '@utils/toast-utils';
import React, { Ref } from 'react';
import { Col, Form, FormGroup, Input, Label } from 'reactstrap';

// Properties interface.
interface Props {
    setValid: (valid: boolean) => void;
    visible: boolean;
}

// Interface with the methods exposed to the parent component.
export interface DetailsStepRef {
    getName: () => string;
    getDescription: () => string;
    getGroup: () => string;
    getVendorId: () => number;
    getDeviceType: () => string;
    getMaintWindow: () => string;
}

const DetailsStep = React.forwardRef((props: Props, ref: Ref<DetailsStepRef>) => {
    const { setValid, visible } = props;

    // State values.
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [vendorId, setVendorId] = React.useState(0);
    const [deviceType, setDeviceType] = React.useState("");
    const [maintWindow, setMaintWindow] = React.useState("Cancel");

    // Used to store the list of vendor IDs and types.
    const [vendorsAndTypes, setVendorsAndTypes] = React.useState<VendorIdAndType[]>([]);

    // Used to show a 'Loading' text while the vendor IDs and types are fetched.
    const [loadingTypes, setLoadingTypes] = React.useState(false);

    // Fetch the list of vendor IDs and types when the component loads.
    React.useEffect(() => {
        const fetchVendorsAndTypes = async () => {
            // Fetch the list of vendor IDs and types.
            setLoadingTypes(true);
            try {
                setVendorsAndTypes(await getVendorIdAndType(GROUP_BUSES));
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingTypes(false);
        };
        fetchVendorsAndTypes();
    }, []);

    // Change the valid status when the value of any element changes.
    React.useEffect(() => {
        if (visible) {
            setValid(name !== "" && vendorId != 0 && deviceType !== "");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, vendorId, deviceType, visible]);

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

    // Export the following functions so that they can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        getName() {
            return name;
        },
        getDescription() {
            return description;
        },
        getGroup() {
            return GROUP_BUSES;
        },
        getVendorId() {
            return vendorId;
        },
        getDeviceType() {
            return deviceType;
        },
        getMaintWindow() {
            return maintWindow;
        }
    }));

    return (
        <>
            <Form>
                <FormGroup row>
                    <Label for="name" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The template name" /> Name:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="name" placeholder="Enter the template name..." value={name} onChange={e => setName(e.target.value)} maxLength={100} />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="description" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The template description" /> Description:
                        <br />
                        <span style={{marginLeft: "20px"}}>(optional)</span>
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="description" type="textarea" placeholder="Enter the template description..." value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="device-type" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="The type of the devices that will be updated by this template" /> Device Type:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="device-type" type="select" onChange={e => onTypeChange(e.target.value)} value={deviceType} disabled={loadingTypes}>
                            <option value="" disabled>{loadingTypes ? "Loading..." : "Select a device type..."}</option>
                            {vendorsAndTypes.map(vt => (
                                <option key={vt.values.type} value={vt.values.type}>{vt.values.type}</option>
                            ))}
                        </Input>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="maintenance-window" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="
                            'Reject' will stop the template at the start of a scan if the device is in it's maintenance window.
                            'Cancel' will stop the template at any step of the scan if a device transitions out of it's maintenance window.
                            'Allow' ignores whether a device is outside of it's maintenance window.
                        " /> Maintenance Window:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="maintenance-window" type="select" value={maintWindow} onChange={e => setMaintWindow(e.target.value)}>
                            <option>Reject</option>
                            <option>Allow</option>
                            <option>Cancel</option>
                        </Input>
                    </Col>
                </FormGroup>
            </Form>
        </>
    );
});

DetailsStep.displayName = "DetailsStep";

export default DetailsStep;