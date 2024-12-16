'use client';

import React from 'react';
import { Card, CardTitle, ListGroup } from 'reactstrap';

import AlertItem from '@components/alerts/alert-item';
import Loading from '@components/widgets/loading';
import { MONITOR_ALERTS } from '@configs/app-config';
import { IAlertSummary } from '@customTypes/alert-types';
import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { getAlertDefinition } from '@services/drm/alert-definitions';
import { getAlerts } from '@services/drm/alerts';
import MonitorsManager from '@services/monitors-manager';
import { showError } from "@utils/toast-utils";
import { Mutex } from 'async-mutex';

// Props interface.
interface Props {
    group: string;
}

const AlertsList = (props: Props) => {
    const { group } = props;

    // Used to show a spinner when the alerts are being loaded.
    const [loadingAlerts, setLoadingAlerts] = React.useState(false);

    // Stores the list of alerts.
    const [alerts, setAlerts] = React.useState<IAlertSummary[]>([]);

    // Mutex for safe concurrent access.
    const mutex = new Mutex();

    // Keep a reference of the alerts list, which will be updated every time the original list changes.
    const alertsRef = React.useRef(alerts);
    React.useEffect(() => {
        alertsRef.current = alerts;
    }, [alerts]);

    // Get the list of alerts and register a monitor to be notified every time any alert changes.
    React.useEffect(() => {
        const fetchAlerts = async () => {
            setLoadingAlerts(true);
            // Get the current alerts.
            try {
                setAlerts(await getAlerts(group));
            } catch (e) {
                showError((e as AppError).message);
            }
            setLoadingAlerts(false);
            // Create a monitor to be notified when any alert changes.
            if (!MonitorsManager.monitorExists(MONITOR_ALERTS)) {
                try {
                    await MonitorsManager.createMonitor(MONITOR_ALERTS);
                } catch (e) {
                    showError((e as AppError).message);
                    return;
                }
            }
            // Register the monitor callback.
            try {
                MonitorsManager.registerMonitorCallback(MONITOR_ALERTS, monitorCallback);
            } catch (e) {
                showError((e as AppError).message);
            }
        };
        fetchAlerts();

        // Cleanup function.
        return () => {
            try {
                // Unregister the alerts callback.
                if (MonitorsManager.monitorExists(MONITOR_ALERTS)) {
                    MonitorsManager.unregisterMonitorCallback(MONITOR_ALERTS, monitorCallback);
                }
            } catch (e) {
                showError((e as AppError).message);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Called when the alerts monitor receives data.
     * 
     * @param data Received data in JSON format.
     * @param error Received error string.
     */
    const monitorCallback = async (data?: object, error?: string) => {
        // Sanity check.
        if (error) {
            showError(error);
            return;
        }

        const monitorAlerts = data as IAlertSummary[];
        if (!monitorAlerts || monitorAlerts.length == 0) {
            return;
        }
        // The monitor data contains an array of objects.
        monitorAlerts.forEach(async alert => {
            // Make sure the monitor message is an alert for simulated devices.
            if (!alert.group || !alert.group.startsWith(group)) {
                return;
            }

            // Use a mutex to avoid concurrent access/modifications in the alerts list.
            await mutex.runExclusive(async () => {
                const existingAlert = alertsRef.current.find(a => a.id == alert.id && a.source === alert.source);
                // If the alert already exists, update it.
                if (existingAlert) {
                    existingAlert.status = alert.status;
                    existingAlert.last_update = alert.last_update;
                    alertsRef.current.unshift(alertsRef.current.splice(alertsRef.current.indexOf(existingAlert), 1)[0]);
                    setAlerts([...alertsRef.current]);
                } else {
                    // New alerts coming from monitors do not have name, so find it.
                    const name = await getAlertName(alert.id, alertsRef.current);
                    alert.name = name;
                    setAlerts(prevAlerts => [alert, ...prevAlerts]);
                }
            });
        });
    };

    /**
     * Returns the name of the alert with the given ID.
     * 
     * @param id Alert ID.
     * @param alerts List of alerts.
     * 
     * @returns The name of the alert.
     */
    const getAlertName = async (id: number, alerts: IAlertSummary[]) => {
        // Check if there is any alert with the same ID to get its name.
        const foundAlert = alerts.find(a => a.id == id && a.name);
        if (foundAlert) {
            return foundAlert.name;
        }
        // Otherwise, get all alert definitions and find the name.
        try {
            const alertDefinition = await getAlertDefinition(id);
            if (alertDefinition) {
                return alertDefinition.name;
            }
        } catch (e) {
            showError((e as AppError).message);
        }
        return "Unknown alert";
    };

    /**
     * Sorts the given alert and moves it to the first position of the list.
     * 
     * @param alert Alert to sort.
     */
    const sortAlert = (alert: IAlertSummary) => {
        alertsRef.current.unshift(alertsRef.current.splice(alertsRef.current.indexOf(alert), 1)[0]);
        setAlerts([...alertsRef.current]);
    };

    return (
        <Card className="dashboard-top-card">
            <CardTitle>
                Alerts {loadingAlerts && <FontAwesomeIcon icon={faCircleNotch} size="sm" spin fixedWidth />}
            </CardTitle>
            {loadingAlerts ? (
                <Loading className="dashboard-card-loading" />
            ) : (
                <div className="alerts-container">
                    <ListGroup className="alerts-list">
                        {alerts?.map(alert => (
                            <AlertItem
                                key={`${alert.id}/${alert.source}`}
                                alert={alert}
                                sortAlert={sortAlert} />
                        ))}
                    </ListGroup>
                    {/* If there are no alerts, show a message. */}
                    {alerts && alerts.length == 0 && (
                        <div className="no-alerts-container">
                            <FontAwesomeIcon icon={faCheck} fixedWidth /> No alerts found
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default AlertsList;