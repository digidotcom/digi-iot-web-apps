'use client';

import AutomationStep, { AutomationStepRef } from '@components/templates/new-template-wizard/automation-step';
import DetailsStep, { DetailsStepRef } from '@components/templates/new-template-wizard/details-step';
import FileSystemStep, { FilesystemStepRef } from '@components/templates/new-template-wizard/filesystem-step';
import FirmwareStep, { FirmwareStepRef } from '@components/templates/new-template-wizard/firmware-step';
import WizardStepsInfo from '@components/templates/new-template-wizard/wizard-step-info';
import { INewTemplate } from '@customTypes/template-types';
import { AppError } from '@models/AppError';
import { uploadFileSystem } from '@services/drm/files';
import { createTemplate, deleteTemplate, updateTemplate } from '@services/drm/templates';
import { showError, showSuccess } from '@utils/toast-utils';
import React from 'react';
import { Button } from 'reactstrap';

// Constants.
export const SIZE_LEFT_COLUMN = 3;
export const SIZE_RIGHT_COLUMN = 9;

// Properties interface.
interface Props {
    closeModal: () => void;
}

const NewTemplateWizard = (props: Props) => {
    const { closeModal } = props;

    // Used to determine if the user can go back or not.
    const [canGoBack, setCanGoBack] = React.useState(false);

    // Used to determine if the current step is valid or not.
    const [stepValid, setStepValid] = React.useState(false);

    // Used to show a spinner while creating the template.
    const [creatingTemplate, setCreatingTemplate] = React.useState(false);

    // Used to store the current step.
    const [currentStep, setCurrentStep] = React.useState(1);

    // References to each step.
    const detailsStepRef = React.useRef<DetailsStepRef>(null);
    const firmwareStepRef = React.useRef<FirmwareStepRef>(null);
    const filesystemStepRef = React.useRef<FilesystemStepRef>(null);
    const automationStepRef = React.useRef<AutomationStepRef>(null);

    // List of steps.
    const steps = [{
        number: 1,
        name: "Details",
        component:
            <DetailsStep
                ref={detailsStepRef}
                setValid={setStepValid}
                visible={currentStep == 1}
            />
    },
    {
        number: 2,
        name: "Firmware",
        component:
            <FirmwareStep
                ref={firmwareStepRef}
                setValid={setStepValid}
                visible={currentStep == 2}
                vendorId={detailsStepRef.current?.getVendorId() ?? 0}
                deviceType={detailsStepRef.current?.getDeviceType() ?? ""}
            />
    },
    {
        number: 3,
        name: "File System",
        component: 
            <FileSystemStep
                ref={filesystemStepRef}
            />
    },
    {
        number: 4,
        name: "Automation",
        component:
            <AutomationStep
                ref={automationStepRef}
            />
    }];

    // Update 'canGoBack' status when current step changes.
    React.useEffect(() => {
        setCanGoBack(currentStep > 1);
    }, [currentStep]);

    /**
     * Goes to the next step or, if it's the last step, creates the template.
     */
    const onNextStep = async () => {
        // Check if there is any additional step.
        if (currentStep < steps.length) {
            const step = currentStep + 1;
            setCurrentStep(step);
        } else if (currentStep == steps.length) {
            // Sanity check.
            if (detailsStepRef.current === null || firmwareStepRef.current === null || filesystemStepRef.current === null || automationStepRef.current === null) {
                return;
            }
            // This is the last step, so create the template.
            setCreatingTemplate(true);
            const newTemplate: INewTemplate = {
                name: detailsStepRef.current.getName(),
                description: detailsStepRef.current.getDescription(),
                groups: [detailsStepRef.current.getGroup()],
                vendor_id: detailsStepRef.current.getVendorId(),
                type: detailsStepRef.current.getDeviceType(),
                maintenance_window_handling: detailsStepRef.current.getMaintWindow(),
                firmware_version: firmwareStepRef.current.getFirmwareVersion(),
                enabled: automationStepRef.current.getScanningEnabled(),
                scan_frequency: automationStepRef.current.getFrequency(),
                alert: true,
                remediate: true
            };
            let createdTemplate;
            try {
                // Create the template.
                createdTemplate = await createTemplate(newTemplate);
                // If a file system was provided, upload it first and then add a reference to the template.
                const filesystem = filesystemStepRef.current.getFilesystem();
                if (filesystem) {
                    const fileset = `configuration-${createdTemplate.id}-fileset`;
                    await uploadFileSystem(filesystem, fileset);
                    await updateTemplate(createdTemplate.id, { device_fileset: fileset, scan_files: true });
                };
                showSuccess("Template created successfully");
                // If the template was created successfully, close the modal.
                closeModal();
            } catch (e) {
                showError((e as AppError).message);
                // If the template was created, delete it.
                if (createdTemplate) {
                    await deleteTemplate(createdTemplate?.id);
                }
            }
            setCreatingTemplate(false);
        }
    };

    /**
     * Goes to the previous step (if allowed).
     */
    const onPreviousStep = () => {
        // Make sure there is a previous step.
        if (currentStep <= 1) {
            return;
        }
        const step = currentStep - 1;
        setCurrentStep(step);
    };

    return (
        <>
            <div className="new-template-container">
                <WizardStepsInfo
                    steps={steps}
                    currentStep={currentStep}
                />
                {steps.map((s, index) => (
                    <div key={`step-${index}`} style={{display: index == currentStep - 1 ? "" : "none"}}>
                        {s.component}
                    </div>
                ))}
            </div>
            <div className="new-template-btn-container">
                <Button color="secondary" onClick={onPreviousStep} disabled={!canGoBack}>
                    Back
                </Button>
                <Button color="primary" onClick={onNextStep} disabled={!stepValid || creatingTemplate}>
                    {currentStep < steps.length ? "Next" : (creatingTemplate ? "Creating..." : "Create")}
                </Button>
            </div>
        </>
    );
};

export default NewTemplateWizard;