import { Button, Container } from "react-bootstrap";
import Header from "../../components/common/Header";
import ResourceTable from "../../components/resource/ResourceTable";
import { auditService } from "../../lib/services";
import { icons } from "../../components/common/Icons";
import { useNavigate } from "react-router-dom";

export default function AuditList() {
    const navigate = useNavigate();
    return (
        <>
            <Container>
                <Header>Activity Logs</Header>
                <ResourceTable
                    service={auditService}
                    resourceId={item => item.id}
                    resourceLabel={item => `${item?.resourceType} Activity Log`}
                    resourceTitle="Activity Log"
                    pagingLimit={10}
                    manuallyPage
                    sortOrder="descending"
                    columns={[
                        {
                            label: 'Message',
                            format: item => `${item.resourceType} was ${item.action.toLowerCase()}.`
                        },
                        {
                            label: 'Action',
                            center: true,
                            format: item => {
                                let icon: string;
                                let variant: string;
                                switch (item.action) {
                                    case 'CREATED':
                                        icon = 'check-circle';
                                        variant = 'success';
                                        break;
                                    case 'DELETED':
                                        icon = 'x-circle';
                                        variant = 'danger';
                                        break;
                                    default:
                                        icon = 'slash-circle';
                                        variant = 'primary';
                                }
                                return <span className={`text-${variant}`}><>{icons.icon(icon)}</></span>;
                            }
                        }
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
            </Container>
        </>
    );
}