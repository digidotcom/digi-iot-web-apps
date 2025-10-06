'use client';

import React from 'react';
import { Col, Container, Row } from "reactstrap";

import AlertsList from "@components/alerts/alerts-list";
import BusList from "@components/buses/bus-list";
import ConnectionStatusChart from "@components/charts/connection-status-chart";
import MaintenanceStatusChart from "@components/charts/maintenance-status-chart";
import { GROUP_BUSES } from '@configs/buses-config';
import { useBusesContext } from '@contexts/buses-provider';

const DashboardPage = () => {
    const { buses, isLoading } = useBusesContext();

    return (
        <Container fluid>
            <Row className="gy-3 pb-3">
                <Col lg="3" md="6" xs="12">
                    <ConnectionStatusChart group={GROUP_BUSES} />
                </Col>
                <Col lg="3" md="6" xs="12">
                    <MaintenanceStatusChart
                        group={GROUP_BUSES}
                        labelInMaintenance="Out of route"
                        labelNotInMaintenance="In route"/>
                </Col>
                <Col lg="6" md="12">
                    <AlertsList />
                </Col>
            </Row>
            <Row className="gy-3">
                <Col>
                    <BusList
                        buses={buses}
                        isRefreshing={isLoading}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
