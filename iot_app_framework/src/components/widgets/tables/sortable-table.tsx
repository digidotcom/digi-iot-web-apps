'use client';

import SortableTableItem from '@components/widgets/tables/sortable-table-item';
import { SortableTableColumn } from '@customTypes/table-types';
import { getTableSortIcon } from '@utils/icon-utils';
import React, { Ref, SyntheticEvent } from 'react';
import { Table } from 'reactstrap';

// Constants.
const LOCAL_VAR_SORT_DIR = "SortDirection";
const LOCAL_VAR_SORT_COL = "SortColumn";

// Properties interface.
interface Props {
    resourceNameId: string;
    resources: any[];
    columns: SortableTableColumn[];
    onSortResources: (sortColumn: string, sortDir: boolean) => void;
    defaultSortColumn: string;
    defaultSortDirection: boolean;
    onDeleteResource?: (id: number) => Promise<void>;
    rowStyle?: string;
    isItemSelected?: (rsc: any) => boolean;
    onSelectItem?: (rsc: any) => void;
    filter?: Filter;
}

// Interface with the methods exposed to the parent component.
export interface SortableTableRef {
    sort: () => void;
}

// Filter function.
export type Filter = (item: any) => boolean;

const SortableTable = React.forwardRef((props: Props, ref: Ref<SortableTableRef>) => {
    const {
        resourceNameId,
        resources,
        columns,
        onSortResources,
        defaultSortColumn,
        defaultSortDirection,
        onDeleteResource,
        rowStyle,
        isItemSelected,
        onSelectItem,
        filter
    } = props;

    // Used to store the sort column.
    const [sortColumn, setSortColumn] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const col = localStorage.getItem(`${resourceNameId}${LOCAL_VAR_SORT_COL}`);
            // Check if the sort column is stored in the browser.
            if (col != null) {
                return col;
            }
        }
        return defaultSortColumn;
    });

    // Used to stored the sort direction.
    const [sortDir, setSortDir] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const dir = localStorage.getItem(`${resourceNameId}${LOCAL_VAR_SORT_DIR}`);
            // Check if the sort direction is stored in the browser.
            if (dir != null) {
                return dir === "true";
            }
        }
        return defaultSortDirection;
    });

    /**
     * Sort the resources when the sort column or direction changes.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => onSortResources(sortColumn, sortDir), [sortColumn, sortDir]);

    // Export the following function so that it can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        sort() {
            onSortResources(sortColumn, sortDir);
        }
    }));

    /**
     * Sorts the resources table based on the clicked column.
     * 
     * @param e Event.
     */
    const sortTable = (e: SyntheticEvent) => {
        // @ts-ignore
        const newId = e.target.id;
        var newSortDir = null;
        var newSortColumn = null;
        if (newId && newId == sortColumn) {
            newSortDir = !sortDir;
        } else {
            newSortColumn = newId;
            newSortDir = true;
        }
        setSortDir(newSortDir);
        // Store the new sort direction in the browser.
        localStorage.setItem(`${resourceNameId}${LOCAL_VAR_SORT_DIR}`, newSortDir.toString());
        // Check if the sort column has changed.
        if (newSortColumn) {
            setSortColumn(newSortColumn);
            // Store the new sort column in the browser.
            localStorage.setItem(`${resourceNameId}${LOCAL_VAR_SORT_COL}`, newSortColumn);
        }
    };

    /**
     * Simulates a dummy click that does nothing.
     * 
     * @param e Event.
     */
    const dummyClick = (e?: SyntheticEvent) => {
        e?.stopPropagation();
    };

    return (
        <Table hover className="sortable-table ">
            <thead>
                <tr>
                    {columns.map(col => (
                        <th
                            id={col.id}
                            key={col.id}
                            className={`${col.sortable ? "sortable-column" : ""} ${col.style !== undefined ? col.style : ""}`}
                            style={col.width ? {width: `${col.width}%`} : {}}
                            onClick={col.sortable ? sortTable : dummyClick}>
                            {col.name} {col.sortable && sortColumn == col.id && getTableSortIcon(sortDir)}
                        </th>
                    ))}
                    {/* Add a column delete the resources only if they can be deleted. */}
                    {onDeleteResource && <th style={{width: "5%"}} ></th>}
                </tr>
            </thead>
            <tbody>
                {resources.filter(filter ?? (() => true)).map(rsc => (
                    <SortableTableItem
                        key={rsc.id}
                        resourceId={rsc.id}
                        resource={rsc}
                        columns={columns}
                        onDeleteResource={onDeleteResource}
                        rowStyle={rowStyle}
                        isItemSelected={isItemSelected}
                        onSelectItem={onSelectItem}
                    />
                ))}
            </tbody>
        </Table>
    );
});

SortableTable.displayName = "SortableTable";

export default SortableTable;