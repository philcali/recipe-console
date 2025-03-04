import { useEffect, useState } from "react";
import { Button, Modal, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "../../lib/format";
import { icons } from "../common/Icons";
import { useAlerts } from "../notifications/AlertContext";
import { QueryParams, QueryResults, ReadOnlyService, TransferObject } from "../../lib/services/ReadOnlyService";
import { BaseService } from "../../lib/services/BaseService";

interface LoadingItems<T extends TransferObject> extends QueryResults<T> {
    readonly loading: boolean;
    readonly confirmation: boolean;
    readonly confirmationItem?: T;
    readonly confirmSubmit: boolean;
}

export interface ResourceTableColumn<T> {
    readonly label: string;
    readonly center?: boolean;
    readonly format: (item: T, index?:number) => string | JSX.Element;
}

export interface ResourceItemAction<T> {
    readonly generate: (item: T) => JSX.Element; 
}

export interface ResourceTableProps<T extends TransferObject> {
    readonly resourceTitle: string;
    readonly resourceId: (item: T) => string;
    readonly resourceLabel: (item?: T) => string;
    readonly pagingLimit?: number;
    readonly manuallyPage?: boolean;
    readonly creatable?: boolean;
    readonly editable?: boolean;
    readonly loadMore?: (results: LoadingItems<T>) => void;
    readonly sortOrder?: string;
    readonly service: ReadOnlyService<T>
    readonly additionalParams?: QueryParams;
    readonly columns: ResourceTableColumn<T>[];
    readonly actions?: ResourceItemAction<T>[];
}

function ResourceTable<T extends TransferObject>(props: ResourceTableProps<T>) {
    const alerts = useAlerts();
    const defaultResults: LoadingItems<T> = {
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
            props.service.list({ ...props.additionalParams, nextToken: results.nextToken, limit: props.pagingLimit ?? 100, sortOrder: props.sortOrder })
                .then(ls => {
                    if (isMounted) {
                        let loading = (ls.nextToken !== undefined && ls.nextToken !== null);
                        if (loading && props.manuallyPage === true) {
                            loading = false;
                        }
                        setResults({
                            ...results,
                            items: results.items.concat(ls.items),
                            nextToken: ls.nextToken,
                            loading,
                        });
                    }
                })
                .catch(err => {
                    alerts.error(`Failed to list ${props.resourceTitle.toLowerCase()}: ${err.message}`);
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
        footer = (
            <>
                {(results.nextToken || props.loadMore) &&
                    <Button className="me-2" variant="outline-secondary" onClick={() => (props.loadMore ?? setResults)({
                        ...results,
                        loading: true,
                    })}>Load More</Button>
                }
                {props.service instanceof BaseService && (props.creatable === undefined || props.creatable) &&
                    <Button onClick={_ => navigate(`/${props.service.resource}/new`)} variant="success">Create {props.resourceTitle}</Button>
                }
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

    const launchModal = (confirmationItem: T) => {
        return () => {
            setResults({
                ...results,
                confirmation: true,
                confirmationItem
            });
        };
    }

    const deleteItem = () => {
        if (results.confirmationItem) {
            setResults({
                ...results,
                confirmSubmit: true
            })
            props.service.delete(props.resourceId(results.confirmationItem))
                .then(_ => {
                    alerts.success(`Successfully deleted ${props.resourceLabel(results.confirmationItem)}.`);
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
                    alerts.error(`Failed to delete ${props.resourceLabel(results.confirmationItem)}: ${err.message}`);
                    setResults({
                        ...results,
                        confirmSubmit: false
                    });
                })
        }
    }

    const columns = [
        ...props.columns,
        {
            label: "Create Time",
            center: true,
            format: (item: T) => {
                return `${formatDate(item.createTime)} ${formatTime(item.createTime)}`;
            }
        },
        {
            label: "Actions",
            center: true,
            format: (item: T) => {
                return (
                    <>
                        {props.actions?.map(action => action.generate(item))}
                        {props.service instanceof BaseService && (props.editable === undefined || props.editable === true) &&
                            <Button onClick={() => navigate(`/${props.service.resource}/${props.resourceId(item)}`)} variant="outline-secondary" size="sm" className="me-1"><>{icons.icon('pencil')}</></Button>
                        }
                        <Button onClick={launchModal(item)} variant="danger" size="sm"><>{icons.icon('trash')}</></Button>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <Modal show={results.confirmation} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete {props.resourceLabel(results.confirmationItem)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to delete <strong>{props.resourceLabel(results.confirmationItem)}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={results.confirmSubmit} variant="outline-secondary" onClick={closeModal}>Close</Button>
                    <Button disabled={results.confirmSubmit} variant="danger" onClick={deleteItem}>{results.confirmSubmit ? 'Deleting' : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>
            <Table responsive className="text-nowrap">
                <thead>
                    <tr>
                        {columns.map((column, index) => {
                            return <th key={index} className={column.center ? 'text-center' : ''} >{column.label}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {results.loading === false && results.items.length === 0 &&
                        <tr>
                            <td className="text-center" colSpan={columns.length}>No {props.resourceTitle}s found.</td>
                        </tr>
                    }
                    {results.items.map((item, index) => {
                        return (
                            <tr key={`${props.service.resource}-item${index}`}>
                                {columns.map((column, ci) => {
                                    return (
                                        <td key={`item-${index}-c-${ci}`} className={column.center ? 'text-center' : ''}>
                                            {column.format(item)}
                                        </td>
                                    );
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                {footer &&
                    <tfoot>
                        <tr>
                            <td colSpan={columns.length} className="text-center">
                                {footer}
                            </td>
                        </tr>
                    </tfoot>
                }
            </Table>
        </>
    );
}

export default ResourceTable;