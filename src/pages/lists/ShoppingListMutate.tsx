import { FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CancelButton from "../../components/common/CancelButton";
import Header from "../../components/common/Header";
import { icons } from "../../components/common/Icons";
import { useAlerts } from "../../components/notifications/AlertContext";
import IngredientTable from "../../components/resource/IngredientTable";
import { shoppingLists } from "../../lib/services";
import { ShoppingListUpdate } from "../../lib/services/ShoppingListService";

interface ShoppingListData extends ShoppingListUpdate {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
}

function ShoppingListMutate() {
    const navigate = useNavigate();
    const alerts = useAlerts();
    const { listId } = useParams();
    const defaultData: ShoppingListData = {
        loading: listId !== 'new',
        submitting: false,
        validated: false,

        name: '',
    };
    const [ data, setData ] = useState(defaultData);
    const title = listId === 'new' ? 'Create Shopping List' : `Update ${data.name}`;
    useEffect(() => {
        let isMounted = true;
        if (data.loading && listId) {
            shoppingLists.get(listId)
                .then(resp => {
                    if (isMounted) {
                        setData({
                            ...data,
                            ...resp,
                            loading: false
                        });
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to load recipe ${listId}: ${err.message}`);
                    if (isMounted) {
                        setData({
                            ...data,
                            loading: false
                        });
                    }
                });
        }
        return () => {
            isMounted = false;
        };
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        if (form.checkValidity() === false) {
            setData({
                ...data,
                validated: true
            });
        } else {
            setData({
                ...data,
                validated: true,
                submitting: true
            });
            const mutate = listId === undefined || listId === 'new' ?
                shoppingLists.create(data) :
                shoppingLists.update(listId, data);
            mutate
                .then(updated => {
                    alerts.success(`Successfully ${listId === 'new' ? 'created' : 'updated'} ${updated.name}.`);
                    setData({
                        ...data,
                        ...updated,
                        submitting: false,
                        validated: false
                    });
                    navigate('/lists');
                }).catch(err => {
                    alerts.error(`Failed to update ${data.name}: ${err.message}`);
                    setData({
                        ...data,
                        submitting: false,
                        validated: false
                    });
                })
        }
    }

    const updateInput: React.ChangeEventHandler<HTMLInputElement> = event => {
        setData({
            ...data,
            [event.currentTarget.name]: event.currentTarget.value
        });
    }

    return (
        <Container>
            <Header>{title}</Header>
            <Form noValidate validated={data.validated} onSubmit={onSubmit}>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control onChange={updateInput} value={data.name} name="name" required placeholder="Name"/>
                        <Form.Control.Feedback type="invalid">
                            Shopping list name is required.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="expiresIn">
                        <Form.Label>Expires In</Form.Label>
                        <Form.Control onChange={updateInput} value={data.expiresIn} name="expiresIn" type="date"/>
                    </Form.Group>
                </Row>
                <h3>Items</h3>
                <hr/>
                <IngredientTable
                    disabled={data.submitting}
                    ingredients={data.items}
                    onMutate={items => setData({...data, items})}
                >
                    <Button variant="success"><>{icons.icon('card-checklist', 20)}</> Import from Recipe</Button>
                </IngredientTable>
                <CancelButton disabled={data.submitting} className="me-1 mt-3"/>
                <Button disabled={data.loading || data.submitting} type="submit" className="mt-3">{data.submitting ? 'Submitting' : 'Submit'}</Button>
            </Form>
        </Container>
    )
}

export default ShoppingListMutate;