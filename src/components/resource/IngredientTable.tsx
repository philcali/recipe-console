import { useState } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Ingredient } from "../../lib/services/RecipeService";
import { icons } from "../common/Icons";

const DEFAULT_INGREDIENT: Ingredient = {
    name: '',
    measurement: '',
    amount: 0
}

export interface IngredientTableProps {
    readonly disabled: boolean;
    readonly onMutate: (newValues: Ingredient[]) => void;
    readonly children?: JSX.Element;
    readonly ingredients?: Ingredient[];
}

export interface IngredientTableData {
    readonly confirmation: boolean;
    readonly confirmationIndex: number;
    readonly mutateIngredient: boolean;
    readonly ingredient?: Ingredient;
    readonly editIndex?: number;
}

function IngredientTable(props: IngredientTableProps) {
    const defaultData: IngredientTableData = {
        mutateIngredient: false,
        confirmation: false,
        confirmationIndex: 0,
    };
    const [ data, setData ] = useState(defaultData);

    const launchConfirmationModal = (index: number) => {
        return () => {
            setData({
                ...data,
                ingredient: (props.ingredients || [])[index],
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

    function launchMutateIngredient(index?: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            setData({
                ...data,
                editIndex: index,
                mutateIngredient: true,
                ingredient: index !== undefined ? (props.ingredients || [])[index] : DEFAULT_INGREDIENT
            });
        };
    }

    function spliceIngredient(index: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            let ingredients = props.ingredients;
            if (ingredients && props.ingredients) {
                ingredients = [...props.ingredients];
                ingredients.splice(index, 1);
                props.onMutate(ingredients);
            }
            setData({
                ...data,
                confirmation: false,
                ingredient: undefined
            });
        };
    }

    const submitIngredient: React.MouseEventHandler<HTMLButtonElement> = event => {
        let submission = {...data, editIndex: undefined, ingredient: undefined, mutateIngredient: false };
        if (data.ingredient) {
            let values = [...(props.ingredients || [])];
            if (data.editIndex !== undefined) {
                values[data.editIndex] = data.ingredient;
            } else {
                values.push(data.ingredient);
            }
            props.onMutate(values);
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
                    {(props.ingredients || []).map((item, index) => {
                        return (
                            <tr key={`ingredient-${index}`}>
                                <td>{item.name}</td>
                                <td>{item.measurement}</td>
                                <td>{item.amount}</td>
                                <td>
                                    <Button disabled={props.disabled} size="sm" onClick={launchMutateIngredient(index)} variant="outline-secondary" className="me-1"><>{icons.icon('pencil')}</></Button>
                                    <Button disabled={props.disabled} size="sm" onClick={launchConfirmationModal(index)} variant="danger"><>{icons.icon('trash')}</></Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="text-center">
                            <Button className="me-1" onClick={launchMutateIngredient()} variant="success"><>{icons.icon('plus', 20)}</> Add Ingredient</Button>
                            {props.children}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </>
    )
}

export default IngredientTable;