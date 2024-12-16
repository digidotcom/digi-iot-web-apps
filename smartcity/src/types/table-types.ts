/**
 * Interface representing a sortable table column.
 */
export interface SortableTableColumn {
    id: string;
    name: string;
    style?: string;
    width?: number;
    sortable?: boolean;
    getValue: (rsc: any) => string | JSX.Element;
}