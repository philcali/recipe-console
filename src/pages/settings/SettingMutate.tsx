import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { FormEvent, useEffect, useState } from "react";
import { SettingsUpdate } from "../../lib/services/SettingsService";
import { settingService } from "../../lib/services";
import Header from "../../components/common/Header";
import { useAlerts } from "../../components/notifications/AlertContext";

interface LoadingSettings {
    readonly loading: boolean;
    readonly validated: boolean;
    readonly submitting: boolean;
    readonly data?: SettingsUpdate;
}

function SettingsMutate() {
    const defaultSettingsState: LoadingSettings = {
        loading: true,
        validated: false,
        submitting: false,
    }
    const [ state, setState ] = useState(defaultSettingsState);
    const alerts = useAlerts();

    useEffect(() => {
        let isMounted = true;
        if (state.loading) {
            settingService.one().then(data => {
                if (isMounted) {
                    setState({
                        ...state,
                        loading: false,
                        data,
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

            settingService.create(state.data ?? {})
                .then(data => {
                    alerts.success('Successfully updated settings');
                    setState({
                        ...state,
                        submitting: false,
                        validated: false,
                        data
                    });
                })
                .catch(e => {
                    alerts.error(`Failed to update settings: ${e.message}`);
                    setState({
                        ...state,
                        submitting: false,
                        validated: false,
                    });
                });
        }
    };

    return (
        <>
            <Container>
                <Header>Settings</Header>
                {!state.loading || <Row><Col className="text-center"><Spinner animation="border"/></Col></Row>}
                {state.loading ||
                    <Form onSubmit={onSubmit} validated={state.validated} noValidate>
                        <Form.Check
                            type="switch"
                            label="Auto Share Recipes"
                            id="autoShareRecipes"
                            disabled={state.submitting}
                            checked={state.data?.autoShareRecipes ?? false}
                            onChange={e => {
                                setState({
                                    ...state,
                                    data: {
                                        ...state.data,
                                        autoShareRecipes: e.target.checked,
                                    }
                                })
                            }}
                        />
                        <Form.Check
                            type="switch"
                            label="Auto Share Lists"
                            id="autoShareLists"
                            disabled={state.submitting}
                            checked={state.data?.autoShareLists ?? false}
                            onChange={e => {
                                setState({
                                    ...state,
                                    data: {
                                        ...state.data,
                                        autoShareLists: e.target.checked,
                                    }
                                })
                            }}
                        />
                        <Button className="mt-1" disabled={state.submitting} type="submit" variant="success">{state.submitting ? 'Submitting' : 'Submit'}</Button>
                    </Form>
                }
            </Container>
        </>
    );
}

export default SettingsMutate;