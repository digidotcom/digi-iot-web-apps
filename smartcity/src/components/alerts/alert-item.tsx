'use client';

import React from "react";
import { ListGroupItem } from 'reactstrap';

import IconButton from '@components/widgets/icon-button';
import { ColorStyles } from '@configs/style-constants';
import { IAlertSummary } from '@customTypes/alert-types';
import { faCheck, faExclamation, faMinusCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppError } from '@models/AppError';
import { acknowledgeAlert, resetAlert } from '@services/drm/alerts';
import { showError } from "@utils/toast-utils";

const STATUS_FIRED = "fired";
const STATUS_ACK = "acknowledged";
const STATUS_RESET = "reset";

// Props interface.
interface Props {
    alert: IAlertSummary;
    sortAlert: (alert: IAlertSummary) => void;
}

const AlertItem = (props: Props) => {
    const { alert, sortAlert } = props;

    // Variables for the alert status.
    const isFired = alert.status === STATUS_FIRED;
    const isAcked = alert.status === STATUS_ACK;
    const isReset = alert.status === STATUS_RESET;

    // Used to store when the alert is being acknowledged.
    const [ackingAlert, setAckingAlert] = React.useState(false);

    // Used to store when the alert is being reset.
    const [resettingAlert, setResettingAlert] = React.useState(false);

    /**
     * Returns the icon of the alert based on its status.
     * 
     * @returns The icon of the alert.
     */
    const getAlertIcon = () => {
        if (isFired) {
            return (<FontAwesomeIcon icon={faExclamation} color={ColorStyles.failureRed} size="2x" fixedWidth />);
        } else if (isAcked) {
            return (<FontAwesomeIcon icon={faMinusCircle} color={ColorStyles.warningYellow} size="2x" fixedWidth />);
        } else {
            return (<FontAwesomeIcon icon={faCheck} color={ColorStyles.successGreen} size="2x" fixedWidth />);
        }
    };

    /**
     * Returns the classname of the alert panel based on the alert status.
     * 
     * @returns The classname of the alert panel.
     */
    const getPanelClass = () => {
        if (isFired) {
            return "alert-panel-fired";
        } else if (isAcked) {
            return "alert-panel-acked";
        } else {
            return "alert-panel-reset";
        }
    };

    /**
     * Acknowledges or resets the alert.
     * 
     * @param ack `true` to acknowledge, `false` to reset.
     */
    const updateAlert = async (ack: boolean) => {
        // Acknowledge or reset the alert.
        if (ack) {
            setAckingAlert(true);
            try {
                await acknowledgeAlert(alert);
                alert.status = STATUS_ACK;
                alert.last_update = new Date().toLocaleString();
                sortAlert(alert);
            } catch (e) {
                showError((e as AppError).message);
            }
            setAckingAlert(false);
        } else {
            setResettingAlert(true);
            try {
                await resetAlert(alert);
                alert.status = STATUS_RESET;
                alert.last_update = new Date().toLocaleString();
                sortAlert(alert);
            } catch (e) {
                showError((e as AppError).message);
            }
            setResettingAlert(false);
        }
    };

    return (
        <ListGroupItem className="alert-item">
            <div>
                {getAlertIcon()}
            </div>
            <div className={getPanelClass()}>
                <div className="alert-panel-title-date">
                    <div className="alert-panel-title">
                        <span><strong>{alert.name}</strong> {isAcked && "(acknowledged)"} {isReset && "(reset)"}</span>
                        <span>{alert.device_name} ({alert.source})</span>
                    </div>
                    <div className="alert-panel-date">{new Date(alert.last_update ?? "").toLocaleString()}</div>
                </div>
                <div className="alert-panel-buttons">
                    <IconButton icon={ackingAlert ? faSpinner : faMinusCircle} spin={ackingAlert} title="Acknowledge alert" onClick={() => updateAlert(true)} enabled={!isAcked && !isReset && !ackingAlert && !resettingAlert} />
                    <IconButton icon={resettingAlert ? faSpinner : faCheck} spin={resettingAlert} title="Reset alert" onClick={() => updateAlert(false)} enabled={!isReset && !ackingAlert && !resettingAlert} />
                </div>
            </div>
        </ListGroupItem>
    );
};

export default AlertItem;