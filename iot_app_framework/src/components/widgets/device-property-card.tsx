'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoTDeviceProperty } from '@customTypes/device-types';
import { resolveIcon } from '@utils/icon-utils';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';

// Interface to exchange data using props.
interface Props {
    property: IoTDeviceProperty | undefined;
    sublabel?: string;
}

// Format property value: round numbers to 2 decimals if needed, uppercase strings
const formatPropertyValue = (value: string | undefined): string => {
    if (value === undefined || value === null) return "-";
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value.includes('.')) {
        return numValue.toFixed(2);
    }
    return value.toUpperCase();
};

const DevicePropertyCard = ({ property, sublabel }: Props) => {
    // Keep track of the glowing state.
    const [isGlowing, setIsGlowing] = useState(false);
    const prevValueRef = useRef<number | string | undefined>(undefined);
    const prevLastUpdateRef = useRef<number | undefined>(undefined);

    // Trigger a glowing effect every time the value is updated.
    useEffect(() => {
        if (!property) {
            return;
        }
        const currentValue = property.value;
        const currentLastUpdate = property.lastUpdate ? new Date(property.lastUpdate).getTime() : undefined;

        // Check if either the value or lastUpdate has changed
        const valueChanged = prevValueRef.current !== undefined && prevValueRef.current !== currentValue;
        const lastUpdateChanged = prevLastUpdateRef.current !== undefined &&
                                  currentLastUpdate !== undefined &&
                                  prevLastUpdateRef.current !== currentLastUpdate;

        if (valueChanged || lastUpdateChanged) {
            // Trigger the glow effect for 1 second.
            setIsGlowing(true);
            const timer = setTimeout(() => {
                setIsGlowing(false);
            }, 1000);

            // Cleanup the timer when the component unmounts or when the effect re-runs
            return () => clearTimeout(timer);
        }

        // Update the reference values for the next effect.
        prevValueRef.current = currentValue;
        prevLastUpdateRef.current = currentLastUpdate;
    }, [property?.value, property?.lastUpdate])

    return (
        <div className="iot-property-card" style={{borderLeft: `4px solid ${property?.color}`}}>
            <div className="iot-property-card-header">
                <div className="iot-property-card-icon" style={{color: `${property?.color}`}}>
                    <FontAwesomeIcon icon={resolveIcon(property?.faIcon) as any || faQuestion} size="xl" />
                </div>
                <div className="iot-property-card-label">{property?.name || "-"}</div>
            </div>
            <div className={`iot-property-card-value ${isGlowing ? 'iot-property-value-glowing' : ''}`}>{formatPropertyValue(property?.value)}<span className={`iot-property-card-units  ${isGlowing ? 'iot-property-value-glowing' : ''}`}>{property?.units ?? ""}</span></div>
            <div className={`iot-property-card-sublabel ${isGlowing ? 'iot-property-value-glowing' : ''}`}>{sublabel ?? `Last update: ${property?.lastUpdate ? new Date(property?.lastUpdate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}) : "never"}`}</div>
        </div>
    );
};

export default DevicePropertyCard;
