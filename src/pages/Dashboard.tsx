import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import { useAlerts } from "../components/notifications/AlertContext";
import { recipes, shoppingLists } from "../lib/services";
import { BaseService, TransferObject } from "../lib/services/BaseService";

interface ResourceCardProps<T extends TransferObject> {
    readonly title: string;
    readonly service: BaseService<T, any>;
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
    return (
        <Container>
            <Header>Dashboard</Header>
            <Row>
                <Col>
                    <ResourceCard title="Recipes" service={recipes}/>
                </Col>
                <Col>
                    <ResourceCard title="Shopping Lists" service={shoppingLists}/>
                </Col>
            </Row>
        </Container>
    )
}

export default Dashboard;