'use client';

import NewFirmware from '@components/firmware/new-firmware';
import Loading from '@components/widgets/loading';
import SortableTable, { SortableTableRef } from '@components/widgets/tables/sortable-table';
import { IFirmware } from '@customTypes/firmware-types';
import { VendorIdAndType } from '@customTypes/report-types';
import { SortableTableColumn } from '@customTypes/table-types';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { deleteCustomFirmware, getCustomFirmware } from '@services/drm/firmware';
import { getVendorIdAndType } from '@services/drm/reports';
import { compareFirmwareVersions } from '@utils/string-utils';
import { showError, showSuccess } from '@utils/toast-utils';
import React from 'react';
import { Button, Card, CardTitle, CloseButton, Modal, ModalBody } from 'reactstrap';

// Props interface.
interface Props {
    group: string;
};

// Constants.
const FW_VERSION_ID = "fw-version";
const TYPE_ID = "device-type";
const LAST_UPDATE_ID = "last-update";

const COLUMNS: SortableTableColumn[] = [
    {
        id: FW_VERSION_ID,
        name: "Firmware version",
        width: 35,
        sortable: true,
        getValue: (rsc) => rsc.firmware_version
    },
    {
        id: TYPE_ID,
        name: "Device type",
        width: 30,
        sortable: true,
        getValue: (rsc) => rsc.type
    },
    {
        id: LAST_UPDATE_ID,
        name: "Last update",
        width: 35,
        sortable: true,
        getValue: (rsc) => new Date(rsc.update_time ?? 0).toLocaleString()
    }
];

