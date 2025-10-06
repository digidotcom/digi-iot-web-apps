'use client';

import NewTemplateWizard from '@components/templates/new-template-wizard/new-template-wizard';
import TemplateEnabled from '@components/templates/template-enabled';
import Loading from '@components/widgets/loading';
import SortableTable, { SortableTableRef } from '@components/widgets/tables/sortable-table';
import { SortableTableColumn } from '@customTypes/table-types';
import { ITemplate } from '@customTypes/template-types';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { deleteTemplate, getTemplates } from '@services/drm/templates';
import { compareFirmwareVersions, naturalCompare } from '@utils/string-utils';
import { showError, showSuccess } from '@utils/toast-utils';
import React from 'react';
import { Button, Card, CardTitle, CloseButton, Modal, ModalBody } from 'reactstrap';

// Props interface.
interface Props {
    group: string;
};

// Constants.
const ENABLED_ID = "enabled";
const NAME_ID = "name";
const DESCRIPTION_ID = "description";
const FW_VERSION_ID = "fw-version";
const TYPE_ID = "device-type";
const SCAN_FREQUENCY_ID = "frequency";

const COLUMNS: SortableTableColumn[] = [
    {
        id: ENABLED_ID,
        name: "Enabled",
        width: 10,
        sortable: true,
        getValue: (rsc) => <TemplateEnabled template={rsc} />
    },
    {
        id: NAME_ID,
        name: "Name",
        width: 20,
        sortable: true,
        getValue: (rsc) => rsc.name
    },
    {
        id: DESCRIPTION_ID,
        name: "Description",
        width: 25,
        sortable: true,
        getValue: (rsc) => rsc.description
    },
    {
        id: FW_VERSION_ID,
        name: "Firmware version",
        width: 15,
        sortable: true,
        getValue: (rsc) => rsc.firmware_version
    },
    {
        id: TYPE_ID,
        name: "Device type",
        width: 15,
        sortable: true,
        getValue: (rsc) => rsc.type
    },
    {
        id: SCAN_FREQUENCY_ID,
        name: "Scan frequency",
        width: 10,
        sortable: true,
        getValue: (rsc) => rsc.scan_frequency.charAt(0).toUpperCase() + rsc.scan_frequency.slice(1)
    },
];

