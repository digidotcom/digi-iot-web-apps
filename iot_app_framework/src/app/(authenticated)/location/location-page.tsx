'use client';

import React from 'react';
import { Card, CardTitle } from 'reactstrap';

import MapComponent, { MapComponentRef } from '@components/map/map-component';
import IconButton from '@components/widgets/icon-button';
import { useDevicesContext } from '@contexts/devices-provider';
import { useRoutesContext } from '@contexts/routes-provider';
import { faCircleNotch, faCrosshairs, faGears } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LocationPage = () => {
    const { devices, isLoading } = useDevicesContext();
    const { routes } = useRoutesContext();

    // Reference to the map component.
    const ref = React.useRef<MapComponentRef>(null);

    // Register a callback to unselect any selection in the map when clicking anywhere in the page.
    React.useEffect(() => {
        document.body.addEventListener("click", (e) => unselectOnClick(e));
        return () => window.removeEventListener("click", (e) => unselectOnClick(e));
    }, []);

    /**
     * Unselects any selection in the map based on the given event.
     * 
     * @param e Mouse event.
     */
    const unselectOnClick = (e: MouseEvent) => {
        const targetElement = e.target as HTMLElement;

        // Check if the click is within the popup or switch area and stop propagation
        if (targetElement.closest(".popover") || targetElement.closest(".switch")) {
            return; // Do nothing if click is inside the menu
        }

        // @ts-ignore
        if (!e.target?.currentSrc || !e.target?.currentSrc.includes("maps.gstatic.com")) {
            ref.current?.unselectAll();
        }
    };

    return (
        <Card className="full-height">
            <CardTitle>
                Map View {isLoading && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
                <div className="toolbar">
                    <IconButton icon={faCrosshairs} title="Center view" onClick={() => ref.current?.centerMap()} />
                    <IconButton icon={faGears} title="Map options" id="PopoverLegacy" />
                </div>
            </CardTitle>
            <MapComponent
                ref={ref}
                menuTarget="PopoverLegacy"
                devices={devices}
                routes={routes}
            />
        </Card>
    );
};

export default LocationPage;