const FirmwareList = (props: Props) => {
    const { group } = props;

    // Used to show or hide the loading icons.
    const [initialLoadingFirmware, setInitialLoadingFirmware] = React.useState(false);
    const [loadingFirmware, setLoadingFirmware] = React.useState(false);

    // List of firmware.
    const [firmwareVersions, setFirmwareVersions] = React.useState<IFirmware[]>([]);

    // List of vendor IDs and types.
    const [vendorsAndTypes, setVendorsAndTypes] = React.useState<VendorIdAndType[]>([]);

    // Used to show or hide the modal to create a new firmware.
    const [showNewFirmwareModal, setShowNewFirmwareModal] = React.useState(false);

    // Reference to the firmware table component.
    const firmwareTableRef = React.useRef<SortableTableRef>(null);

    // Fetch the custom firmware when the component loads.
    React.useEffect(() => {
        fetchFirmware(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Fetches the list of custom firmware for the groups of the demo.
     * 
     * @param initial `true` for the initial fetch, `false` for subsequent fetches.
     */
    const fetchFirmware = async (initial?: boolean) => {
        setLoadingFirmware(true);
        setInitialLoadingFirmware(initial ?? false);
        try {
            // Get the list of vendor IDs and types for the simulated group.
            let vat = vendorsAndTypes;
            if (vat.length == 0) {
                vat = await getVendorIdAndType(group);
                setVendorsAndTypes(vat);
            }
            const pairs: { vendorId: number, deviceType: string }[] = [];
            vat.forEach(vt => pairs.push({ vendorId: Number(vt.values.vendor_id), deviceType: vt.values.type }));
            if (pairs.length > 0) {
                // Get the custom firmware.
                setFirmwareVersions(await getCustomFirmware(pairs));
                // Sort the custom firmware in the table.
                firmwareTableRef.current?.sort();
            }
        } catch (e) {
            showError((e as AppError).message);
        }
        setLoadingFirmware(false);
        setInitialLoadingFirmware(false);
    };

    /**
     * Deletes the custom firmware with the given ID.
     * 
     * @param id ID of the firmware to delete.
     * 
     * @throws An {@link AppError} if there is any error deleting the template.
     */
    const onDeleteFirmware = async (id: number) => {
        // Get the firmware with the given ID.
        const fwToDelete = firmwareVersions.find(fw => fw.id === id);
        if (!fwToDelete) {
            showError(`Firmware with ID ${id} not found`);
            return;
        }
        try {
            await deleteCustomFirmware(fwToDelete.vendor_id, fwToDelete.type, fwToDelete.firmware_version);
            showSuccess("Firmware deleted successfully");
            // Remove it from the list.
            const newFirmware = firmwareVersions.filter(fw => fw.id !== id);
            setFirmwareVersions([...newFirmware]);
        } catch (e) {
            showError((e as AppError).message);
        }
    };

    /**
     * Sorts the list of custom firmware based on the given column and direction.
     * 
     * @param sortColumn Sort column.
     * @param sortDir Sort direction.
     */
    const onSortFirmware = (sortColumn: string, sortDir: boolean) => {
        setFirmwareVersions(prevFirmware => {
            const newFirmware = [...prevFirmware];
            newFirmware.sort((t1, t2) => {
                switch (sortColumn) {
                    case TYPE_ID:
                        return sortDir ? t1.type.localeCompare(t2.type) : t2.type.localeCompare(t1.type);
                    case LAST_UPDATE_ID:
                        return sortDir ? new Date(t1.update_time ?? 0).getTime() - new Date(t2.update_time ?? 0).getTime() : new Date(t2.update_time ?? 0).getTime() - new Date(t1.update_time ?? 0).getTime();
                    default:
                        return sortDir ? compareFirmwareVersions(t1.firmware_version, t2.firmware_version) : compareFirmwareVersions(t2.firmware_version, t1.firmware_version);
                }
            });
            return newFirmware;
        });
    };

    /**
     * Closes the modal and refreshes the list of custom firmware.
     */
    const closeModal = () => {
        // Close the modal.
        setShowNewFirmwareModal(false);
        // Refresh the list of templates.
        fetchFirmware();
    };

    return (
        <>
            <Card>
                <CardTitle className="d-flex">
                    <span className="me-auto">
                        Custom firmware {loadingFirmware && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
                    </span>
                    <Button className="card-text-button" title="Add new firmware" onClick={() => setShowNewFirmwareModal(true)}>
                        <FontAwesomeIcon icon={faPlus} fixedWidth />Add firmware
                    </Button>
                </CardTitle>
                <div className="d-flex" style={{height: "300px"}}>
                    {initialLoadingFirmware ? (
                        <Loading className="dashboard-card-loading" />
                    ) : (
                        <>
                            {firmwareVersions.length > 0 ? (
                                // If there are firmware, show the table.
                                <div className="templates-container">
                                    <SortableTable
                                        ref={firmwareTableRef}
                                        resourceNameId="firmware"
                                        resources={firmwareVersions}
                                        columns={COLUMNS}
                                        onSortResources={onSortFirmware}
                                        defaultSortColumn={FW_VERSION_ID}
                                        defaultSortDirection={false}
                                        onDeleteResource={onDeleteFirmware}
                                    />
                                </div>
                            ) : (
                                // If there are no firmware, show a message.
                                <div className="no-templates-container">
                                    <h3>No firmware found</h3>
                                    <p>Please add your first custom firmware</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>

            {/* Modal to create a new firmware. */}
            <Modal isOpen={showNewFirmwareModal} size="lg">
                <div className="new-template-header">
                    <div>
                        <FontAwesomeIcon icon={faFile} size="3x" fixedWidth />
                        <div style={{flex: "auto"}}>
                            <h3>Add new firmware</h3>
                            <span>You can upload your own firmware versions so that you can use them to upgrade your fleet of devices with a template.</span>
                        </div>
                        <CloseButton onClick={() => setShowNewFirmwareModal(false)} />
                    </div>
                </div>
                <ModalBody>
                    <NewFirmware
                        vendorsAndTypes={vendorsAndTypes}
                        closeModal={closeModal}
                    />
                </ModalBody>
            </Modal>
        </>
    );
};

export default FirmwareList;