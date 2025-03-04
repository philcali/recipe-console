import { Button, Container, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { shareService } from "../../lib/services";
import { ApprovalStatus, ShareRequest, ShareRequestUpdate } from "../../lib/services/ShareRequestService";
import { useAlerts } from "../../components/notifications/AlertContext";
import Header from "../../components/common/Header";
import CancelButton from "../../components/common/CancelButton";

interface ShareMutateState {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
    readonly shareItem?: ShareRequest;
    readonly shareUpdate?: ShareRequestUpdate;
}

function ShareMutate() {
    const { shareId } = useParams();
    const defaultState: ShareMutateState = {
        submitting: false,
        validated: false,
        loading: shareId !== 'new',
        shareUpdate: {
            approvalStatus: ApprovalStatus.REQUESTED,
        },
    };
    const [ state, setState ] = useState(defaultState);
    const navigate = useNavigate();
    const alerts = useAlerts();

    useEffect(() => {
        let isMounted = true;
        if (state.loading) {
            shareService.get(shareId ?? 'not-found')
                .then(data => {
                    if (isMounted) {
                        setState({
                            ...state,
                            shareUpdate: data,
                            shareItem: data,
                            loading: false,
                        });
                    }
                })
                .catch(e => {
                    alerts.error(`Failed to get share request ${shareId}: ${e.message}`);
                    if (isMounted) {
                        setState({
                            ...state,
                            loading: false,
                        });
                    }
                });
        }
        return () => {
            isMounted = false;
        }
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        if (form.checkValidity() === false) {
            setState({
                ...state,
                validated: true,
            });
        } else {
            setState({
                ...state,
                validated: true,
                submitting: true,
            });
            if (shareId === 'new') {
                shareService.create(state.shareUpdate ?? {})
                    .then(data => {
                        alerts.success(`Successfully shared with ${data.approver}`);
                        setState({
                            ...state,
                            submitting: false,
                            validated: false,
                            shareItem: data,
                            shareUpdate: data,
                        });
                        navigate(-1);
                    })
                    .catch(e => {
                        alerts.error(`Failed to create share request ${e.message}`);
                        setState({
                            ...state,
                            submitting: false,
                            validated: false,
                        })
                    });
            }
        }
    };

    return (
        <>
            <Container>
                <Header>{shareId === 'new' ? 'Create new Share Request' : `View request ${state.shareItem?.approver}`}</Header>
                <Form onSubmit={onSubmit} validated={state.validated} noValidate>
                    <Form.Group className="mb-2">
                        <Form.Label>Approver</Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="username@example.com"
                            value={state.shareUpdate?.approver}
                            disabled={shareId !== 'new'}
                            onChange={e => {
                                setState({
                                    ...state,
                                    shareUpdate: {
                                        ...state.shareUpdate,
                                        approver: e.target.value,
                                    }
                                });
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Need a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <CancelButton className="me-1"/>
                    {shareId !== 'new' &&
                        <Button
                            disabled={state.loading || state.submitting}
                            type="submit"
                            variant="success"
                        >
                            {state.submitting ? 'Submitting' : 'Submit'}
                        </Button>
                    }
                </Form>
            </Container>
        </>
    );
}

export default ShareMutate;