const TemplatesList = (props: Props) => {
    const { group } = props;

    // Used to show or hide the loading icons.
    const [initialLoadingTemplates, setInitialLoadingTemplates] = React.useState(false);
    const [loadingTemplates, setLoadingTemplates] = React.useState(false);

    // List of templates.
    const [templates, setTemplates] = React.useState<ITemplate[]>([]);

    // Used to show or hide the modal to create a new template.
    const [showNewTemplateModal, setShowNewTemplateModal] = React.useState(false);

    // Reference to the templates table component.
    const templatesTableRef = React.useRef<SortableTableRef>(null);

    // Fetch the templates when the component loads.
    React.useEffect(() => {
        fetchTemplates(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Fetches the list of templates for the groups of the demo.
     * 
     * @param initial `true` for the initial fetch, `false` for subsequent fetches.
     */
    const fetchTemplates = async (initial?: boolean) => {
        setLoadingTemplates(true);
        setInitialLoadingTemplates(initial ?? false);
        try {
            // Get the templates.
            setTemplates(await getTemplates(group));
            // Sort the templates in the table.
            templatesTableRef.current?.sort();
        } catch (e) {
            showError((e as AppError).message);
        }
        setLoadingTemplates(false);
        setInitialLoadingTemplates(false);
    };

    /**
     * Deletes the template with the given ID.
     * 
     * @param id ID of the template to delete.
     * 
     * @throws An {@link AppError} if there is any error deleting the template.
     */
    const onDeleteTemplate = async (id: number) => {
        // Get the template with the given ID.
        const templateToDelete = templates.find(t => t.id === id);
        if (!templateToDelete) {
            showError(`Template with ID ${id} not found`);
            return;
        }
        try {
            await deleteTemplate(templateToDelete.id);
            showSuccess("Template deleted successfully");
            // Remove it from the list.
            const newTemplates = templates.filter(t => t.id !== id);
            setTemplates([...newTemplates]);
        } catch (e) {
            showError((e as AppError).message);
        }
    };

    /**
     * Sorts the list of templates based on the given column and direction.
     * 
     * @param sortColumn Sort column.
     * @param sortDir Sort direction.
     */
    const onSortTemplates = (sortColumn: string, sortDir: boolean) => {
        setTemplates(prevTemplates => {
            const newTemplates = [...prevTemplates];
            newTemplates.sort((t1, t2) => {
                switch (sortColumn) {
                    case ENABLED_ID:
                        return sortDir ? Number(t1.enabled) - Number(t2.enabled) : Number(t2.enabled) - Number(t1.enabled);
                    case DESCRIPTION_ID:
                        return sortDir ? t1.description?.localeCompare(t2.description) : t2.description?.localeCompare(t1.description);
                    case FW_VERSION_ID:
                        return sortDir ? compareFirmwareVersions(t1.firmware_version, t2.firmware_version) : compareFirmwareVersions(t2.firmware_version, t1.firmware_version);
                    case TYPE_ID:
                        return sortDir ? t1.type.localeCompare(t2.type) : t2.type.localeCompare(t1.type);
                    case SCAN_FREQUENCY_ID:
                        return sortDir ? naturalCompare(t1.scan_frequency, t2.scan_frequency) : naturalCompare(t2.scan_frequency, t1.scan_frequency);
                    default:
                        return sortDir ? naturalCompare(t1.name, t2.name) : naturalCompare(t2.name, t1.name);
                }
            });
            return newTemplates;
        });
    };

    /**
     * Closes the modal and refreshes the list of templates.
     */
    const closeModal = () => {
        // Close the modal.
        setShowNewTemplateModal(false);
        // Refresh the list of templates.
        fetchTemplates();
    };

    return (
        <>
            <Card>
                <CardTitle className="d-flex">
                    <span className="me-auto">
                        Templates {loadingTemplates && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
                    </span>
                    <Button className="card-text-button" title="Add new template" onClick={() => setShowNewTemplateModal(true)}>
                        <FontAwesomeIcon icon={faPlus} fixedWidth />Add template
                    </Button>
                </CardTitle>
                <div className="d-flex" style={{height: "300px"}}>
                    {initialLoadingTemplates ? (
                        <Loading className="dashboard-card-loading" />
                    ) : (
                        <>
                            {templates.length > 0 ? (
                                // If there are templates, show the table.
                                <div className="templates-container">
                                    <SortableTable
                                        ref={templatesTableRef}
                                        resourceNameId="templates"
                                        resources={templates}
                                        columns={COLUMNS}
                                        onSortResources={onSortTemplates}
                                        defaultSortColumn={NAME_ID}
                                        defaultSortDirection={true}
                                        onDeleteResource={onDeleteTemplate}
                                    />
                                </div>
                            ) : (
                                // If there are no templates, show a message.
                                <div className="no-templates-container">
                                    <h3>No templates found</h3>
                                    <p>Please add your first template</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>

            {/* Modal to create a new template. */}
            <Modal isOpen={showNewTemplateModal} size="lg">
                <div className="new-template-header">
                    <div>
                        <FontAwesomeIcon icon={faFile} size="3x" fixedWidth />
                        <div style={{flex: "auto"}}>
                            <h3>Add new template</h3>
                            <span>Your fleet of devices can be automatically scanned, updated, and kept in compliance with the configuration you set in a template.</span>
                        </div>
                        <CloseButton onClick={() => setShowNewTemplateModal(false)} />
                    </div>
                </div>
                <ModalBody>
                    <NewTemplateWizard
                        closeModal={closeModal}
                    />
                </ModalBody>
            </Modal>
        </>
    );
};

export default TemplatesList;