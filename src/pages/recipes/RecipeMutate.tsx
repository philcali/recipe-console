import React, { FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CancelButton from "../../components/common/CancelButton";
import Header from "../../components/common/Header";
import { useAlerts } from "../../components/notifications/AlertContext";
import IngredientTable from "../../components/resource/IngredientTable";
import { recipes } from "../../lib/services";
import { RecipeUpdate } from "../../lib/services/RecipeService";

interface RecipeFormData extends RecipeUpdate {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
}

function RecipeMutate() {
    const navigate = useNavigate();
    const alerts = useAlerts();
    const { recipeId } = useParams();
    const defaultData: RecipeFormData = {
        loading: recipeId !== 'new',
        submitting: false,
        validated: false,

        name: '',
        instructions: '',
        ingredients: [],
        prepareTimeMinutes: 0,
        numberOfServings: 1
    }
    const [ data, setData ] = useState(defaultData);
    const title = recipeId === 'new' ? 'Create Recipe' : `Update ${data.name}`;

    useEffect(() => {
        let isMounted = true;
        if (data.loading && recipeId) {
            recipes.get(recipeId)
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
                    alerts.error(`Failed to load recipe ${recipeId}: ${err.message}`);
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
            const mutate = recipeId === undefined || recipeId === 'new' ?
                recipes.create(data) :
                recipes.update(recipeId, data);
            mutate
                .then(updated => {
                    alerts.success(`Successfully ${recipeId === 'new' ? 'created' : 'updated'} ${updated.name}.`);
                    setData({
                        ...data,
                        ...updated,
                        submitting: false,
                        validated: false,
                    });
                    navigate('/recipes');
                }).catch(err => {
                    alerts.error(`Failed to update ${data.name}: ${err.message}.`);
                    setData({
                        ...data,
                        submitting: false,
                        validated: false
                    });
                });
        }
    };

    const updateInput: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
        setData({
            ...data,
            [event.currentTarget.name]: event.currentTarget.type === 'number' ? parseInt(event.currentTarget.value) :  event.currentTarget.value
        });
    };

    return (
        <>
            <Container>
                <Header>{title}</Header>
                <Form noValidate validated={data.validated} onSubmit={onSubmit}>
                    <Row>
                        <Form.Group as={Col} className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control onChange={updateInput} value={data.name} name="name" required placeholder="Name"/>
                            <Form.Control.Feedback type="invalid">
                                Recipe name is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="prepareTimeMinutes">
                            <Form.Label>Preparation Time (Minutes)</Form.Label>
                            <Form.Control onChange={updateInput} value={data.prepareTimeMinutes} name="prepareTimeMinutes" required min="1" type="number"/>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid preparation time.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="numberOfServings">
                            <Form.Label>Servings</Form.Label>
                            <Form.Control onChange={updateInput} value={data.numberOfServings} name="numberOfServings" required min="1" type="number"/>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid number of servings.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row> 
                    <Form.Group className="mb-3" controlId="instructions">
                        <Form.Label>Instructions</Form.Label>
                        <Form.Control onChange={updateInput} value={data.instructions} name="instructions" as="textarea"/>
                    </Form.Group>
                    <h3>Ingredients</h3>
                    <hr/>
                    <IngredientTable
                        disabled={data.submitting}
                        ingredients={data.ingredients}
                        onMutate={ingredients => setData({...data, ingredients})}
                    />
                    <CancelButton disabled={data.submitting} className="me-1 mt-3"/>
                    <Button disabled={data.loading || data.submitting} type="submit" className="mt-3">{data.submitting ? 'Submitting' : 'Submit'}</Button>
                </Form>
            </Container>
        </>
    )
}

export default RecipeMutate;