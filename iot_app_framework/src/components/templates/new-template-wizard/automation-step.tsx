'use client';

import { SIZE_LEFT_COLUMN, SIZE_RIGHT_COLUMN } from '@components/templates/new-template-wizard/new-template-wizard';
import IconButton from '@components/widgets/icon-button';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import React, { Ref } from 'react';
import { Alert, Col, Form, FormGroup, Input, Label } from 'reactstrap';

// Interface with the methods exposed to the parent component.
export interface AutomationStepRef {
    getScanningEnabled: () => boolean;
    getFrequency: () => string;
}

const AutomationStep = React.forwardRef((props, ref: Ref<AutomationStepRef>) => {
    // State values.
    const [scanningEnabled, setScanningEnabled] = React.useState(false);
    const [frequency, setFrequency] = React.useState("Monthly");

    // Export the following functions so that they can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        getScanningEnabled() {
            return scanningEnabled;
        },
        getFrequency() {
            return frequency;
        }
    }));

    return (
        <>
            <Form>
                <FormGroup row>
                    <Label for="enable-scanning" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="Whether the scanning of devices is enabled or not" /> Enable scanning:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <FormGroup switch>
                            <Input id="enable-scanning" type="switch" role="switch" checked={scanningEnabled} onChange={e => setScanningEnabled(e.target.checked)} />
                        </FormGroup>
                    </Col>
                </FormGroup>
                {scanningEnabled && <Alert color="warning">Make sure there is not any enabled template for the same group and device type.</Alert>}
                <FormGroup row>
                    <Label for="frequency" sm={SIZE_LEFT_COLUMN}>
                        <IconButton icon={faInfoCircle} title="How often your devices are scanned" /> Frequency:
                    </Label>
                    <Col sm={SIZE_RIGHT_COLUMN}>
                        <Input id="frequency" type="select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Daily</option>
                            <option>Manual</option>
                        </Input>
                    </Col>
                </FormGroup>
                <Alert color="primary">When scanning is enabled, Digi Remote Manager will periodically verify devices at the specified frequency and update any devices that do not meet the configuration of this template.</Alert>
            </Form>
        </>
    );
});

AutomationStep.displayName = "AutomationStep";

export default AutomationStep;