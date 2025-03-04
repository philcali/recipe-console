import { Badge, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { apiTokens } from "../../lib/services";
import { useState } from "react";
import { ApiToken } from "../../lib/services/ApiTokenService";
import { icons } from "../../components/common/Icons";

interface ShowTokenValue {
    readonly show: boolean,
    readonly token?: ApiToken;
}

export default function TokenList() {
    const [ modal, setModal ] = useState({
        show: false,
    } as ShowTokenValue);
    return (
        <>
            <Modal fullscreen="lg-down" size="lg" show={modal.show} onHide={() => setModal({ show: false })}>
                <Modal.Header closeButton>
                    <Modal.Title>{modal.token?.name} API Token</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Token</Form.Label>
                            <Form.Control disabled value={modal.token?.value}/>
                        </Form.Group>
                        <Row>
                            <Col>
                                <p>Scopes</p>
                                {modal.token?.scopes.map(scope => {
                                    return (
                                        <Badge className="me-2" bg="success" key={scope}>{scope}</Badge>
                                    )
                                })}
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setModal({...modal, show: false})} variant="outline-secondary">Close</Button>
                </Modal.Footer>
            </Modal>
            <Container>
                <Header>API Tokens</Header>
                <ResourceTable
                    service={apiTokens}
                    resourceId={item => item.value}
                    resourceLabel={item => item?.name ?? 'NA'}
                    resourceTitle="API Token"
                    columns={[
                        {
                            label: "Name",
                            format: token => token.name
                        }
                    ]}
                    actions={[
                        {
                            generate(item) {
                                return <Button onClick={() => setModal({...modal, show: true, token: item})} variant="outline-secondary" className="me-1" size="sm"><>{icons.icon('search')}</></Button>
                            },
                        }
                    ]}
                />
            </Container>
        </>
    );
}