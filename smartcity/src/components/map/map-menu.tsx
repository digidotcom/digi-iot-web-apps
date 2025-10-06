'use client';

import { useState } from 'react';
import { FormGroup, Input, Label, PopoverBody, UncontrolledPopover } from 'reactstrap';

import { RoutePath } from '@customTypes/map-types';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Interface to exchange data using props.
interface Props {
    target: string;
    paths: RoutePath[];
    showPaths: boolean;
    hiddenPaths: string[];
    showClusters: boolean;
    onShowPathsChanged: (showPaths: boolean) => void;
    onHiddenPathsChanged: (hiddenPaths: string[]) => void;
    onShowClustersChanged: (showClusters: boolean) => void;
}

// Component definition.
const MapMenu = (props: Props) => {
    // Initialize variables from props.
    const target = props.target;
    const paths = props.paths;
    const onShowPathsChanged = props.onShowPathsChanged;
    const onHiddenPathsChanged = props.onHiddenPathsChanged;
    const onShowClustersChanged = props.onShowClustersChanged;

    // Track the status of the switch buttons to force a re-render when they change.
    const [showPaths, setShowPaths] = useState(props.showPaths);
    const [hiddenPaths, setHiddenPaths] = useState<string[]>(props.hiddenPaths);
    const [showClusters, setShowClusters] = useState(props.showClusters);

    // Function to toggle the visibility of a path.
    const togglePathVisibility = (pathId: string) => {
        let updatedHiddenPaths;

        if (hiddenPaths.includes(pathId)) {
            updatedHiddenPaths = hiddenPaths.filter((id) => id.toString() != pathId.toString());
        } else {
            updatedHiddenPaths = [...hiddenPaths, pathId];
        }

        // Notify about the change.
        setHiddenPaths([...updatedHiddenPaths]);
        onHiddenPathsChanged([...updatedHiddenPaths]);
    };

    // Function to toggle the visibility of all routes.
    const toggleShowRoutes = (show: boolean) => {
        // Notify about the change.
        setShowPaths(show);
        onShowPathsChanged(show);
    };

   // Function to toggle the visibility of clusters.
    const toggleShowClusters = (show: boolean) => {
        setShowClusters(show);
        onShowClustersChanged(show);
    };

    return (
        <UncontrolledPopover
            placement="bottom"
            target={target}
            trigger="legacy"
        >
            <PopoverBody>
                {paths.map(path => (
                <FormGroup switch key={path.route.id}>
                    <Input
                        type="switch"
                        role="switch"
                        checked={!hiddenPaths.includes(path.route.id.toString())}
                        onChange={() => togglePathVisibility(path.route.id)}
                    />
                    <Label check>
                        Route {path.route.id} <FontAwesomeIcon icon={faSquare} color={path.route.color} fixedWidth />
                        <br/>
                        {path.route.name}
                    </Label>
                </FormGroup>
                ))}
                <hr/>
                <FormGroup switch>
                    <Input
                        type="switch"
                        role="switch"
                        checked={showPaths}
                        onChange={(e) => toggleShowRoutes(e.target.checked)}
                    />
                    <Label check>Show routes</Label>
                </FormGroup>
                <FormGroup switch>
                    <Input
                        type="switch"
                        role="switch"
                        checked={showClusters}
                        onChange={(e) => toggleShowClusters(e.target.checked)}
                    />
                    <Label check>Group near devices in clusters</Label>
                </FormGroup>
            </PopoverBody>
        </UncontrolledPopover>
    )
}

export default MapMenu;