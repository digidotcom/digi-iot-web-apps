'use client';

import { Filter } from '@components/widgets/tables/sortable-table';
import { CloudLogItem } from '@customTypes/cloud-log-types';
import React from 'react';
import { FormGroup, Input, Label, PopoverBody, UncontrolledPopover } from 'reactstrap';

// Constants.
const LOCAL_VAR_SHOW_MONITOR_ENTRIES = "cloudLogShowMonitorEntries";

// Properties interface.
interface Props {
    target: string;
    setFilter: React.Dispatch<React.SetStateAction<Filter | undefined>>;
}

const CloudLogFilter = (props: Props) => {
    const { target, setFilter } = props;

    // Used to store whether the monitor entries should be shown or not.
    const [showMonitorEntries, setShowMonitorEntries] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const show = localStorage.getItem(LOCAL_VAR_SHOW_MONITOR_ENTRIES);
            if (show != null) {
                return show === "true";
            }
        }
        return true;
    });

    // Use `useEffect` to set the filter based on `showMonitorEntries` after mounting.
    React.useEffect(() => {
        setFilter(() => showMonitorEntries ? undefined : getShowMonitorEntriesFilter());
    }, [showMonitorEntries, setFilter]);

    /**
     * Saves whether the monitor entries should be shown and configures the appropriate filter.
     * 
     * @param show `true` to show the monitor entries, `false` otherwise.
     */
    const onShowMonitorEntriesChange = (show: boolean) => {
        setShowMonitorEntries(show);
        localStorage.setItem(LOCAL_VAR_SHOW_MONITOR_ENTRIES, show.toString());
        setFilter(() => show ? undefined : getShowMonitorEntriesFilter());
    };

    /**
     * Returns the filter for the show monitor entries option.
     * 
     * @returns The filter for the show monitor entries option.
     */
    const getShowMonitorEntriesFilter = () => {
        return (item: CloudLogItem) => item.method !== "Monitor";
    };

    return (
        <UncontrolledPopover
            placement="bottom"
            target={target}
            trigger="legacy"
        >
            <PopoverBody>
                <FormGroup switch>
                    <Input
                        type="switch"
                        role="switch"
                        checked={showMonitorEntries}
                        onChange={e => onShowMonitorEntriesChange(e.target.checked)}
                    />
                    <Label check>Show monitor entries</Label>
                </FormGroup>
            </PopoverBody>
        </UncontrolledPopover>
    );
};

export default CloudLogFilter;