'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardTitle, Col, Container, Row } from 'reactstrap';

import BusActions from '@components/buses/bus-actions';
import BusInfo from '@components/buses/bus-info';
import BusStatus from '@components/buses/bus-status';
import CopyableDataSpan from '@components/widgets/copyable-data-span';
import IconButton from '@components/widgets/icon-button';
import Loading from '@components/widgets/loading';
import SortableTable, { SortableTableRef } from '@components/widgets/tables/sortable-table';
import { ColorStyles } from '@configs/style-constants';
import { SortableTableColumn } from '@customTypes/table-types';
import { faAnglesRight, faBus, faCircleNotch, faLink, faLinkSlash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bus } from '@models/Bus';
import { naturalCompare } from '@utils/string-utils';

// Constants.
const CONNECTION_ID = "connection";
const NAME_ID = "name";
const ID_ID = "id";
const LINE_ID = "line";
const STATUS_ID = "status";
const PASSENGERS_ID = "passengers";
const POWER_ID = "power";
const TEMPERATURE_ID = "temperature";
const PRESSURE_ID = "pressure";
const ACTIONS_ID = "actions";

const COLUMNS_REDUCED: SortableTableColumn[] = [
    {
        id: CONNECTION_ID,
        name: "",
        style: "bus-list-table-header-connection",
        sortable: true,
        getValue: (rsc) =>
            <FontAwesomeIcon
                icon={rsc.connected ? faLink : faLinkSlash}
                size="1x"
                title={rsc.connected ? "Connected" : "Disconnected"}
                fixedWidth
                style={{color: rsc.connected ? ColorStyles.statusConnected : ColorStyles.statusDisconnected}}
            />
    },
    {
        id: NAME_ID,
        name: "Name",
        sortable: true,
        getValue: (rsc) => <span>{rsc.incidence ? <FontAwesomeIcon icon={faTriangleExclamation} color={ColorStyles.warningYellow} fixedWidth /> : ""} {rsc.name}</span>
    },
    {
        id: ID_ID,
        name: "Device ID",
        sortable: true,
        getValue: (rsc) => <CopyableDataSpan data={rsc.id.substring(18)} dataToCopy={rsc.id} />
    },
    {
        id: LINE_ID,
        name: "Line",
        sortable: true,
        getValue: (rsc) => rsc.line?.number ?? "-"
    },
    {
        id: STATUS_ID,
        name: "Status",
        sortable: true,
        getValue: (rsc) => <BusStatus inRoute={!rsc.maintenance} connected={rsc.connected} />
    },
    {
        id: ACTIONS_ID,
        name: "Actions",
        getValue: (rsc) => <BusActions bus={rsc} />
    },
];

const COLUMNS_FULL: SortableTableColumn[] = [
    ...COLUMNS_REDUCED.slice(0, 5),
    {
        id: PASSENGERS_ID,
        name: "Passengers",
        sortable: true,
        getValue: (rsc) => (typeof rsc.passengers === 'number' && !isNaN(rsc.passengers)) ? rsc.passengers : '-'
    },
    {
        id: POWER_ID,
        name: "Power level",
        sortable: true,
        getValue: (rsc) => (typeof rsc.power === 'number' && !isNaN(rsc.power)) ? `${rsc.power} %` : '-'
    },
    {
        id: TEMPERATURE_ID,
        name: "Engine temperature",
        sortable: true,
        getValue: (rsc) => (typeof rsc.temperature === 'number' && !isNaN(rsc.temperature)) ? `${rsc.temperature} C` : '-'
    },
    {
        id: PRESSURE_ID,
        name: "Tire pressure",
        sortable: true,
        getValue: (rsc) => (typeof rsc.pressure === 'number' && !isNaN(rsc.pressure)) ? `${rsc.pressure} bar` : '-'
    },
    COLUMNS_REDUCED[COLUMNS_REDUCED.length - 1]
];

// Interface to exchange data using props.
interface Props {
    buses: Bus[];
    isRefreshing?: boolean;
}

