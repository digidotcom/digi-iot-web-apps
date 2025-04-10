import FirmwareList from '@components/firmware/firmware-list';
import TemplatesList from '@components/templates/templates-list';
import { APP_GROUPS } from '@configs/app-config';
import { Col, Container, Row } from 'reactstrap';

const ManagementPage = () => {

    return (
        <Container fluid>
            <Row className="pb-3">
                <Col>
                    {/* List of templates and option to create new ones. */}
                    <TemplatesList groups={APP_GROUPS}/>
                </Col>
            </Row>
            <Row className="pb-3">
                <Col>
                    {/* List of custom firmware and option to create new versions. */}
                    <FirmwareList groups={APP_GROUPS}/>
                </Col>
            </Row>
        </Container>
    );
};

export default ManagementPage;
