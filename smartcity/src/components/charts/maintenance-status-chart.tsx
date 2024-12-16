'use client';

import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';

import Chart, { ChartRef } from '@components/charts/chart';
import Loading from '@components/widgets/loading';
import { ColorStyles } from '@configs/style-constants';
import { useBusesContext } from '@contexts/buses-provider';
import { faCircleNotch, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { getMaintenanceWindowStatus } from '@services/drm/reports';
import { createImageCenterPlugin } from '@utils/chart-utils';
import { useResizeObserver } from '@utils/react-utils';
import { showError } from '@utils/toast-utils';

// Props interface.
interface Props {
    group: string;
    labelInMaintenance?: string;
    labelNotInMaintenance?: string;
};

const CONTAINER_ID = "route-status-chart";

const MaintenanceStatusChart = (props: Props) => {
    const { group, labelInMaintenance, labelNotInMaintenance } = props;

    // Used to show a spinner when the route status is being loaded.
    const [loadingRouteStatus, setLoadingRouteStatus] = React.useState(false);

    // Used to store the route status summary (in route and out for route devices).
    const [routeStatus, setRouteStatus] = React.useState([0, 0]);

    // Reference to the chart.
    const chartRef = React.useRef<ChartRef>(null);

    // Used to track when the report is loaded.
    const [reportLoaded, setReportLoaded] = React.useState(false);

    // Track the list of buses.
    const { buses } = useBusesContext();

    // Chart image.
    const imageCenterPlugin = createImageCenterPlugin(faWrench, ColorStyles.darkGray);

    // Get the maintenance window status.
    React.useEffect(() => {
        const fetchMaintenanceWindowStatus = async () => {
            setLoadingRouteStatus(true);
            try {
                setRouteStatus(await getMaintenanceWindowStatus(group));
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingRouteStatus(false);
            setReportLoaded(true);
        };
        fetchMaintenanceWindowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the chart when the buses list changes.
    React.useEffect(() => {
        // Updates in the list should be attended only after the report is loaded.
        if (!reportLoaded) {
            return;
        }
        let newRouteStatus = [0, 0];
        buses.forEach(bus => {
            if (bus.maintenance) {
                newRouteStatus[1] += 1;
            } else {
                newRouteStatus[0] += 1;
            }
        });
        setRouteStatus(newRouteStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buses]);

    // Adjust the legend position based on the container width.
    useResizeObserver(CONTAINER_ID, (width, height) => {
        chartRef.current?.setLegendPosition(width > 300 ? "right" : "bottom");
    });

    return (
        <Card className="dashboard-top-card">
            <CardTitle>
                Route Status {loadingRouteStatus && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
            </CardTitle>
            <CardBody id={CONTAINER_ID}>
                {loadingRouteStatus ? (
                    <Loading className="dashboard-card-loading" />
                ) : (
                    <div className="full-height">
                        <Chart
                            ref={chartRef}
                            type="doughnut"
                            data={{
                                labels: [labelNotInMaintenance ?? "Not in maintenance", labelInMaintenance ?? "In maintenance"],
                                datasets: [
                                    {
                                        data: [routeStatus[0], routeStatus[1]],
                                        backgroundColor: [ColorStyles.successGreen, ColorStyles.failureRed]
                                    }
                                ]
                            }}
                            options={{
                                maintainAspectRatio: false,
                            }}
                            legendPosition="right"
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