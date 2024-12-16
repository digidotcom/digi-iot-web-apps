import MarkerPopover from '@components/map/marker-popover';
import { IoTRoute } from '@customTypes/device-types';
import { DeviceMarker, RoutePath } from '@customTypes/map-types';
import { IoTDevice } from '@models/IoTDevice';

// Constants.
export const DEFAULT_ZOOM_LEVEL = 3;

export const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 20.0, lng: 0.0 };

export const DEFAULT_OPTIONS = {
    streetViewControl: false,
    styles: [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
    ]
};

/**
 * Creates a MarkerPopover component for the given IoTDevice.
 * 
 * @param device The IoTDevice to create the MarkerPopover for.
 * @param closePopup Method to execute when the popover requests to be closed.
 * 
 * @returns A MarkerPopover component for the given device.
 */
const getMarkerPopover = (device: IoTDevice, closePopup: () => void) => {
    return (
        <MarkerPopover key={device.id} device={device} closePopup={closePopup} />
    );
};

/**
 * Converts an array of IoTDevice objects into an array of DeviceMarker objects.
 * 
 * @param devices An array of IoTDevice objects that represent devices on the map.
 * @param currentMarkers An array of DeviceMarker containing the current list of map markers.
 * @param hiddenPaths An array with the IDs of the paths that should be hidden.
 * @param closePopup Method to execute when the marker popover requests to be closed.
 * 
 * @returns An array of DeviceMarker objects to draw in the map.
 */
export const getMarkersFromDevices = (devices: IoTDevice[], currentMarkers: DeviceMarker[], hiddenPaths: string[], closePopup: () => void): DeviceMarker[] => {
    let marker
    return devices.map(device => {
        // Check if there is a marker for the device. In that case just update device related fields.
        let marker = currentMarkers?.find(marker => marker.device.id == device.id);
        if (marker) {
            marker.device = device;
            marker.popover = getMarkerPopover(device, closePopup);
        } else {
            marker = {
                device: device,
                visible: !device.route || !hiddenPaths.includes(device.route.id.toString()),
                opacity: 1,
                popover: getMarkerPopover(device, closePopup)
            };
        }
        return marker;
    });
};

/**
 * Converts an array of IoTRoute objects into an array of RoutePath objects.
 * 
 * @param routes An array of IoTRoute objects representing paths or routes on the map.
 * @param hiddenPaths An array with the IDs of the paths that should be hidden.
 * 
 * @returns An array of RoutePath objects with default properties such as hidden set
 *          to `false` and opacity set to `1`.
 */
export const getPathsFromRoutes = (routes: IoTRoute[], hiddenPaths: string[]): RoutePath[] => {
    return routes.map(route => ({
        route: route,
        visible: !hiddenPaths.includes(route.id.toString()),
        opacity: 1
    }));
};

/**
 * Converts an array of coordinates into an array of google.maps.LatLngLiteral objects.
 * 
 * @param coords An array of coordinate pairs where each pair is a tuple of [latitude,
 *                 longitude].
 * 
 * @returns An array of google.maps.LatLngLiteral objects for use in Google Maps.
 */
export const coordsToLatLng = (coords: []) => {
    const latLng: google.maps.LatLngLiteral[] = [];
    coords.forEach(coord => latLng.push({lat: coord[0], lng: coord[1]}));

    return latLng;
};