import { Button, Container, Modal, Table } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { auditService } from "../../lib/services";
import { icons } from "../../components/common/Icons";
import { useNavigate } from "react-router-dom";
import { AuditLog } from "../../lib/services/AuditService";
import { useState } from "react";

interface AuditListState {
    readonly show: boolean;
    readonly entry?: AuditLog;
}

type BucketOfThings = {[key:string]: any};
type AudiDiff = {fields: Set<string>, newValues: BucketOfThings, oldValues: BucketOfThings};

export default function AuditList() {
    const defaultState: AuditListState = {
        show: false,
    };
    const navigate = useNavigate();
    const [ state, setState ] = useState(defaultState);
    let audiDiff: AudiDiff = {
        fields: new Set<string>(),
        newValues: {},
        oldValues: {},
    };
    if (state.entry) {
        if (state.entry.newValues) {
            Object.keys(state.entry.newValues).forEach(key => audiDiff.fields.add(key));
        }
        if (state.entry.oldValues) {
            Object.keys(state.entry.oldValues).forEach(key => audiDiff.fields.add(key));
        }
        audiDiff.fields.forEach(field => {
            if (state.entry?.newValues) {
                audiDiff.newValues[field] = state.entry.newValues[field];
            }
            if (state.entry?.oldValues) {
                audiDiff.oldValues[field] = state.entry.oldValues[field];
            }
        });
    }
    return (
        <>
            <Modal size="xl" fullscreen="lg-down" show={state.show} onHide={() => setState({show: false})}>
                <Modal.Header closeButton>
                    <Modal.Title>Viewing {state.entry?.action.toLowerCase()} diff</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>New Values</th>
                                <th>Old Values</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(audiDiff.fields).map(field => {
                                let newClassName = "";
                                let oldClassName = "";
                                if (
                                    (audiDiff.newValues[field] !== audiDiff.oldValues[field])
                                ) {
                                    newClassName = "text-light bg-success";
                                    oldClassName = "text-light bg-danger";
                                }
                                return (
                                    <tr>
                                        <td>{field}</td>
                                        <td className={newClassName}><pre>{JSON.stringify(audiDiff.newValues[field], null, 2)}</pre></td>
                                        <td className={oldClassName}><pre>{JSON.stringify(audiDiff.oldValues[field], null, 2)}</pre></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setState({show: false})}>Close</Button>
                </Modal.Footer>
            </Modal>
            <Container>
                <Header>Activity Logs</Header>
                <ResourceTable
                    service={auditService}
                    resourceId={item => item.id}
                    resourceLabel={item => `${item?.resourceType} Activity Log`}
                    resourceTitle="Activity Log"
                    pagingLimit={20}
                    manuallyPage
                    sortOrder="descending"
                    columns={[
                        {
                            label: 'Message',
                            format: item => `${item.resourceType} was ${item.action.toLowerCase()}.`
                        },
                        {
                            label: 'Action',
                            center: true,
                            format: item => {
                                let icon: string;
                                let variant: string;
                                switch (item.action) {
                                    case 'CREATED':
                                        icon = 'check-circle';
                                        variant = 'success';
                                        break;
                                    case 'DELETED':
                                        icon = 'x-circle';
                                        variant = 'danger';
                                        break;
                                    default:
                                        icon = 'slash-circle';
                                        variant = 'primary';
                                }
                                return <span className={`text-${variant}`}><>{icons.icon(icon)}</></span>;
                            }
                        }
                    ]}
                    actions={[
                        {
                            generate(item) {
                                let iconString = '';
                                let resourceType = '';
                                switch (item.resourceType) {
                                    case 'Settings':
                                        iconString = 'gear';
                                        resourceType = 'settings';
                                        break;
                                    case 'ShoppingList':
                                        iconString = 'cart';
                                        resourceType = 'lists'
                                        break;
                                    case 'Recipe':
                                        iconString = 'card-list';
                                        resourceType = 'recipes';
                                        break;
                                    case 'ShareRequest':
                                        iconString = 'share';
                                        resourceType = 'shares';
                                        break;
                                    case 'ApiToken':
                                        iconString = 'code-slash';
                                        resourceType = 'tokens';
                                        break;
                                }
                                return (
                                    <>
                                        <Button
                                            size="sm"
                                            className="me-1"
                                            variant="outline-secondary"
                                            onClick={() => navigate(`/${resourceType}`)}
                                        >
                                            <>{icons.icon(iconString)}</>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="me-1"
                                            variant="outline-secondary"
                                            onClick={() => setState({show: true, entry: item})}
                                        >
                                            <>{icons.icon('plus-slash-minus')}</>
                                        </Button>
                                    </>
                                )
                            },
                        }
                    ]}
                />
            </Container>
        </>
    );
}