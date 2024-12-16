'use client';

import { ChartOptions } from 'chart.js';
import { useEffect, useState } from 'react';

import Chart from '@components/charts/chart';
import IconButton from '@components/widgets/icon-button';
import Loading from '@components/widgets/loading';
import { DEFAULT_SAMPLES_NUMBER } from '@configs/app-config';
import { ColorStyles } from '@configs/style-constants';
import { IoTDeviceProperty } from '@customTypes/device-types';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { AppError } from '@models/AppError';
import { loadSamples } from '@utils/samples-utils';
import { showError } from '@utils/toast-utils';

const CHART_OPTIONS: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            type: "time",
            time: {
                unit: "minute",
                minUnit: "minute",
                stepSize: 2
            },
            ticks: {
                source: "auto"
            }
        }],
        yAxes: [{
            ticks: {
                stepSize: 20
            }
        }]
    }
};

// Interface to exchange data using props.
interface Props {
    property: IoTDeviceProperty;
    numSamples?: number;
}

// Component definition.
const PropertyChart = (props: Props) => {
    // Initialize variables from props.
    const {
        property,
        numSamples = DEFAULT_SAMPLES_NUMBER
    } = props;

    // Track when data points are being loaded.
    const [loadingDatapoints, setLoadingDatapoints] = useState<boolean>(false);

    // Keep track of data-points loading error.
    const [errorMessage, setErrorMessage] = useState<string | undefined>("");

    // Check if datapoints must be loaded.
    useEffect(() => {
        if (!property.samplesHistoryRead) {
            refreshSamples();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.property]);

    // Refresh the property samples.
    const refreshSamples = async () => {
        setErrorMessage("");
        setLoadingDatapoints(true);
        try {
            await loadSamples(property, numSamples);
            setLoadingDatapoints(false);
        } catch (e) {
            setErrorMessage("Error loading samples");
            showError((e as AppError).message);
        }
    };

    return (
        <div className="iot-property-chart-container">
            {errorMessage ? (
                <div className="iot-property-chart-error">
                    <IconButton icon={faArrowsRotate} color={ColorStyles.actionButton} size="2x" onClick={refreshSamples}/>
                    <p>{errorMessage}</p>
                </div>
            ) : (
                loadingDatapoints ? (
                    <Loading className="iot-property-chart-loading" />
                    ) : (
                    <Chart
                        type="line"
                        data={{
                            datasets: [
                                {
                                    label: property.name,
                                    data: property.samplesHistory?.map(sample => ({
                                        x: new Date(sample.timeStamp),
                                        y: Number(sample.value)
                                    })),
                                    borderColor: property.color
                                }
                            ]
                        }}
                        showLegend={false}
                        options={CHART_OPTIONS}
                    />
                )
            )}
        </div>
    );
};

export default PropertyChart;