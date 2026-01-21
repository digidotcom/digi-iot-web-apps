'use client';

import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';

import Chart, { ChartRef } from '@components/charts/chart';
import Loading from '@components/widgets/loading';
import { ColorStyles } from '@configs/style-constants';
import { faCircleNotch, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { getMaintenanceWindowStatus } from '@services/drm/reports';
import { CONTAINER_MIN_WIDTH, createImageCenterPlugin, getLegendInitialPosition } from '@utils/chart-utils';
import { useResizeObserver } from '@utils/react-utils';
import { showError } from '@utils/toast-utils';
import { IoTDevice } from '@models/IoTDevice';

// Props interface.
interface Props {
    group: string;
    watch_devices: IoTDevice[];
    title: string;
    labelInService?: string;
    labelInMaintenance?: string;
};

const CONTAINER_ID = "route-status-chart";

const MaintenanceStatusChart = (props: Props) => {
    const { group, watch_devices, title, labelInService, labelInMaintenance } = props;

    // Used to show a spinner when the maintenance status is being loaded.
    const [loadingMaintenanceStatus, setLoadingMaintenanceStatus] = React.useState(false);

    // Used to store the maintenance status summary (in service and in maintenance devices).
    const [maintenanceStatus, setMaintenanceStatus] = React.useState([0, 0]);

    // Reference to the chart.
    const chartRef = React.useRef<ChartRef>(null);

    // Used to track when the report is loaded.
    const [reportLoaded, setReportLoaded] = React.useState(false);

    // Chart image.
    const imageCenterPlugin = createImageCenterPlugin(faWrench, ColorStyles.darkGray);

    // Get the maintenance window status.
    React.useEffect(() => {
        const fetchMaintenanceWindowStatus = async () => {
            setLoadingMaintenanceStatus(true);
            try {
                setMaintenanceStatus(await getMaintenanceWindowStatus(group));
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingMaintenanceStatus(false);
            setReportLoaded(true);
        };
        fetchMaintenanceWindowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the chart when the devices watch list changes.
    React.useEffect(() => {
        // Updates in the list should be attended only after the report is loaded.
        if (!reportLoaded) {
            return;
        }
        let newMaintenanceStatus = [0, 0];
        watch_devices.forEach(device => {
            if (device.maintenance) {
                newMaintenanceStatus[1] += 1;
            } else {
                newMaintenanceStatus[0] += 1;
            }
        });
        setMaintenanceStatus(newMaintenanceStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch_devices]);

    // Adjust the legend position based on the container width.
    useResizeObserver(CONTAINER_ID, (width, height) => {
        chartRef.current?.setLegendPosition(width > CONTAINER_MIN_WIDTH ? "right" : "bottom");
    });

    return (
        <Card className="dashboard-top-card">
            <CardTitle>
                {title} {loadingMaintenanceStatus && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
            </CardTitle>
            <CardBody id={CONTAINER_ID}>
                {loadingMaintenanceStatus ? (
                    <Loading className="dashboard-card-loading" />
                ) : (
                    <div className="full-height">
                        <Chart
                            ref={chartRef}
                            type="doughnut"
                            data={{
                                labels: [labelInService ?? "In service", labelInMaintenance ?? "In maintenance"],
                                datasets: [
                                    {
                                        data: [maintenanceStatus[0], maintenanceStatus[1]],
                                        backgroundColor: [ColorStyles.successGreen, ColorStyles.failureRed]
                                    }
                                ]
                            }}
                            options={{
                                maintainAspectRatio: false,
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

export default MaintenanceStatusChart;