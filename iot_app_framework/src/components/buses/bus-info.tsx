import { Row, Col } from 'reactstrap';

import BusInfoHeader from '@components/buses/bus-info-header';
import DeviceProperty from '@components/widgets/device-property';
import { BUS_PROPERTY_PASSENGERS, BUS_PROPERTY_POWER, BUS_PROPERTY_PRESSURE, BUS_PROPERTY_TEMPERATURE } from '@configs/buses-config';
import { Bus } from '@models/Bus';

// Interface to exchange data using props.
interface Props {
    bus: Bus
}

// Component definition.
const BusInfo = (props: Props) => {
    // Initialize variables from props.
    const { bus } = props;

    return (
        <div className="bus-info-container">
            <BusInfoHeader bus={bus} />
            <Row className="h-50">
                <Col sm={6} className="d-flex flex-column">
                    <DeviceProperty property={bus.getProperty(BUS_PROPERTY_PASSENGERS)} deviceID={bus.id} />
                </Col>
                <Col sm={6} className="d-flex flex-column">
                    <DeviceProperty property={bus.getProperty(BUS_PROPERTY_POWER)} deviceID={bus.id} />
                </Col>
            </Row>
            <Row className="h-50">
                <Col sm={6} className="d-flex flex-column">
                    <DeviceProperty property={bus.getProperty(BUS_PROPERTY_TEMPERATURE)} deviceID={bus.id} />
                </Col>
                <Col sm={6} className="d-flex flex-column">
                    <DeviceProperty property={bus.getProperty(BUS_PROPERTY_PRESSURE)} deviceID={bus.id} />
                </Col>
            </Row>
        </div>
    );
};

export default BusInfo;