import React, { FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Modal, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CancelButton from "../../components/common/CancelButton";
import Header from "../../components/common/Header";
import { icons } from "../../components/common/Icons";
import { useAlerts } from "../../components/notifications/AlertContext";
import ShoppingListItemTable from "../../components/resource/ShoppingListItemTable";
import { recipes, shoppingLists } from "../../lib/services";
import { Recipe } from "../../lib/services/RecipeService";
import { ShoppingListUpdate } from "../../lib/services/ShoppingListService";

interface ShoppingListData extends ShoppingListUpdate {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
}

interface ImportIngredientsData {
    readonly showModal: boolean;
    readonly loading: boolean;
    readonly nextToken?: string;
    readonly recipes: Recipe[];
    readonly selectedIndex: string;
    readonly selectedRecipe?: Recipe;
}

interface ImportIngredientsProps {
    readonly onImport: (recipe: Recipe) => void;
}

function ImportIngredients(props: ImportIngredientsProps) {
    const defaultData: ImportIngredientsData = {
        loading: true,
        showModal: false,
        recipes: [],
        selectedIndex: ''
    }
    const alerts = useAlerts();
    const [ data, setData ] = useState(defaultData);

    useEffect(() => {
        let isMounted = true;
        if (data.loading) {
            recipes
                .list({ nextToken: data.nextToken })
                .then(resp => {
                    if (isMounted) {
                        setData({
                            ...data,
                            recipes: data.recipes.concat(resp.items),
                            nextToken: resp.nextToken,
                            loading: (resp.nextToken !== undefined && resp.nextToken !== null) 
                        });
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to list recipes: ${err.message}`);
                    if (isMounted) {
                        setData({
                            ...data,
                            loading: false
                        });
                    }
                })
        }
        return () => {
            isMounted = false;
        }
    });

    function showModal(showModal: boolean) {
        return () => {
            setData({
                ...data,
                showModal
            });
        }
    }

    const refreshList = () => {
        setData({
            ...data,
            loading: true,
            recipes: [],
            nextToken: undefined
        });
    };

    const onSelectionChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
        setData({
            ...data,
            selectedIndex: event.currentTarget.value,
            selectedRecipe: data.recipes[parseInt(event.currentTarget.value)]
        })
    }

    const confirmSelection = () => {
        if (data.selectedRecipe) {
            props.onImport({...data.selectedRecipe});
        }
        setData({
            ...data,
            showModal: false,
            selectedIndex: '',
            selectedRecipe: undefined
        });
    };

    return (
        <>
            <Modal size="lg" onHide={showModal(false)} show={data.showModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Import Ingredients from a Recipe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Form.Group as={Col} controlId="recipeId">
                                <Form.Label>Recipe</Form.Label>
                                <InputGroup>
                                    <Form.Select onChange={onSelectionChange} value={data.selectedIndex} disabled={data.loading || data.recipes.length === 0}>
                                        <option value="">Select a Recipe</option>
                                        {data.recipes.map((option, index) => {
                                            return <option key={option.recipeId} value={index}>{option.name}</option>
                                        })}
                                    </Form.Select>
                                    <Button onClick={refreshList} variant="outline-secondary" disabled={data.loading}><>{icons.icon('arrow-clockwise')}</></Button>
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        {data.selectedRecipe && 
                            <Row>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Measurement</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.selectedRecipe.ingredients.map((ingredient, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{ingredient.name}</td>
                                                    <td>{ingredient.measurement}</td>
                                                    <td>{ingredient.amount}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </Row>
                        }
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={showModal(false)} variant="outline-secondary">Cancel</Button>
                    <Button onClick={confirmSelection} variant="success">Import</Button>
                </Modal.Footer>
            </Modal>
            <Button disabled={data.loading || data.recipes.length === 0} variant="success" onClick={showModal(true)}><>{icons.icon('card-checklist', 20)}</> {data.loading ? 'Loading' : 'Import from Recipe'}</Button>
        </>
    )
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
        items: [],
        expiresIn: ''
    };
    const [ data, setData ] = useState(defaultData);
    const title = listId === 'new' ? 'Create Shopping List' : `Update ${data.name}`;
    useEffect(() => {
        let isMounted = true;
        if (data.loading && listId) {
            shoppingLists.get(listId)
                .then(resp => {
                    if (isMounted) {
                        let expiresIn = resp.expiresIn;
                        if (expiresIn) {
                            let date = new Date(expiresIn);
                            let month: number | string = date.getMonth() + 1;
                            let day: number | string = date.getDate();
                            if (month < 10) {
                                month = `0${month}`;
                            }
                            if (day < 10) {
                                day = `0${day}`;
                            }
                            expiresIn = `${date.getFullYear()}-${month}-${day}`
                        }
                        setData({
                            ...data,
                            ...resp,
                            expiresIn,
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
            let updateDoc = {...data};
            if (updateDoc.expiresIn) {
                let date = new Date(updateDoc.expiresIn);
                date = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
                updateDoc.expiresIn = date.toISOString();
            }
            const mutate = listId === undefined || listId === 'new' ?
                shoppingLists.create(updateDoc) :
                shoppingLists.update(listId, updateDoc);
            mutate
                .then(updated => {
                    alerts.success(`Successfully ${listId === 'new' ? 'created' : 'updated'} ${updated.name}.`);
                    let copy = {...updated};
                    if (copy.expiresIn) {
                        copy.expiresIn = new Date(copy.expiresIn).toLocaleDateString();
                    }
                    setData({
                        ...data,
                        ...copy,
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

    const importRecipeIngredients = (recipe: Recipe) => {
        let items = [...(data.items || [])];
        // TODO: optimize with map lookup
        recipe.ingredients.forEach(ingredient => {
            let found = false;
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (item.name === ingredient.name && item.measurement === ingredient.measurement) {
                    found = true;
                    items[index] = {
                        ...ingredient,
                        amount: item.amount + ingredient.amount,
                        completed: false,
                    };
                    break;
                }
            }
            if (!found) {
                items.push({...ingredient, completed: false});
            }
        });
        setData({
            ...data,
            items
        })
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
                    <ShoppingListItemTable
                        disabled={data.submitting}
                        items={data.items}
                        onMutate={items => setData({
                            ...data,
                            items
                        })}
                    >
                        <ImportIngredients
                            onImport={importRecipeIngredients}
                        />
                    </ShoppingListItemTable>
                    <CancelButton disabled={data.submitting} className="me-1 mt-3"/>
                    <Button disabled={data.loading || data.submitting} type="submit" className="mt-3">{data.submitting ? 'Submitting' : 'Submit'}</Button>
                </Form>
            </Container>
        </>
    )
}

export default ShoppingListMutate;