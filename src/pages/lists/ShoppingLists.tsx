import { Badge, Button, Container, } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { formatDate } from "../../lib/format";
import { shoppingLists } from "../../lib/services";
import { icons } from "../../components/common/Icons";
import { useNavigate } from "react-router-dom";

function ShoppingLists() {
    const navigate = useNavigate();
    return (
        <Container>
            <Header>Shopping Lists</Header>
            <ResourceTable
                service={shoppingLists}
                resourceTitle="Shopping List"
                resourceId={list => list.listId}
                resourceLabel={list => list?.name || 'NA'}
                columns={[
                    {
                        label: 'Name',
                        format: item => item.name
                    },
                    {
                        label: 'Owner',
                        format: item => <Badge>{item.owner ?? 'Self'}</Badge>
                    },
                    {
                        label: 'Items',
                        center: true,
                        format: item => `${item.items.length}`
                    },
                    {
                        label: 'Expires In',
                        center: true,
                        format: item => item.expiresIn ? formatDate(item.expiresIn) : 'NA'
                    }
                ]}
                actions={[
                    {
                        generate: item => <Button 
                            key={`view-${item.listId}`}
                            onClick={() => navigate(`/lists/${item.listId}/view`)}
                            variant="outline-secondary"
                            size="sm"
                            className="me-1">
                                <>{icons.icon('card-checklist')}</>
                            </Button>
                    }
                ]}
            />
        </Container>
    )
}

export default ShoppingLists;