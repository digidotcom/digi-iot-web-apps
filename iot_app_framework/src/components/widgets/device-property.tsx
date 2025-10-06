'use client';

import { useEffect, useRef, useState } from 'react';

import PropertyChart from '@components/charts/property-chart';
import IconButton from '@components/widgets/icon-button';
import { ColorStyles } from '@configs/style-constants';
import { IoTDeviceProperty } from '@customTypes/device-types';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faChartColumn, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { resolveIcon } from '@utils/icon-utils';

// Register all icon packs for dynamic usage.
library.add(fas);

// Interface to exchange data using props.
interface Props {
    property: IoTDeviceProperty | undefined;
    deviceID: string;
    showTopbarIcon?: boolean;
    enableHistogram?: boolean;
    histogramSamples?: number;
}

// Component definition.
const DeviceProperty = (props: Props) => {
    // Initialize variables from props.
    const {
        property,
        deviceID,
        showTopbarIcon = false,
        enableHistogram = true,
        histogramSamples
    } = props;

    // Keep track of the visibility of the chart.
    const [showChart, setShowChart] = useState<boolean>(false);
    // keep track of the glowing state.
    const [isGlowing, setIsGlowing] = useState(false);
    const prevLastUpdateRef = useRef<Date | undefined>(undefined);
    const prevDeviceIdRef = useRef<string>(deviceID);

    // Trigger a glowing effect on the header circle every time the value is updated.
    useEffect(() => {
        // If the bus/device ID has changed, skip the glow effect and reset the previous reference.
        if (prevDeviceIdRef.current !== deviceID) {
            prevDeviceIdRef.current = deviceID;
            prevLastUpdateRef.current = property?.lastUpdate || undefined;
            return;
        }

        // If it's the same bus/device, compare the previous lastUpdate with the current one.
        if (prevLastUpdateRef.current !== undefined && prevLastUpdateRef?.current !== property?.lastUpdate) {
            // Trigger the glow effect for 1 second
            setIsGlowing(true);
            const timer = setTimeout(() => {
                setIsGlowing(false);
            }, 1000);

            // Cleanup the timer when the component unmounts or when lastUpdate changes
            return () => clearTimeout(timer);
        }

        // Update the reference value for the next effect.
        prevLastUpdateRef.current = property?.lastUpdate || undefined;
    }, [property?.lastUpdate, deviceID]);

    // Toggle chart view.
    const handleShowChartPressed = () => {
        setShowChart(!showChart);
    }

    return (
        <div className="iot-property-container">
            {property ? (
                <>
                    <div className="iot-property-topbar">
                        <div className={`iot-property-update-circle ${isGlowing ? 'iot-property-update-circle-glowing' : ''}`}></div>
                        {showTopbarIcon && <FontAwesomeIcon icon={resolveIcon(property.faIcon) as any} className="iot-property-name-icon" color={property.color} />}
                        <span className="iot-property-name">{property.name}</span>
                        {enableHistogram && <IconButton icon={showChart ? faList : faChartColumn} title={showChart ? "Show current value" : "Show historic data"} onClick={handleShowChartPressed} size="24px" color={ColorStyles.actionButton} />}
                    </div>
                    {showChart ? (
                        <PropertyChart property={property} numSamples={histogramSamples} />
                    ) : (
                    <>
                        <div className="iot-property-content">
                            <div className="iot-property-icon-content">
                                {property.faIcon ? (
                                    <FontAwesomeIcon
                                        icon={resolveIcon(property.faIcon) as any}
                                        className="iot-property-icon"
                                        fixedWidth
                                        color={property.color}
                                    />
                                ) : (
                                    <span><i>No icon</i></span>
                                )}
                            </div>
                            <div className="iot-property-value-container">
                                <div className={`iot-property-value ${isGlowing ? 'iot-property-value-glowing' : ''}`}>
                                    <span className="value">{property.value}</span>
                                    <span className="units">{property.units}</span>
                                </div>
                            </div>
                        </div>
                        <div className="iot-property-last-update">
                            Last update: <span>{property.lastUpdate ? new Date(property.lastUpdate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}) : "never"}</span>
                        </div>
                    </>
                    )}
                </>
            ) : (
                <i>Property not found</i>
            )}
        </div>
    );
};

export default DeviceProperty;