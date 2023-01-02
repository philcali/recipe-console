import React, { FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CancelButton from "../../components/common/CancelButton";
import Header from "../../components/common/Header";
import { icons } from "../../components/common/Icons";
import { recipes } from "../../lib/services";
import { Ingredient, RecipeUpdate } from "../../lib/services/RecipeService";

const DEFAULT_INGREDIENT: Ingredient = {
    name: '',
    measurement: '',
    amount: 0
}

interface RecipeFormData extends RecipeUpdate {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
    readonly mutateIngredient: boolean;
    readonly confirmation: boolean;
    readonly confirmationIndex: number;
    readonly editIndex?: number;
    readonly ingredient?: Ingredient;
}

function RecipeMutate() {
    const navigate = useNavigate();
    const { recipeId } = useParams();
    const defaultData: RecipeFormData = {
        loading: recipeId !== 'new',
        submitting: false,
        validated: false,
        mutateIngredient: false,
        confirmation: false,
        confirmationIndex: 0,

        name: '',
        instructions: '',
        ingredients: [],
        prepareTimeMinutes: 0
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
                .catch(() => {
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
                    setData({
                        ...data,
                        ...updated,
                        submitting: false,
                        validated: false,
                    });
                    navigate('/dashboard');
                }).catch(_ => {
                    setData({
                        ...data,
                        submitting: false,
                        validated: false
                    });
                });
        }
    };

    function launchMutateIngredient(index?: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            setData({
                ...data,
                editIndex: index,
                mutateIngredient: true,
                ingredient: index !== undefined ? (data.ingredients || [])[index] : DEFAULT_INGREDIENT
            });
        };
    }

    function spliceIngredient(index: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            let ingredients = data.ingredients;
            if (ingredients) {
                ingredients.splice(index, 1);
            }
            setData({
                ...data,
                ingredients,
                confirmation: false,
                ingredient: undefined
            });
        };
    }

    const launchConfirmationModal = (index: number) => {
        return () => {
            setData({
                ...data,
                ingredient: (data.ingredients || [])[index],
                confirmation: true,
                confirmationIndex: index
            });
        };
    };

    const closeModal = () => {
        setData({ ...data, mutateIngredient: false, confirmation: false, ingredient: undefined });
    }

    const updateIngredient: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
        setData({
            ...data,
            ingredient: {
                ...(data.ingredient || DEFAULT_INGREDIENT),
                [event.currentTarget.name]: event.currentTarget.type === 'number' ? parseFloat(event.currentTarget.value) : event.currentTarget.value
            }
        });
    };

    const updateInput: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
        setData({
            ...data,
            [event.currentTarget.name]: event.currentTarget.type === 'number' ? parseInt(event.currentTarget.value) :  event.currentTarget.value
        });
    };

    const submitIngredient: React.MouseEventHandler<HTMLButtonElement> = event => {
        let submission = {...data, editIndex: undefined, ingredient: undefined, mutateIngredient: false };
        if (data.ingredient) {
            if (submission.ingredients && data.editIndex !== undefined) {
                submission.ingredients[data.editIndex] = data.ingredient;
            } else {
                let ingredients = data.ingredients || [];
                ingredients.push(data.ingredient);
                submission = {...submission, ingredients };
            }
        }
        setData(submission);
    };

    return (
        <>
            <Modal size="lg" show={data.confirmation} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Deleting {data.ingredient?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to delete <strong>{data.ingredient?.name}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={closeModal} variant="outline-secondary">Cancel</Button>
                    <Button onClick={spliceIngredient(data.confirmationIndex)} variant="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" show={data.mutateIngredient} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Viewing {data.ingredient?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Form.Group as={Col} controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control onChange={updateIngredient} name="name" value={data.ingredient?.name} placeholder="Name"/>
                            </Form.Group>
                            <Form.Group as={Col} controlId="measurement">
                                <Form.Label>Measurement</Form.Label>
                                <Form.Control onChange={updateIngredient} name="measurement" value={data.ingredient?.measurement} placeholder="Measurement"/>
                            </Form.Group>
                            <Form.Group as={Col} controlId="amount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control onChange={updateIngredient} name="amount" value={data.ingredient?.amount} type="number" min="0" step={0.01}/>
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={closeModal} variant="outline-secondary">Cancel</Button>
                    <Button onClick={submitIngredient} variant="primary">Submit</Button>
                </Modal.Footer>
            </Modal>
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
                    </Row> 
                    <Form.Group className="mb-3" controlId="instructions">
                        <Form.Label>Instructions</Form.Label>
                        <Form.Control onChange={updateInput} value={data.instructions} name="instructions" as="textarea"/>
                    </Form.Group>
                    <h3>Ingredients</h3>
                    <hr/>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Measurement</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.ingredients || []).map((item, index) => {
                                return (
                                    <tr key={`ingredient-${index}`}>
                                        <td>{item.name}</td>
                                        <td>{item.measurement}</td>
                                        <td>{item.amount}</td>
                                        <td>
                                            <Button disabled={data.submitting} size="sm" onClick={launchMutateIngredient(index)} variant="outline-secondary" className="me-1"><>{icons.icon('pencil')}</></Button>
                                            <Button disabled={data.submitting} size="sm" onClick={launchConfirmationModal(index)} variant="danger"><>{icons.icon('trash')}</></Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} className="text-center">
                                    <Button onClick={launchMutateIngredient()} variant="success">Add Ingredient</Button>
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                    <CancelButton disabled={data.submitting} className="me-1 mt-3"/>
                    <Button disabled={data.loading || data.submitting} type="submit" className="mt-3">{data.submitting ? 'Submiting' : 'Submit'}</Button>
                </Form>
            </Container>
        </>
    )
}

export default RecipeMutate;