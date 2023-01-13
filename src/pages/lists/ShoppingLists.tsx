import { Container, } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { formatDate } from "../../lib/format";
import { shoppingLists } from "../../lib/services";

function ShoppingLists() {
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
            />
        </Container>
    )
}

export default ShoppingLists;