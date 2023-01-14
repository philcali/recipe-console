import { useState } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { icons } from "../common/Icons";
import { ResourceTableColumn } from "./ResourceTable";

interface NamedItem {
    readonly name: string;
}

export interface FormElement<T> {
    readonly label: string;
    readonly name: string;
    readonly type?: string;
    readonly placeholder?: string;
    readonly min?: string | number;
    readonly step?: string | number;
    readonly onValue: (item ?: T) => string | string[] | number | undefined;
}

export interface ChildResourceTableProps<T extends NamedItem> {
    readonly label: string;
    readonly disabled: boolean;
    readonly onMutate: (newValues: T[]) => void;
    readonly defaultItem: T;
    readonly children?: JSX.Element;
    readonly items?: T[];
    readonly elements: FormElement<T>[];

    readonly columns: ResourceTableColumn<T>[];
}

interface ChildResourceTableData<T extends NamedItem> {
    readonly confirmation: boolean;
    readonly confirmationIndex: number;
    readonly mutateItem: boolean;
    readonly item?: T;
    readonly editIndex?: number;
}

function ChildResourceTable<T extends NamedItem>(props: ChildResourceTableProps<T>) {
    const defaultData: ChildResourceTableData<T> = {
        mutateItem: false,
        confirmation: false,
        confirmationIndex: 0,
    };
    const [ data, setData ] = useState(defaultData);

    const launchConfirmationModal = (index: number) => {
        return () => {
            setData({
                ...data,
                item: (props.items || [])[index],
                confirmation: true,
                confirmationIndex: index
            });
        };
    };

    const closeModal = () => {
        setData({ ...data, mutateItem: false, confirmation: false, item: undefined });
    }

    const updateItem: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
        setData({
            ...data,
            item: {
                ...(data.item || props.defaultItem),
                [event.currentTarget.name]: event.currentTarget.type === 'number' ? parseFloat(event.currentTarget.value) : event.currentTarget.value
            }
        });
    };

    function launchMutateItem(index?: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            setData({
                ...data,
                editIndex: index,
                mutateItem: true,
                item: index !== undefined ? (props.items|| [])[index] : props.defaultItem 
            });
        };
    }

    function spliceItem(index: number): React.MouseEventHandler<HTMLButtonElement> {
        return event => {
            let items = props.items;
            if (items && props.items) {
                items = [...props.items];
                items.splice(index, 1);
                props.onMutate(items);
            }
            setData({
                ...data,
                confirmation: false,
                item: undefined
            });
        };
    }

    const submitItem: React.MouseEventHandler<HTMLButtonElement> = event => {
        let submission = {...data, editIndex: undefined, ingredient: undefined, mutateItem: false };
        if (data.item) {
            let values = [...(props.items || [])];
            if (data.editIndex !== undefined) {
                values[data.editIndex] = data.item;
            } else {
                values.push(data.item);
            }
            props.onMutate(values);
        }
        setData(submission);
    };

    let columns: ResourceTableColumn<T>[] = [{
        label: 'Name',
        format: (item) => item.name
    }, ...props.columns, {
        label: 'Actions',
        format: (_, index) => {
            return (
                <>
                    <Button disabled={props.disabled} size="sm" onClick={launchMutateItem(index)} variant="outline-secondary" className="me-1"><>{icons.icon('pencil')}</></Button>
                    <Button disabled={props.disabled} size="sm" onClick={launchConfirmationModal(index || 0)} variant="danger"><>{icons.icon('trash')}</></Button>
                </>
            );
        }
    }]

    return (
        <>
            <Modal size="lg" show={data.confirmation} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Deleting {props.label} {data.item?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to delete <strong>{data.item?.name}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={closeModal} variant="outline-secondary">Cancel</Button>
                    <Button onClick={spliceItem(data.confirmationIndex)} variant="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" show={data.mutateItem} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Viewing {props.label} {data.item?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Form.Group as={Col} controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control onChange={updateItem} name="name" value={data.item?.name} placeholder="Name"/>
                            </Form.Group>
                            {props.elements.map((elem, index) => {
                                return (
                                    <Form.Group key={`elem-${index}`} as={Col} controlId={elem.name}>
                                        <Form.Label>{elem.label}</Form.Label>
                                        <Form.Control onChange={updateItem} {...elem} value={elem.onValue(data.item)}/>
                                    </Form.Group>
                                )
                            })}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={closeModal} variant="outline-secondary">Cancel</Button>
                    <Button onClick={submitItem} variant="primary">Submit</Button>
                </Modal.Footer>
            </Modal>
            <Table responsive>
                <thead>
                    <tr>
                        {columns.map((column, ci) => {
                            return <td className={column.center ? 'text-center' : ''} key={`header-${ci}`}>{column.label}</td>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {(props.items || []).map((item, index) => {
                        return (
                            <tr key={`item-${index}`}>
                                {columns.map((column, ci) => {
                                    return <td className={column.center ? 'text-center' : ''} key={`item-format-${index}-${ci}`}>{column.format(item, index)}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="text-center">
                            <Button className="me-1" onClick={launchMutateItem()} variant="success"><>{icons.icon('plus', 20)}</> Add {props.label}</Button>
                            {props.children}
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </>
    );
}

export default ChildResourceTable;