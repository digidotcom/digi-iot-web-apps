'use client';

import { ITemplate } from '@customTypes/template-types';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { enableTemplate } from '@services/drm/templates';
import { showError } from '@utils/toast-utils';
import React from 'react';
import { FormGroup, Input } from 'reactstrap';

// Properties interface.
interface Props {
    template: ITemplate;
}

const TemplateEnabled = (props: Props) => {
    const { template } = props;

    // Used to control the switch that represents whether the template is enabled or not.
    const [templateEnabled, setTemplateEnabled] = React.useState(template.enabled);

    // Used to show or hide a spinner when updating the template.
    const [updatingTemplate, setUpdatingTemplate] = React.useState(false);

    /**
     * Enables or disables the template.
     * 
     * @param enable `true` to enable the template, `false` to disable it.
     */
    const onEnableDisable = async (enable: boolean) => {
        setUpdatingTemplate(true);
        try {
            await enableTemplate(template.id, enable);
            // Only store the new state if the previous call succeeded.
            setTemplateEnabled(enable);
            template.enabled = enable;
        } catch (e) {
            showError((e as AppError).message);
        }
        setUpdatingTemplate(false);
    };

    return (
        <>
            <FormGroup switch hidden={updatingTemplate}>
                <Input type="switch" checked={templateEnabled} onChange={() => onEnableDisable(!templateEnabled)} />
            </FormGroup>
            <FontAwesomeIcon icon={faCircleNotch} spin style={{display: updatingTemplate ? "unset" : "none"}} />
        </>
    );
};

export default TemplateEnabled;