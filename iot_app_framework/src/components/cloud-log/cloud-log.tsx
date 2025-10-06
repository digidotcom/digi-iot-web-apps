'use client';

import CloudLogDetails from '@components/cloud-log/cloud-log-details';
import CloudLogFilter from '@components/cloud-log/cloud-log-filter';
import CopyableDataSpan from '@components/widgets/copyable-data-span';
import IconButton from '@components/widgets/icon-button';
import SortableTable, { Filter, SortableTableRef } from '@components/widgets/tables/sortable-table';
import { ColorStyles } from '@configs/style-constants';
import { CloudLogItem } from '@customTypes/cloud-log-types';
import { Method } from '@customTypes/query-types';
import { SortableTableColumn } from '@customTypes/table-types';
import { faFloppyDisk, faTrashCan, faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { faClose, faExchange, faFilter, faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CloudLogManager from '@services/cloud-log-manager';
import React from 'react';
import { Button, Col, Collapse, Container, Modal, ModalBody, ModalFooter, ModalHeader, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'reactstrap';

// Constants.
const BREAKPOINT_XL = 1200;

const TIME_ID = "time";
const METHOD_ID = "method";
const REQUEST_ID = "request";
const STATUS_ID = "status";

const COLUMNS: SortableTableColumn[] = [
    {
        id: TIME_ID,
        name: "Time",
        width: 20,
        sortable: true,
        getValue: (rsc) => rsc.time.toLocaleString()
    },
    {
        id: METHOD_ID,
        name: "Method",
        width: 15,
        sortable: true,
        getValue: (rsc) => <span className={getMethodClass(rsc.method)}>{rsc.method}</span>
    },
    {
        id: REQUEST_ID,
        name: "Request",
        width: 50,
        sortable: true,
        getValue: (rsc) => <CopyableDataSpan data={rsc.url + (rsc.url.length != rsc.fullUrl?.length ? "..." : "")} dataToCopy={rsc.fullUrl} />
    },
    {
        id: STATUS_ID,
        name: "Status",
        width: 15,
        sortable: true,
        getValue: (rsc) => <span className={getStatusClass(rsc.status)}>{rsc.status}</span>
    },
];

/**
 * Returns the classname for the method column.
 * 
 * @param method Method.
 * 
 * @returns The classname for the method column.
 */
const getMethodClass = (method: Method) => {
    switch (method) {
        case "GET": return "cloud-log-method-get";
        case "POST": return "cloud-log-method-post";
        case "PUT": return "cloud-log-method-put";
        case "DELETE": return "cloud-log-method-delete";
        case "Monitor": return "cloud-log-method-monitor";
        default: return "";
    }
};

/**
 * Returns the classname for the status column.
 * 
 * @param status Status.
 * 
 * @returns The classname for the status column.
 */
const getStatusClass = (status: number) => {
    return status < 200 || status >= 300 ? "cloud-log-status-error" : "";
};

const CloudLog = () => {
    // Used to show/hide the log.
    const [logOpen, setLogOpen] = React.useState(false);
    const toggleLog = () => setLogOpen(!logOpen);

    // Used to maximize/restore the log window.
    const [logMaximized, setLogMaximized] = React.useState(false);
    const toggleLogMaximized = () => setLogMaximized(!logMaximized);

    // Used to store the log items.
    const [log, setLog] = React.useState<CloudLogItem[]>(CloudLogManager.getLog());

    // Used to store the selected item in the table (if any).
    const [selectedItem, setSelectedItem] = React.useState<CloudLogItem>();

    // Used to store whether the table is expanded or not.
    const [tableExpanded, setTableExpanded] = React.useState(true);

    // Reference to the cloud log table component.
    const logTableRef = React.useRef<SortableTableRef>(null);

    // Used to show/hide the modal to confirm removing all items.
    const [showRemoveAllModal, setShowRemoveAllModal] = React.useState(false);
    const toggleRemoveAllModal = () => setShowRemoveAllModal(!showRemoveAllModal);

    // Used to focus the Yes button when the modal is open.
    const yesButtonRef: React.Ref<HTMLButtonElement> = React.useRef(null);

    // Used to store the filter function (if any).
    const [filterFunction, setFilterFunction] = React.useState<Filter | undefined>(() => undefined);

    // Generate the log count when either the log list of the filter function change.
    const logCount = React.useMemo(() => {
        const totalCount = log.length;
        const count = filterFunction ? log.filter(filterFunction).length : totalCount;
        if (totalCount === 0) {
            return "";
        }
        return `(${count}${filterFunction ? "/" + totalCount : ""})`;
    }, [log, filterFunction]);

    // Register a callback to be notified when new log items are created.
    const callbackRegistered = React.useRef(false);
    if (!callbackRegistered.current) {
        CloudLogManager.registerLogCallback(item => {
            setLog(prevLog => {
                const exists = prevLog.find(l => l.id === item.id) !== undefined;
                return exists ? prevLog : [item, ...prevLog];
            });
            logTableRef.current?.sort();
        });
        callbackRegistered.current = true;
    }

    // When the selected item changes or the window is resized, change the `tableExpanded` state.
    React.useEffect(() => {
        const resize = () => {
            setTableExpanded(!selectedItem || window.innerWidth > BREAKPOINT_XL - 1);
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [selectedItem]);

    // Unselect the selected item when filtering if it does not match the filter.
    React.useEffect(() => {
        if (selectedItem !== undefined && filterFunction !== undefined && !filterFunction(selectedItem)) {
            unselectItem();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterFunction]);

    /**
     * Selects the given cloud log item.
     * 
     * @param item Item to select.
     */
    const onSelectItem = (item: CloudLogItem) => {
        setSelectedItem(prevItem => {
            if (item === undefined || (prevItem !== undefined && item.id === prevItem.id)) {
                return undefined;
            }
            return item;
        });
    };

    /**
     * Unselects the selected cloud log item.
     */
    const unselectItem = () => {
        setSelectedItem(undefined);
    }

    /**
     * Exports the log in JSON format.
     */
    const exportLog = () => {
        // Create a copy of the original map with several modifications.
        const exportedLog = log.map(l => {
            return {
                ...l,
                url: l.fullUrl || l.url,
                fullUrl: undefined,
                params: undefined,
                selected: undefined
            };
        });
        const data = new Blob([JSON.stringify(exportedLog)], { type: "application/json" });
        // Create a temporary link to download the JSON file.
        const link = document.createElement("a");
        link.href = URL.createObjectURL(data);
        link.download = `digi_iot_app_framework_log_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    /**
     * Sorts the list of cloud log items based on the given column and direction.
     * 
     * @param sortColumn Sort column.
     * @param sortDir Sort direction.
     */
    const onSortLog = (sortColumn: string, sortDir: boolean) => {
        setLog(prevLog => {
            const newLog = [...prevLog];
            newLog.sort((l1, l2) => {
                switch (sortColumn) {
                    case METHOD_ID:
                        return sortDir ? l1.method.localeCompare(l2.method) : l2.method.localeCompare(l1.method);
                    case REQUEST_ID:
                        return sortDir ? l1.url.localeCompare(l2.url) : l2.url.localeCompare(l1.url);
                    case STATUS_ID:
                        return sortDir ? l1.status - l2.status : l2.status - l1.status;
                    default:
                        return sortDir ? l1.time.getTime() - l2.time.getTime() : l2.time.getTime() - l1.time.getTime();
                }
            });
            return newLog;
        });
    };

    /**
     * Closes the log and restores it maximized status.
     */
    const onLogClosed = () => {
        setLogMaximized(false);
        unselectItem();
    };

    return (
        <>
            <Offcanvas direction="bottom" toggle={toggleLog} backdrop={false} isOpen={logOpen}
                className={logMaximized ? "cloud-log-full" : "cloud-log-half"} container="main-content"
                onClosed={onLogClosed} unmountOnClose={false}>
                <OffcanvasHeader>
                    <div className="cloud-log-header">
                        <div style={{flex: "auto"}}>
                            <FontAwesomeIcon icon={faExchange} fixedWidth /> Cloud log {logCount}
                        </div>
                        <Button
                            className="cloud-log-hide-button"
                            hidden={!logOpen}
                            onClick={() => setLogOpen(false)}
                        />
                        <IconButton icon={filterFunction ? faFilterCircleXmark : faFilter} title="Change filter" size="sm" id="filters" color={filterFunction ? ColorStyles.digiGreen : ColorStyles.darkGray} />
                        <IconButton icon={faTrashCan} title="Clear log" size="sm" onClick={() => setShowRemoveAllModal(true)} enabled={log.length > 0} />
                        <IconButton icon={faFloppyDisk} title="Export log" size="sm" onClick={exportLog} enabled={log.length > 0} />
                        <IconButton icon={logMaximized ? faWindowRestore : faWindowMaximize} title={logMaximized ? "Restore" : "Maximize"} size="sm" onClick={toggleLogMaximized} />
                        <IconButton icon={faClose} title="Close" size="sm" onClick={() => setLogOpen(false)} />
                        <CloudLogFilter target="filters" setFilter={setFilterFunction} />
                    </div>
                </OffcanvasHeader>
                <OffcanvasBody id="offcanvas-body">
                    <Container fluid>
                        <Row>
                            <Col>
                                <Collapse isOpen={tableExpanded}>
                                    <SortableTable
                                        ref={logTableRef}
                                        resourceNameId="log"
                                        resources={log}
                                        columns={COLUMNS}
                                        onSortResources={onSortLog}
                                        defaultSortColumn={TIME_ID}
                                        defaultSortDirection={false}
                                        isItemSelected={item => selectedItem ? selectedItem.id === item.id : false}
                                        onSelectItem={onSelectItem}
                                        filter={filterFunction}
                                    />
                                </Collapse>
                            </Col>
                            <Col className={!selectedItem ? "d-none" : ""} xl="6">
                                <CloudLogDetails
                                    selectedItem={selectedItem}
                                    tableExpanded={tableExpanded}
                                    setTableExpanded={setTableExpanded} />
                            </Col>
                        </Row>
                    </Container>
                </OffcanvasBody>
            </Offcanvas>

            {/* Button to open the cloud log, always visible at the bottom. */}
            <div className="cloud-log-btn-container">
                <Button color="primary" className="cloud-log-btn" onClick={toggleLog}><FontAwesomeIcon icon={faExchange} fixedWidth /> Cloud log</Button>
            </div>

            {/* Modal to get confirmation when removing all items. */}
            <Modal isOpen={showRemoveAllModal} toggle={toggleRemoveAllModal} onOpened={() => yesButtonRef.current?.focus()}>
                <ModalHeader toggle={toggleRemoveAllModal}>Clear cloud log</ModalHeader>
                <ModalBody>Are you sure you want to remove all log items?</ModalBody>
                <ModalFooter>
                    <Button color="primary" innerRef={yesButtonRef} onClick={() => {
                        setSelectedItem(undefined);
                        setLog([]);
                        setShowRemoveAllModal(false);
                    }}>
                        Yes
                    </Button>
                    <Button color="secondary" onClick={() => setShowRemoveAllModal(false)}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default CloudLog;