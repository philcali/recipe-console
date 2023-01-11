import { useEffect, useState } from "react";
import { Button, Container, Modal, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { icons } from "../components/common/Icons";
import { useAlerts } from "../components/notifications/AlertContext";
import { formatDate, formatTime } from "../lib/format";
import { recipes } from "../lib/services";
import { QueryResults } from "../lib/services/BaseService";
import { Recipe } from "../lib/services/RecipeService";

interface LoadingRecipes extends QueryResults<Recipe> {
    readonly loading: boolean;
    readonly confirmation: boolean;
    readonly confirmationItem?: Recipe;
    readonly confirmSubmit: boolean;
}

// Needs to move to a list view, but I'm moving quick
function RecipeTable() {
    const alerts = useAlerts();
    const defaultResults: LoadingRecipes = {
        items: [],
        nextToken: undefined,
        loading: true,
        confirmation: false,
        confirmSubmit: false,
    }
    const [ results, setResults ] = useState(defaultResults);
    const navigate = useNavigate();
    useEffect(() => {
        let isMounted = true;
        if (results.loading) {
            recipes.list({ nextToken: results.nextToken })
                .then(ls => {
                    if (isMounted) {
                        setResults({
                            ...results,
                            items: results.items.concat(ls.items),
                            nextToken: ls.nextToken,
                            loading: (ls.nextToken !== undefined && ls.nextToken !== null)
                        });
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to list recipes: ${err.message}`);
                    if (isMounted) {
                        setResults({
                            ...results,
                            loading: false
                        });
                    }
                })
        }
        return () =>{
            isMounted = false
        }
    });

    let footer;
    if (results.loading) {
        footer = (
            <>
                Loading...
                <Spinner animation="border"/>
            </>
        );
    } else {
        // f'ing button props only takes intrinsic elements, not react element
        footer = (
            <>
                <Button onClick={_ => navigate('/recipes/new')} variant="success">Create Recipe</Button>
            </>
        )
    }

    const closeModal = () => {
        setResults({
            ...results,
            confirmation: false,
            confirmationItem: undefined
        });
    }

    const launchModal = (recipe: Recipe) => {
        return () => {
            setResults({
                ...results,
                confirmation: true,
                confirmationItem: recipe
            });
        };
    }

    const deleteRecipe = () => {
        if (results.confirmationItem) {
            setResults({
                ...results,
                confirmSubmit: true
            })
            recipes.delete(results.confirmationItem.recipeId)
                .then(_ => {
                    alerts.success(`Successfully deleted ${results.confirmationItem?.name}.`);
                    setResults({
                        items: [],
                        nextToken: undefined,
                        loading: true,
                        confirmation: false,
                        confirmationItem: undefined,
                        confirmSubmit: false
                    });
                })
                .catch(err => {
                    alerts.error(`Failed to delete ${results.confirmationItem?.name}: ${err.message}`);
                    setResults({
                        ...results,
                        confirmSubmit: false
                    });
                })
        }
    }

    return (
        <>
            <Modal show={results.confirmation} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete {results.confirmationItem?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to delete <strong>{results.confirmationItem?.name}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={results.confirmSubmit} variant="outline-secondary" onClick={closeModal}>Close</Button>
                    <Button disabled={results.confirmSubmit} variant="danger" onClick={deleteRecipe}>{results.confirmSubmit ? 'Deleting' : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th className="text-center">Preparation Time (Minutes)</th>
                        <th className="text-center">Servings</th>
                        <th className="text-center">Create Time</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {results.items.map(item => {
                        return (
                            <tr key={`recipe-${item.recipeId}`}>
                                <td>{item.name}</td>
                                <td className="text-center">{item.prepareTimeMinutes || 'NA'}</td>
                                <td className="text-center">{item.numberOfServings || 1}</td>
                                <td className="text-center">{formatDate(item.createTime)} {formatTime(item.createTime)}</td>
                                <td className="text-center">
                                    <Button onClick={() => navigate(`/recipes/${item.recipeId}`)} variant="outline-secondary" size="sm" className="me-1"><>{icons.icon('pencil')}</></Button>
                                    <Button onClick={launchModal(item)} variant="danger" size="sm"><>{icons.icon('trash')}</></Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">
                            {footer}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </>
    )
}

function Dashboard() {
    return (
        <Container>
            <Header>Recipes</Header>
            <RecipeTable/>
        </Container>
    )
}

export default Dashboard;