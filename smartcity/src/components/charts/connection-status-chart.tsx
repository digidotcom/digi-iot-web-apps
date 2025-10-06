'use client';

import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';

import Chart, { ChartRef } from '@components/charts/chart';
import Loading from '@components/widgets/loading';
import { ColorStyles } from '@configs/style-constants';
import { useBusesContext } from '@contexts/buses-provider';
import { faCircleNotch, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { getConnectionStatus } from '@services/drm/reports';
import { CONTAINER_MIN_WIDTH, createImageCenterPlugin, getLegendInitialPosition } from '@utils/chart-utils';
import { useResizeObserver } from '@utils/react-utils';
import { showError } from '@utils/toast-utils';

// Props interface.
interface Props {
    group?: string;
};

const CONTAINER_ID = "connection-status-chart";

const ConnectionStatusChart = (props: Props) => {
    const { group } = props;

    // Used to show a spinner when the connection status is being loaded.
    const [loadingConnectionStatus, setLoadingConnectionStatus] = React.useState(false);

    // Used to store the connection status summary (connected and disconnected devices).
    const [connectionStatus, setConnectionStatus] = React.useState([0, 0]);

    // Reference to the chart.
    const chartRef = React.useRef<ChartRef>(null);

    // Used to track when the report is loaded.
    const [reportLoaded, setReportLoaded] = React.useState(false);

    // Track the list of buses.
    const { buses } = useBusesContext();

    // Chart image.
    const imageCenterPlugin = createImageCenterPlugin(faLink, ColorStyles.darkGray);

    // Get the connection status.
    React.useEffect(() => {
        const fetchConnectionStatus = async () => {
            setLoadingConnectionStatus(true);
            try {
                setConnectionStatus(await getConnectionStatus(group));
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingConnectionStatus(false);
            setReportLoaded(true);
        };
        fetchConnectionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the chart when the buses list changes.
    React.useEffect(() => {
        // Updates in the list should be attended only after the report is loaded.
        if (!reportLoaded) {
            return;
        }
        let newConnectionStatus = [0, 0];
        buses.forEach(bus => {
            if (bus.connected) {
                newConnectionStatus[0] += 1;
            } else {
                newConnectionStatus[1] += 1;
            }
        });
        setConnectionStatus(newConnectionStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buses]);

    // Adjust the legend position based on the container width.
    useResizeObserver(CONTAINER_ID, (width, height) => {
        chartRef.current?.setLegendPosition(width > CONTAINER_MIN_WIDTH ? "right" : "bottom");
    });

    return (
        <Card className="dashboard-top-card">
            <CardTitle>
                Connection Status {loadingConnectionStatus && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
            </CardTitle>
            <CardBody id={CONTAINER_ID}>
                {loadingConnectionStatus ? (
                    <Loading className="dashboard-card-loading" />
                ) : (
                    <div className="full-height">
                        <Chart
                            ref={chartRef}
                            type="doughnut"
                            data={{
                                labels: ["Connected", "Disconnected"],
                                datasets: [{
                                    data: [connectionStatus[0], connectionStatus[1]],
                                    backgroundColor: [ColorStyles.successGreen, ColorStyles.failureRed]
                                }]
                            }}
                            options={{
                                maintainAspectRatio: false
                            }}
                            legendPosition={getLegendInitialPosition(CONTAINER_ID)}
                            showCountInLegend={true}
                            plugins={[imageCenterPlugin]}
                        />
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default ConnectionStatusChart;