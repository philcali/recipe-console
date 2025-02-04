import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlerts } from "../../components/notifications/AlertContext";
import { apiTokens } from "../../lib/services";
import { ApiTokenUpdate, Scope } from "../../lib/services/ApiTokenService";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import Header from "../../components/common/Header";
import { formatDate } from "../../lib/format";
import CancelButton from "../../components/common/CancelButton";

interface MutateTokenState {
    readonly loading: boolean;
    readonly validated: boolean;
    readonly submitting: boolean;
    readonly tokenUpdate?: ApiTokenUpdate;
    readonly tokenId?: string;
}

export default function TokenMutate() {
    const { tokenId } = useParams();
    const [ token, setToken ] = useState({
        loading: tokenId !== 'new',
        validated: false,
        submitting: false,
        tokenId,
        tokenUpdate: {
            scopes: [
                Scope.RECIPE_READ,
                Scope.LIST_READ,
            ]
        }
    } as MutateTokenState);
    const alerts = useAlerts();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        if (token.loading) {
            apiTokens.get(token.tokenId ?? '')
                .then(resp => {
                    if (isMounted) {
                        setToken({
                            ...token,
                            tokenUpdate: {...resp},
                            loading: false,
                        })
                    }
                })
                .catch(e => {
                    alerts.error(`Failed to load token ${tokenId}: ${e.message}`);
                    if (isMounted) {
                        setToken({
                            ...token,
                            loading: false,
                        })
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
            setToken({
                ...token,
                validated: true,
            });
        } else {
            setToken({
                ...token,
                validated: true,
                submitting: true,
            });

            let tokenUpdate = token.tokenUpdate ?? {};
            const mutate = token.tokenId === 'new' ?
                apiTokens.create(tokenUpdate) :
                apiTokens.update(token.tokenId ?? '', {
                    ...tokenUpdate,
                    scopes: undefined,
                });
            mutate
                .then(updated => {
                    alerts.success(`Successfully ${token.tokenId === 'new' ? 'created' : 'updated'} ${updated.name}`);
                    setToken({
                        ...token,
                        submitting: false,
                        validated: false,
                        tokenUpdate: {...updated}
                    });
                    navigate(-1);
                })
                .catch(e => {
                    alerts.error(`Failed to ${token.tokenId === 'new' ? 'create' : 'update'} ${token.tokenUpdate?.name}: ${e.message}`);
                    setToken({
                        ...token,
                        submitting: false,
                        validated: false,
                    });
                });
        }
    };

    return (
        <>
            <Container>
                <Header>{tokenId === 'new' ? 'Create new API Token' : `Update ${token.tokenUpdate?.name}`}</Header>
                <Form onSubmit={onSubmit} validated={token.validated} noValidate>
                    {token.tokenId !== 'new' &&
                        <Form.Group className="mb-3">
                            <Form.Label>Token</Form.Label>
                            <Form.Control
                                disabled
                                value={tokenId}
                            />
                        </Form.Group>
                    }
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                value={token.tokenUpdate?.name}
                                onChange={e => {
                                    setToken({
                                        ...token,
                                        tokenUpdate: {
                                            ...token.tokenUpdate,
                                            name: e.target.value,
                                        }
                                    })
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Provide a name for this API Token.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Expires In</Form.Label>
                            <Form.Control
                                type="date"
                                value={token.tokenUpdate?.expiresIn ? formatDate(token.tokenUpdate.expiresIn) : ''}
                                onChange={e => {
                                    setToken({
                                        ...token,
                                        tokenUpdate: {
                                            ...token.tokenUpdate,
                                            expiresIn: new Date(e.target.value).toISOString(),
                                        }
                                    })
                                }}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <strong>Scopes</strong>
                            {Object.values(Scope).map(scope => {
                                const scopeAndAction = scope.split('.');
                                let label = scope.toString();
                                if (scopeAndAction.length > 1) {
                                    label = `${scopeAndAction[0]} (Read Only)`;
                                }
                                return (
                                    <Form.Check
                                        disabled={tokenId !== 'new'}
                                        key={scope}
                                        checked={token.tokenUpdate?.scopes?.indexOf(scope) !== -1}
                                        type="switch"
                                        id={scope}
                                        label={label}
                                        onChange={e => {
                                            const existingScopes = token.tokenUpdate?.scopes ?? [];
                                            if (e.target.checked) {
                                                existingScopes.push(scope);
                                            } else {
                                                const spliceIndex = existingScopes.indexOf(scope);
                                                existingScopes.splice(spliceIndex, 1);
                                            }
                                            setToken({
                                                ...token,
                                                tokenUpdate: {
                                                    ...token.tokenUpdate,
                                                    scopes: existingScopes,
                                                }
                                            })
                                        }}
                                    />
                                )
                            })}
                        </Col>
                    </Row>
                    <CancelButton className="me-1" disabled={token.submitting}/>
                    <Button
                        disabled={token.loading || token.submitting}
                        type="submit"
                        variant="success"
                    >
                        {token.submitting ? 'Submitting' : 'Submit'}
                    </Button>
                </Form>
            </Container>
        </>
    );
}