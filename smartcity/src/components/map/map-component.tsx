'use client';

import React, { Ref, useEffect } from 'react';
import _ from 'lodash';

import MapMenu from '@components/map/map-menu';
import { IoTRoute } from '@customTypes/device-types';
import { DeviceMarker, RoutePath } from '@customTypes/map-types';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { IoTDevice } from '@models/IoTDevice';
import { MarkerF, MarkerClustererF, PolylineF, Libraries, GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import { removeElementById, renderHoverMessage } from '@utils/hover-message-utils';
import { DEFAULT_ZOOM_LEVEL, DEFAULT_CENTER, DEFAULT_OPTIONS, getMarkersFromDevices, getPathsFromRoutes, coordsToLatLng } from '@utils/map-utils';
import { BASE_PATH } from '@configs/app-config';

// Constants.
const LOCAL_VAR_HIDDEN_PATHS = "hiddenPaths";
const LOCAL_VAR_PREVIOUS_LOCATION = "previousMapLocation";
const LOCAL_VAR_SHOW_PATHS = "showPaths";

const googleAPIKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

const MARKER_POPOVER_ID = "marker-popover";

const LIBRARIES: Libraries = ['geometry', 'drawing', 'places'];

// Interface to exchange data using props.
interface Props {
    devices: IoTDevice[],
    routes: IoTRoute[],
    menuTarget?: string,
    autoCenter?: boolean,
    allowSelection?: boolean,
    forceShowRoutes?: boolean
    saveLocation?: boolean
}

// Interface with the methods exposed to the parent component.
export interface MapComponentRef {
    centerMap: () => void;
    unselectAll: () => void;
}

// Component definition.
const MapComponent = React.forwardRef((props: Props, ref: Ref<MapComponentRef>) => {
    const {
        devices,
        routes,
        menuTarget,
        autoCenter = false,
        allowSelection = true,
        forceShowRoutes = false,
        saveLocation = true,
    } = props;

    // Method used to unslect the current selected path if any.
    const unselectAll = () => {
        // Hide the marker popovers (if any).
        removeElementById(MARKER_POPOVER_ID);
        // Unselect the current selected route (if any).
        selectedPath.current = undefined;
        // Restore opacity of all lines.
        pathsListRef.current.forEach(path => path.opacity = 1.0);
        setPathsList([...pathsList]);
        // Restore opacity of all markers.
        markersListRef.current.forEach(marker => marker.opacity = 1.0);
        setMarkersList([...markersList]);
    };

    // Map variables that will trigger a page re-render whenever any of them change.
    const [center, setCenter] = React.useState<google.maps.LatLng | google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [zoom, setZoom] = React.useState<number>(DEFAULT_ZOOM_LEVEL);
    const [isReady, setReady] = React.useState<boolean>(false);
    const [showPaths, setShowPaths] = React.useState(localStorage.getItem(LOCAL_VAR_SHOW_PATHS) !== "false");
    const [hiddenPaths, setHiddenPaths] = React.useState<string[]>(
        () => {
            const storedHiddenPaths = localStorage.getItem(LOCAL_VAR_HIDDEN_PATHS)
            return storedHiddenPaths ? storedHiddenPaths.split(',') : [];
        }
    );
    const [pathsList, setPathsList] = React.useState<RoutePath[]>(getPathsFromRoutes(routes, hiddenPaths));
    const [markersList, setMarkersList] = React.useState<DeviceMarker[]>(getMarkersFromDevices(devices, [], forceShowRoutes ? [] : hiddenPaths, unselectAll));

    // Map reference variables.
    const bounds = React.useRef<google.maps.LatLngBounds>();
    const xCoordinate = React.useRef<number>();
    const yCoordinate = React.useRef<number>();
    const map = React.useRef<google.maps.Map>();
    const selectedPath = React.useRef<RoutePath>();
    const markersListRef = React.useRef<DeviceMarker[]>(markersList);
    const pathsListRef = React.useRef<RoutePath[]>(pathsList);

    // Update the markers list reference variable whenever the markers list variable changes.
    useEffect(() => {
        markersListRef.current = markersList;
        if (autoCenter) {
            centerMap();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markersList]);

    // Update the paths list reference variable whenever the paths list variable changes.
    useEffect(() => {
        pathsListRef.current = pathsList;
    }, [pathsList]);

    // Define the 'isLoaded' variable after the Map library loads.
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        libraries: LIBRARIES,
        googleMapsApiKey: googleAPIKey
    });

    // Save the mouse position to know where to open the marker popovers.
    const onMouseUpdate = (e: MouseEvent) => {
        xCoordinate.current = e.clientX;
        yCoordinate.current = e.clientY;
    };

    // Method called as soon as the map is ready to position and center the map view.
    React.useEffect(() => {
        if (isReady) {
            if (autoCenter) {
                centerMap();
                return;
            }
            // Try to load previous map location.
            const view = localStorage.getItem(LOCAL_VAR_PREVIOUS_LOCATION);
            if (view && view !== 'undefined') {
                map.current?.fitBounds(JSON.parse(view), 0);
            } else if (navigator.geolocation) {
                // Try to position map based on navigator provided location.
                navigator.geolocation.getCurrentPosition((position) => {
                    const { coords } = position;
                    if (coords) {
                        const { latitude, longitude } = coords;
                        if (map && map.current) {
                            map.current.panTo({ lat: latitude, lng: longitude });
                        }
                    }
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]);

    // Method called whenever the devices list changes to update the markers.
    React.useEffect(() => {
        setMarkersList(getMarkersFromDevices(devices, markersList, forceShowRoutes ? [] : hiddenPaths, unselectAll));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devices]);

    // Keep track of the mouse position as long as the component is visible.
    React.useEffect(() => {
        document.addEventListener('mousemove', onMouseUpdate);
        document.addEventListener('mouseenter', onMouseUpdate);
        return () => {
            document.removeEventListener('mousemove', onMouseUpdate);
            document.removeEventListener('mouseenter', onMouseUpdate);
        };
    }, []);

    // Method called whenever the map view (center, pan) changes to save the new map bounds.
    React.useEffect(() => {
        if (isReady) {
            bounds.current = map.current?.getBounds();
            // Save last known location to local storage.
            if (bounds.current && saveLocation) {
                localStorage.setItem(LOCAL_VAR_PREVIOUS_LOCATION, JSON.stringify(bounds.current));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, center, isReady]);

    // Method called when the map is idle, it means, it is called after a zoom/span action finishes.
    const onIdle = () => {
        // Hide the marker popovers (if any).
        removeElementById(MARKER_POPOVER_ID);
        // Notify that map is ready to center the view the first time it is ready.
        if (!isReady) {
            setReady(true);
        }
        // Retrieve current map zoom and center values.
        if (!saveLocation)
            return;
        const _zoom = map.current?.getZoom();
        const _center = map.current?.getCenter();
        // Notify whether center and zoom values have changed.
        if (_zoom && _center && (zoom !== _zoom || !_.isEqual(_center?.toJSON(), center))) {
            setZoom(_zoom);
            setCenter(_center);
        }
    };

    // Method used to center the map view based on the visible markers.
    const centerMap = () => {
        // Sanity check.
        if (markersListRef.current.length == 0)
            return;

        // List latitudes and longitudes of all visible markers.
        const lats = markersListRef.current.filter(marker => marker.visible && marker.device.position !== undefined).map(marker => marker.device.position!.lat);
        const lngs = markersListRef.current.filter(marker => marker.visible && marker.device.position !== undefined).map(marker => marker.device.position!.lng);
        if (lats.length == 0 || lngs.length == 0)
            return;
        // Extract location limits.
        const south = Math.min(...(lats));
        const north = Math.max(...(lats));
        const west = Math.min(...(lngs));
        const east = Math.max(...(lngs));
        // Center the location limits.
        map.current?.fitBounds({
            north,
            south,
            east,
            west
        });
        if (autoCenter) {
            map.current?.setZoom((map.current?.getZoom() ?? DEFAULT_ZOOM_LEVEL) - 3);
        }
    };

    // Expose required methods to outer layers.
    React.useImperativeHandle(ref, () => ({
        centerMap,
        unselectAll
    }));

    // Method called when the show paths value changes in the menu.
    const onShowPathsChanged = (showPaths: boolean) => {
        localStorage.setItem(LOCAL_VAR_SHOW_PATHS, showPaths.toString());
        setShowPaths(showPaths);
    }

    // Method called when the hidden paths value changes in the menu.
    const onHiddenPathsChanged = (hiddenPaths: string[]) => {
        pathsList.forEach(path => {
            path.visible = !hiddenPaths.includes(path.route.id.toString());
        });
        markersList.forEach(marker => {
            marker.visible = !marker.device.route || !hiddenPaths.includes(marker.device.route.id.toString());
        });
        localStorage.setItem(LOCAL_VAR_HIDDEN_PATHS, hiddenPaths.join(","));
        setHiddenPaths([...hiddenPaths]);
        setPathsList([...pathsList]);
        setMarkersList([...markersList]);
    }

    // Function to handle a marker selection event.
    const onMarkerSelected = (marker: DeviceMarker) => {
        unselectAll();
        if (!marker || !allowSelection)
            return;

        renderMarkerPopover(marker);
        // Check if there is a path associated.
        const path = pathsList.find(path => path.route.id == marker.device.route?.id);
        if (path) {
            // Select the path.
            selectedPath.current = path;
            // Reduce opacity of the rest of paths.
            pathsList.forEach(p => p.opacity = p.route.id == path.route.id ? 1.0 : 0.3);
            setPathsList([...pathsList]);
            // Reduce opacity of the rest of markers.
            markersList.forEach(m => m.opacity = m.device.id == marker.device.id ? 1.0 : 0.5);
            setMarkersList([...markersList]);
        }
    }

    // Render the marker popover.
    const renderMarkerPopover = (marker: DeviceMarker) => {
        renderHoverMessage(MARKER_POPOVER_ID, marker.popover, xCoordinate.current ?? 0, yCoordinate.current ?? 0);
    };

    // Render the map markers.
    const renderMarkers = (clusterer: Clusterer | MarkerClusterer | undefined) => (markersList.length > 0)
            && markersList.filter(marker => marker.visible && marker.device.position !== undefined).map(marker => {
                return (
                    <MarkerF
                        key={marker.device.id}
                        position={marker.device.position!}
                        onClick={() => onMarkerSelected(marker)}
                        icon={marker.device.connected
                            ? (marker.device.maintenance
                                ? `${BASE_PATH ? `${BASE_PATH}/` : ''}${marker.device.markerImage.maintenance}`
                                : `${BASE_PATH ? `${BASE_PATH}/` : ''}${marker.device.markerImage.connected}`)
                            : `${BASE_PATH ? `${BASE_PATH}/` : ''}${marker.device.markerImage.disconnected}`}
                        clusterer={clusterer}
                        opacity={marker.opacity}
                    />
                );
            }
    );

    // Render the map components: markers and paths.
    const renderMapComponents = () => {
        return (
            <>
                <MarkerClustererF
                    averageCenter
                    options={{
                        imagePath: `${BASE_PATH}/images/m`
                    }}
                    enableRetinaIcons
                    gridSize={60}
                    maxZoom={15}
                >
                    {(clusterer) => renderMarkers(clusterer) as any}
                </MarkerClustererF>
                {pathsList.map(path => (
                    <PolylineF
                        key={path.route.id}
                        path={coordsToLatLng(path.route.coordinates)}
                        visible={selectedPath.current?.route.id == path.route.id || (showPaths && path.visible) || forceShowRoutes}
                        options={{
                            strokeColor: path.route.color,
                            strokeOpacity: path.opacity,
                            clickable: false
                        }}
                    />
                ))}
            </>
        );
    };

    // Draw the map element only if it is loaded.
    if (isLoaded) {
        return (
            <>
                <GoogleMap
                    options={DEFAULT_OPTIONS}
                    mapContainerClassName="google-map"
                    mapContainerStyle={{width: '100%', height: '100%'}}
                    center={center}
                    zoom={zoom}
                    clickableIcons={false}
                    onMouseDown={unselectAll}
                    onLoad={m => {map.current = m}}
                    onUnmount={() => map.current = undefined}
                    onIdle={onIdle}
                >
                    {renderMapComponents()}
                </GoogleMap>
                {menuTarget && (
                    <MapMenu
                        target={menuTarget}
                        paths={pathsList}
                        showPaths={showPaths}
                        hiddenPaths={hiddenPaths}
                        onShowPathsChanged={onShowPathsChanged}
                        onHiddenPathsChanged={onHiddenPathsChanged}
                    />
                )}
            </>
        );
    }
    return <span />;
});

MapComponent.displayName = "MapComponent";

export default MapComponent;
