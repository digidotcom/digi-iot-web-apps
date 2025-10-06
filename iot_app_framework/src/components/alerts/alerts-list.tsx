'use client';

import AlertItem from '@components/alerts/alert-item';
import Loading from '@components/widgets/loading';
import { useAlertsContext } from '@contexts/alerts-provider';
import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import alertsManager from '@services/alerts-manager';
import { Card, CardTitle, ListGroup } from 'reactstrap';

const AlertsList = () => {
    const { alerts, isLoading: loadingAlerts } = useAlertsContext();

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
                                sortAlert={alert => alertsManager.sortAlert(alert)} />
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