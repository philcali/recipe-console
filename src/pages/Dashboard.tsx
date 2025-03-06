import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { useAlerts } from "../components/notifications/AlertContext";
import { auditService, recipes, shoppingLists } from "../lib/services";
import { ReadOnlyService, TransferObject } from "../lib/services/ReadOnlyService";
import ResourceTable from "../components/resource/ResourceTable";
import { icons } from "../components/common/Icons";

interface ResourceCardProps<T extends TransferObject> {
    readonly title: string;
    readonly service: ReadOnlyService<T>;
}

interface ResourceCardData<T extends TransferObject> {
    readonly loading: boolean;
    readonly items: T[];
    readonly nextToken?: string;
}

function ResourceCard<T extends TransferObject>(props: ResourceCardProps<T>) {
    const defaultData: ResourceCardData<T> = {
        loading: true,
        items: [],
    };
    const [ data, setData ] = useState(defaultData);
    const alerts = useAlerts();
    useEffect(() => {
        let isMounted = true;
        if (data.loading) {
            props.service.list({ nextToken: data.nextToken })
                .then(resp => {
                    if (isMounted) {
                        setData({
                            ...data,
                            items: data.items.concat(resp.items),
                            nextToken: resp.nextToken,
                            loading: resp.nextToken !== undefined && resp.nextToken !== null,

                        });
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to list ${props.title}: ${err.message}`);
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
        }
    });
    return (
        <Card className="text-center">
            <Card.Header as="h4">{props.title}</Card.Header>
            <Card.Body>
                {data.loading && <Spinner animation="border"/>}
                {!data.loading &&
                    <h1>
                        <Link style={{textDecoration: 'solid'}} className="link-success" to={`/${props.service.resource}`}>{data.items.length}</Link>
                    </h1>
                }
            </Card.Body>
        </Card>
    )
}

function Dashboard() {
    const navigate = useNavigate();
    return (
        <Container>
            <Header>Dashboard</Header>
            <Row className="mt-3">
                <Col>
                    <ResourceCard title="Recipes" service={recipes}/>
                </Col>
                <Col>
                    <ResourceCard title="Shopping Lists" service={shoppingLists}/>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <Card>
                        <Card.Header className="text-center" as={"h4"}>Activity</Card.Header>
                        <Card.Body>
                            <ResourceTable
                                service={auditService}
                                resourceId={item => item.id}
                                resourceLabel={item => `${item?.resourceType} Activity Log`}
                                resourceTitle="Activity Log"
                                pagingLimit={5}
                                manuallyPage={true}
                                sortOrder="descending"
                                loadMore={() => navigate('/audits')}
                                columns={[
                                    {
                                        label: 'Message',
                                        center: true,
                                        format: item => `${item.resourceType} was ${item.action.toLowerCase()}.`
                                    },
                                ]}
                                actions={[
                                    {
                                        generate(item) {
                                            let iconString = '';
                                            let resourceType = '';
                                            switch (item.resourceType) {
                                                case 'Settings':
                                                    iconString = 'gear';
                                                    resourceType = 'settings';
                                                    break;
                                                case 'ShoppingList':
                                                    iconString = 'cart';
                                                    resourceType = 'lists'
                                                    break;
                                                case 'Recipe':
                                                    iconString = 'card-list';
                                                    resourceType = 'recipes';
                                                    break;
                                                case 'ShareRequest':
                                                    iconString = 'share';
                                                    resourceType = 'shares';
                                                    break;
                                                case 'ApiToken':
                                                    iconString = 'code-slash';
                                                    resourceType = 'tokens';
                                                    break;
                                            }
                                            return (
                                                <Button
                                                    size="sm"
                                                    className="me-1"
                                                    variant="outline-secondary"
                                                    onClick={() => navigate(`/${resourceType}`)}
                                                >
                                                    <>{icons.icon(iconString)}</>
                                                </Button>
                                            )
                                        },
                                    }
                                ]}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Dashboard;