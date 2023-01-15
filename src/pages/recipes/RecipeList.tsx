import { Container } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { recipes } from "../../lib/services";
import logo from "../../logo192.png";

function RecipeList() {
    return (
        <Container>
            <Header>Recipes</Header>
            <ResourceTable
                service={recipes}
                resourceId={r => r.recipeId}
                resourceLabel={r => r?.name || 'NA'}
                resourceTitle="Recipe"
                columns={[
                    {
                        label: "Preview",
                        format: item => {
                            return <img height="100px" src={item.thumbnail ? item.thumbnail : logo} alt={`${item.name} Preview`}/>
                        }
                    },
                    {
                        label: "Name",
                        format: item => item.name
                    },
                    {
                        label: "Preparation Time (Minutes)",
                        center: true,
                        format: item => item.prepareTimeMinutes ? item.prepareTimeMinutes.toString() : 'NA'
                    },
                    {
                        label: "Servings",
                        center: true,
                        format: item => (item.numberOfServings || 1).toString()
                    },
                ]}
            />
        </Container>
    );
}

export default RecipeList;