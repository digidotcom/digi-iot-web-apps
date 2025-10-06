import FirmwareList from '@components/firmware/firmware-list';
import TemplatesList from '@components/templates/templates-list';
import { GROUP_BUSES } from '@configs/buses-config';
import { Col, Container, Row } from 'reactstrap';

const ManagementPage = () => {

    return (
        <Container fluid>
            <Row className="pb-3">
                <Col>
                    {/* List of templates and option to create new ones. */}
                    <TemplatesList group={GROUP_BUSES}/>
                </Col>
            </Row>
            <Row className="pb-3">
                <Col>
                    {/* List of custom firmware and option to create new versions. */}
                    <FirmwareList group={GROUP_BUSES} />
                </Col>
            </Row>
        </Container>
    );
};

export default ManagementPage;
