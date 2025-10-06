'use client';

import IconButton from '@components/widgets/icon-button';
import { ColorStyles } from '@configs/style-constants';
import { SortableTableColumn } from '@customTypes/table-types';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AppError } from '@models/AppError';
import { showError } from '@utils/toast-utils';
import React, { SyntheticEvent } from 'react';

// Properties interface.
interface Props {
    resourceId: number;
    resource: any;
    columns: SortableTableColumn[];
    onDeleteResource?: (id: number) => Promise<void>;
    rowStyle?: string;
    isItemSelected?: (rsc: any) => boolean;
    onSelectItem?: (rsc: any) => void;
}

const SortableTableItem = (props: Props) => {
    const {
        resourceId,
        resource,
        columns,
        onDeleteResource,
        rowStyle,
        isItemSelected,
        onSelectItem
    } = props;

    // Used to show or hide spinners when deleting the resource.
    const [deletingResource, setDeletingResource] = React.useState(false);

    /**
     * Deletes the resource if it can be deleted.
     */
    const onDelete = async () => {
        if (onDeleteResource === undefined) {
            return;
        }
        setDeletingResource(true);
        try {
            await onDeleteResource(resourceId);
        } catch (e) {
            showError((e as AppError).message);
        }
        setDeletingResource(false);
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
        <tr
            className={`item ${onSelectItem !== undefined ? "selectable-item" : ""} ${rowStyle !== undefined ? rowStyle : ""} ${isItemSelected && isItemSelected(resource) ? "selected-item" : ""}`}
            onClick={e => onSelectItem ? onSelectItem(resource) : dummyClick(e)}
        >
            {columns.map(col => {
                const value = col.getValue(resource);
                return <td key={`${col.id}-${value}`}>{value}</td>;
            })}
            {/* Add a trash button to delete the resource only if it can be deleted. */}
            {onDeleteResource && <td><IconButton icon={deletingResource ? faCircleNotch : faTrashCan} title="Delete" color={ColorStyles.actionButton} onClick={onDelete} spin={deletingResource} enabled={!deletingResource} /></td>}
        </tr>
    );
};

export default SortableTableItem;