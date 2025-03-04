import { Badge, Button, Col, Container, Form, InputGroup, Modal, Row } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { shareService } from "../../lib/services";
import { ApprovalStatus, ShareRequest, ShareRequestUpdate } from "../../lib/services/ShareRequestService";
import { icons } from "../../components/common/Icons";
import { useEffect, useState } from "react";
import { useAlerts } from "../../components/notifications/AlertContext";
import { useAuth } from "../../components/auth/AuthContext";

function formatStatus(item: ShareRequest) {
    let variant: string;
    switch (item.approvalStatus) {
        case ApprovalStatus.REQUESTED:
            variant = 'info';
            break;
        case ApprovalStatus.APPROVED:
            variant = 'success';
            break;
        default:
            variant = 'danger';
    }
    return <Badge color={variant}>{item.approvalStatus}</Badge>
}

interface ShareListState {
    readonly show: boolean;
    readonly submitting: boolean;
    readonly shareItem?: ShareRequest;
    readonly shareUpdate?: ShareRequestUpdate;
}

function ShareList() {
    const defaultItem: ShareListState = {
        show: false,
        submitting: false,
    };
    const [ state, setState ] = useState(defaultItem);
    const alerts = useAlerts();
    const auth = useAuth();
    useEffect(() => {
        let isMounted = true;
        if (state.submitting) {
            shareService.update(state.shareItem?.id ?? 'NA', state.shareUpdate ?? {})
                .then(data => {
                    alerts.success(`Successfully updated share request ${data.id}`);
                    if (isMounted) {
                        setState({
                            ...state,
                            submitting: false,
                            show: false,
                        })
                    }
                })
                .catch(e => {
                    alerts.error(`Failed to update share request ${e.message}`);
                    if (isMounted) {
                        setState({
                            ...state,
                            submitting: false,
                        });
                    }
                });
        }
        return () => {
            isMounted = false;
        }
    });
    return (
        <>
            <Modal size="xl" fullscreen="lg-down" show={state.show} onHide={() => setState({...state, show: true})}>
                <Modal.Header closeButton>
                    <Modal.Title>Share request for {state.shareItem?.requester}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <InputGroup>
                                <Form.Control value={state.shareItem?.requester} disabled/>
                                <Form.Select onChange={e => setState({
                                    ...state,
                                    shareUpdate: {
                                        ...state.shareUpdate,
                                        approvalStatus: ApprovalStatus[e.target.value as keyof typeof ApprovalStatus],
                                    }
                                })}>
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Reject</option>
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setState({...state, show: false})} disabled={state.submitting} variant="outline-secondary">Cancel</Button>
                    <Button onClick={() => setState({...state, submitting: true})} disabled={state.submitting} variant="success">Submit</Button>
                </Modal.Footer>
            </Modal>
            <Container>
                <Row>
                    <Col>
                        <Header>Open Requests</Header>
                        <ResourceTable
                            service={shareService}
                            resourceId={item => item.id}
                            resourceLabel={item => item?.requester ?? 'NA'}
                            resourceTitle="Open Request"
                            creatable={false}
                            editable={false}
                            additionalParams={{
                                status: 'REQUESTED',
                            }}
                            columns={[
                                {
                                    label: 'Requester',
                                    format: item => item.requester
                                },
                                {
                                    label: 'Status',
                                    center: true,
                                    format: formatStatus,
                                }
                            ]}
                            actions={[
                                {
                                    generate(item) {
                                        return (
                                            <Button
                                                onClick={() => setState({...state, shareUpdate: {approvalStatus: ApprovalStatus.APPROVED}, shareItem: item, show: true})}
                                                variant="outline-secondary"
                                                className="me-1"
                                                size="sm"
                                            ><>{icons.icon('pencil')}</></Button>
                                        );
                                    },
                                }
                            ]}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Header>Share Requests</Header>
                        <ResourceTable
                            service={shareService}
                            resourceId={item => item.id}
                            resourceLabel={item => item?.approver ?? 'NA'}
                            resourceTitle="Share Request"
                            columns={[
                                {
                                    label: 'Owner',
                                    format: item => auth.user.email === item.requester ? item.approver : item.requester
                                },
                                {
                                    label: 'Status',
                                    center: true,
                                    format: formatStatus,
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ShareList;