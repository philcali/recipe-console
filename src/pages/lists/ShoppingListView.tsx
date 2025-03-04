import { Badge, Breadcrumb, Container, Form, Table } from "react-bootstrap";
import Header from "../../components/common/Header";
import { useEffect, useState } from "react";
import { ShoppingList, ShoppingListItem } from "../../lib/services/ShoppingListService";
import { Link, useParams } from "react-router-dom";
import { shoppingLists } from "../../lib/services";
import { useAlerts } from "../../components/notifications/AlertContext";

interface ShoppingListData {
    readonly loading: boolean;
    readonly locked: boolean;
    readonly list?: ShoppingList;
}

interface GroupedShoppingListItem extends ShoppingListItem {
    readonly originalIndex: number;
}

function ShoppingListBreadcrumb(props: {listId: string, listName: string}) {
    return (
        <Breadcrumb className="pt-3 ps-3 pb-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/lists" }}>Shopping Lists</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/lists/${props.listId}` }}>{props.listName}</Breadcrumb.Item>
        </Breadcrumb>
    )
}

function ShoppingListView() {

    const { listId } = useParams();
    const alerts = useAlerts();
    const defaultData: ShoppingListData = {
        locked: false,
        loading: true,
    }
    const [ data, setData ] = useState(defaultData);

    useEffect(() => {
        let isMounted = true;
        if (data.loading && listId) {
            shoppingLists.get(listId)
                .then(resp => {
                    if (isMounted) {
                        setData({
                            ...data,
                            list: resp,
                            loading: false,
                        })
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to load list ${listId}: ${err.message}`);
                    if (isMounted) {
                        setData({
                            ...data,
                            loading: false
                        })
                    }
                })
        }
        return () => {
            isMounted = false;
        }
    });

    const remainingItems: GroupedShoppingListItem[] = [];
    const completedItems: GroupedShoppingListItem[] = [];
    data.list?.items.forEach((item, index) => {
        item.completed ?
            completedItems.push({...item, originalIndex: index}) :
            remainingItems.push({...item, originalIndex: index});
    });

    const onChange = (item: GroupedShoppingListItem): React.ChangeEventHandler<HTMLInputElement> => {
        return event => {
            let list = data.list;
            if (list) {
                list.items[item.originalIndex] = {
                    ...list.items[item.originalIndex],
                    completed: event.currentTarget.checked
                };
                setData({
                    ...data,
                    list,
                    locked: true
                })
                shoppingLists.update(list.listId, {
                    items: list?.items
                })
                .then(res => {
                    setData({
                        ...data,
                        locked: false,
                        list: res
                    })
                })
                .catch(err => {
                    alerts.error(`Failed to update ${item.name}: ${err.message}`);
                    setData({
                        ...data,
                        locked: false,
                    })
                })
            }
        };
    }

    const generateItemRow = (item: GroupedShoppingListItem) => {
        let style: React.CSSProperties = {};
        if (item.completed) {
            style.color = '#bbb';
            style.textDecoration = 'line-through';
        }
        return (
            <tr style={style} key={`shopping-item-${item.originalIndex}`}>
                <td>
                    <Form.Check
                        disabled={data.loading || data.locked}
                        type="switch"
                        id={`checked-item-${item.originalIndex}`}
                        onChange={onChange(item)}
                        checked={item.completed}
                    />
                </td>
                <td>{item.name}</td>
                <td>{item.amount}</td>
                <td>{item.measurement}</td>
            </tr>
        );
    }

    return (
        <>
            <ShoppingListBreadcrumb listId={listId || 'NA'} listName={data.list?.name || 'Loading...'}/>
            <Container>
                <Header>{data.list ? data.list.name : 'Loading...'} <Badge>{data.list?.owner ?? 'Self'}</Badge></Header>
                <Table responsive className="text-nowrap">
                    <thead>
                        <tr>
                            <th>Completed</th>
                            <th>Item</th>
                            <th>Amount</th>
                            <th>Measurement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {remainingItems.concat(completedItems).map(generateItemRow)}
                    </tbody>
                </Table>
            </Container>
        </>
    );
}

export default ShoppingListView;