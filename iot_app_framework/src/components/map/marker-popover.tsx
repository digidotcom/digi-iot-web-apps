'use client';

import { Button } from "reactstrap";
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas, faSquare, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoTDevice } from '@models/IoTDevice';
import { resolveIcon } from '@utils/icon-utils';
import { ColorStyles } from '@configs/style-constants';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// Register all icon packs for dynamic usage
library.add(fas, far);

// Interface for defining custom button configuration
export interface MarkerPopoverButtonConfig {
    text?: string;
    icon?: IconProp;
    disabled: boolean;
    onClick: () => void;
}

// Interface to exchange data using props.
interface Props {
    device: IoTDevice;
    buttonConfig: MarkerPopoverButtonConfig;
}

// Component definition
const MarkerPopover = ({device, buttonConfig}: Props) => {
    return (
        <div key={device.id}>
            <FontAwesomeIcon icon={resolveIcon(device.faIcon) as any} fixedWidth />
            <strong>{device.name}</strong>{device.maintenance && " (in maintenance)"}<br/>
            {device.route && <div><FontAwesomeIcon icon={faSquare} color={device.route.color} fixedWidth /> <strong>Route {device.route.id}</strong> ({device.route.name})</div>}
            {device.incidence && device.incidenceDate && <div><FontAwesomeIcon icon={faTriangleExclamation} color={ColorStyles.warningYellow} fixedWidth /> Incidence on {device.incidenceDate.toLocaleString()}</div>}
            <hr className="marker-popover-separator" />
            {
                device.properties && device.properties.map(property => property.visible && (
                    <div key={property.id}>
                        <FontAwesomeIcon icon={resolveIcon(property.faIcon) as any} fixedWidth />
                        {` ${property.name}:`} <strong>{property.value ? `${property.value} ${property.units ?? ""}` : "-"}</strong><br/>
                    </div>
                ))
            }
            <hr className="marker-popover-separator" />
            Device ID: {device.id.substring(18)}<br/>
            Last update: {device.lastUpdate?.toLocaleString()}<br/><br/>
            <Button
                color="primary"
                style={{ width: "100%" }}
                disabled={buttonConfig.disabled}
                onClick={buttonConfig.onClick}
            >
                {buttonConfig.icon != undefined && <FontAwesomeIcon icon={buttonConfig.icon} fixedWidth />}
                {buttonConfig.text != undefined && buttonConfig.text}
            </Button>
        </div>
    );
};

export default MarkerPopover;