// Component definition.
const BusList = (props: Props) => {
    // Initialize variables from props.
    const { buses, isRefreshing = false } = props;

    // Create a reference to access the bus table methds.
    const busTableRef = React.useRef<SortableTableRef>(null);

    // Track the buses in the table internally to force re-draw when sorting changes or when input changes.
    const [tableBuses, setTableBuses] = useState<Bus[]>(buses);

    // Keep track of the selected bus and refresh the page when it changes.
    const [selectedBus, setSelectedBus] = useState<Bus>();

    // Whenever the input buses list changes, update the internal list and check if the selected bus still exists.
    useEffect(() => {
        // Set the new table buses variable.
        setTableBuses(buses);

        // Sort the table.
        busTableRef.current?.sort();

        // If there is a selected bus, check if it still exists.
        if (selectedBus) {
            const existingBus = buses.find(bus => bus.id === selectedBus.id);
            if (!existingBus) {
                // Selected bus does not longer exist. Unselect it.
                unselectBus();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buses]);

    /**
     * Selects the given bus
     * 
     * @param bus Bus to select.
     */
    const onSelectBus = (bus: Bus) => {
        setSelectedBus(prevBus => {
            if (bus === undefined || (prevBus !== undefined && bus.id === prevBus.id)) {
                return undefined;
            }
            return bus;
        });
    };

    /**
     * Unselects the selected bus.
     */
    const unselectBus = () => {
        setSelectedBus(undefined);
    };

    /**
     * Sorts the list of buses based on the given column and direction.
     * 
     * @param sortColumn Sort column.
     * @param sortDir Sort direction.
     */
    const onSortBuses = (sortColumn: string, sortDir: boolean) => {
        // Helper compare function.
        const compare = (a: any, b: any) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        };

        // Clone the buses variable.
        var newBuses = [...buses];
        // Sort the buses.
        newBuses.sort((l1, l2) => {
            switch (sortColumn) {
                case NAME_ID:
                    return sortDir ? naturalCompare(l1.name, l2.name) : naturalCompare(l2.name, l1.name);
                case ID_ID:
                    return sortDir ? compare(l1.id, l2.id) : compare(l2.id, l1.id);
                case LINE_ID:
                    return sortDir ? compare(l1.line?.number ?? 999, l2.line?.number ?? 999) : compare(l2.line?.number ?? 999, l1.line?.number ?? 999);
                case STATUS_ID:
                    return sortDir ? +(l1.maintenance) - +(l2.maintenance) : +(l2.maintenance) - +(l1.maintenance);
                case PASSENGERS_ID:
                    return sortDir ? compare(l1.passengers ?? 0, l2.passengers ?? 0) : compare(l2.passengers ?? 0, l1.passengers ?? 0);
                case POWER_ID:
                    return sortDir ? compare(l1.power ?? 0, l2.power ?? 0) : compare(l2.power ?? 0, l1.power ?? 0);
                case TEMPERATURE_ID:
                    return sortDir ? compare(l1.temperature ?? 0, l2.temperature ?? 0) : compare(l2.temperature ?? 0, l1.temperature ?? 0);
                case PRESSURE_ID:
                    return sortDir ? compare(l1.pressure ?? 0, l2.pressure ?? 0) : compare(l2.pressure ?? 0, l1.pressure ?? 0);
                default:
                    return sortDir ? +l1.connected - +l2.connected : +l2.connected - +l1.connected;
            }
        });
        // Set the new variable to trigger re-render.
        setTableBuses(newBuses);
    };

    return (
        <Card className="full-height">
            <CardTitle>
                Buses {isRefreshing && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
                <div className="toolbar">
                    {selectedBus && <IconButton icon={faAnglesRight} title="Collapse" onClick={unselectBus}/>}
                </div>
            </CardTitle>
            <Container fluid className="dashboard-bottom-card">
                <Row className="full-height">
                    <Col style={{padding: "0 0 0 10px"}}>
                        {buses.length > 0 ? (
                            <div className="bus-list-container">
                                <SortableTable
                                    ref={busTableRef}
                                    resourceNameId="buses"
                                    resources={tableBuses}
                                    columns={selectedBus ? COLUMNS_REDUCED : COLUMNS_FULL}
                                    onSortResources={onSortBuses}
                                    defaultSortColumn={NAME_ID}
                                    defaultSortDirection={true}
                                    isItemSelected={bus => selectedBus ? selectedBus.id === bus.id : false}
                                    onSelectItem={onSelectBus}
                                />
                            </div>
                        ) : (
                            isRefreshing ? (
                                <Loading className="dashboard-card-loading" />
                            ) : (
                                <div className="no-buses-container">
                                    <FontAwesomeIcon icon={faBus} fixedWidth />No buses found
                                </div>
                            )
                        )}
                    </Col>
                    <div className={`bus-info-collapsible ${selectedBus ? "show" : ""}`}>
                        {selectedBus && <BusInfo bus={selectedBus} />}
                    </div>
                </Row>
            </Container>
        </Card>
    );
};

export default BusList;