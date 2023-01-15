import React, { FormEvent, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CancelButton from "../../components/common/CancelButton";
import Header from "../../components/common/Header";
import { icons } from "../../components/common/Icons";
import { useAlerts } from "../../components/notifications/AlertContext";
import IngredientTable from "../../components/resource/IngredientTable";
import NutrientTable from "../../components/resource/NutrientTable";
import { recipes } from "../../lib/services";
import { RecipeUpdate } from "../../lib/services/RecipeService";
import logo from "../../logo192.png";

const THUMBNAIL_MAX = 200;
const LOSSY_COMPRESSION = 0.8;

interface RecipeFormData extends RecipeUpdate {
    readonly loading: boolean;
    readonly submitting: boolean;
    readonly validated: boolean;
    readonly showEditor: boolean;
}

interface EditThumbnailProps {
    readonly recipe?: RecipeUpdate;
    readonly show: boolean;
    readonly onHide: () => void;
    readonly onSubmit: (dataUrl: string) => void;
}

function EditThumbnailModal(props: EditThumbnailProps) {

    const canvas = React.createRef<HTMLCanvasElement>();

    useEffect(() => {
        let isMounted = true;
        if (canvas.current && isMounted) {
            let context = canvas.current.getContext("2d");
            let image = new Image();
            image.src = props.recipe?.thumbnail || logo;
            image.onload = () => {
                context?.drawImage(image, 0, 0);
            };
        }
        return () => {
            isMounted = false;
        }
    });

    const submit = () => {
        if (canvas.current) {
            props.onSubmit(canvas.current.toDataURL("image/jpeg", LOSSY_COMPRESSION));
        }
    }

    const updateCanvas: React.ChangeEventHandler<HTMLInputElement> = event => {
        if (event.currentTarget.files) {
            let file = event.currentTarget.files[0];
            let reader = new FileReader();
            reader.addEventListener("load", () => {
                if (reader.result) {
                    let context = canvas.current?.getContext("2d");
                    let image = new Image();
                    image.onload = () => {
                        let ratio = Math.min(image.width, image.height);
                        context?.clearRect(0, 0, THUMBNAIL_MAX, THUMBNAIL_MAX);
                        context?.drawImage(image, 0, 0, ratio, ratio, 0, 0, canvas.current?.width || THUMBNAIL_MAX, canvas.current?.height || THUMBNAIL_MAX);
                    };
                    image.src = reader.result as string;
                    image.alt = file.name;
                }
            });
            reader.readAsDataURL(file);
        }
    }

    return (
        <Modal size="lg" {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Editing {props.recipe?.name} Thumbnail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Form.Group as={Col}>
                        <Form.Label>Thumbnail Image</Form.Label>
                        <Form.Control accept="image/*" type="file" onChange={updateCanvas}/>
                    </Form.Group>
                </Row>
                <Row className="mt-3">
                    <Col>
                        <Card>
                            <Card.Body>
                                <canvas ref={canvas} width={`${THUMBNAIL_MAX}px`} height={`${THUMBNAIL_MAX}px`}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide} variant="outline-secondary">Cancel</Button>
                <Button onClick={submit} variant="success">Update</Button>
            </Modal.Footer>
        </Modal>
    );
}

function RecipeMutate() {
    const navigate = useNavigate();
    const alerts = useAlerts();
    const { recipeId } = useParams();
    const defaultData: RecipeFormData = {
        loading: recipeId !== 'new',
        submitting: false,
        validated: false,
        showEditor: false,

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

    const updateInput: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = event => {
        setData({
            ...data,
            [event.currentTarget.name]: event.currentTarget.type === 'number' ? parseInt(event.currentTarget.value) :  event.currentTarget.value
        });
    };

    function toggleModal(showEditor: boolean) {
        return () => {
            setData({
                ...data,
                showEditor
            });
        }
    }

    return (
        <>
            <EditThumbnailModal onSubmit={thumbnail => setData({...data, thumbnail, showEditor: false})} recipe={data} show={data.showEditor} onHide={toggleModal(false)}/>
            <Container>
                <Header>{title}</Header>
                <Form noValidate validated={data.validated} onSubmit={onSubmit}>
                    <Row>
                        <Form.Group as={Col} className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control onChange={updateInput} disabled={data.loading} value={data.name} name="name" required placeholder="Name"/>
                            <Form.Control.Feedback type="invalid">
                                Recipe name is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="type">
                            <Form.Label>Type</Form.Label>
                            <Form.Select onChange={updateInput} disabled={data.loading} value={data.type} name="type">
                                <option value="food">Food</option>
                                <option value="drink">Drink</option>
                            </Form.Select>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col} className="mb-3" controlId="prepareTimeMinutes">
                            <Form.Label>Prep Time (Min)</Form.Label>
                            <Form.Control onChange={updateInput} disabled={data.loading} value={data.prepareTimeMinutes} name="prepareTimeMinutes" required min="1" type="number"/>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid preparation time.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="numberOfServings">
                            <Form.Label>Servings</Form.Label>
                            <Form.Control onChange={updateInput} disabled={data.loading} value={data.numberOfServings} name="numberOfServings" required min="1" type="number"/>
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid number of servings.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row> 
                    <Row>
                        {!data.loading &&
                            <Form.Group as={Col} sm={3} className="mb-3" controlId="thumbnail">
                                <Form.Label>Thumbnail (200px)</Form.Label>
                                <div>
                                    <Button onClick={toggleModal(true)} variant="success"><>{icons.icon('pencil')}</> Update</Button>
                                    <img className="mt-2" alt={`${data.name} Preview`} width="100%" src={data.thumbnail ? data.thumbnail : logo}/>
                                </div>
                            </Form.Group>
                        }
                        <Form.Group as={Col} sm={9} className="mb-3" controlId="instructions">
                            <Form.Label>Instructions</Form.Label>
                            <Form.Control disabled={data.loading} onChange={updateInput} rows={10} value={data.instructions} name="instructions" as="textarea"/>
                        </Form.Group>
                    </Row>
                    <h3>Ingredients</h3>
                    <hr/>
                    <IngredientTable
                        disabled={data.submitting}
                        ingredients={data.ingredients}
                        onMutate={ingredients => setData({...data, ingredients})}
                    />
                    <h3>Nutrients</h3>
                    <hr/>
                    <NutrientTable
                        disabled={data.submitting}
                        nutrients={data.nutrients}
                        onMutate={nutrients => setData({...data, nutrients})}
                    />
                    <CancelButton disabled={data.submitting} className="me-1 mt-3"/>
                    <Button disabled={data.loading || data.submitting} type="submit" className="mt-3">{data.submitting ? 'Submitting' : 'Submit'}</Button>
                </Form>
            </Container>
        </>
    )
}

export default RecipeMutate;