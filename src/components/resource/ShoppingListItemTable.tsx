import { ShoppingListItem } from "../../lib/services/ShoppingListService";
import { icons } from "../common/Icons";
import ChildResourceTable from "./ChildResourceTable";
import { DEFAULT_INGREDIENT_COLUMNS, DEFAULT_INGREDIENT_ELEMENTS } from "./IngredientTable";

const DEFAULT_ITEM = {
    name: '',
    measurement: '',
    amount: 0,
    completed: false
}

export interface ShoppingListItemTableProps {
    readonly disabled: boolean,
    readonly onMutate: (newValues: ShoppingListItem[]) => void;
    readonly children?: JSX.Element;
    readonly items?: ShoppingListItem[];    
}

function ShoppingListItemTable(props: ShoppingListItemTableProps) {
    return (
        <ChildResourceTable
            {...props}
            label='Shopping List Item'
            defaultItem={DEFAULT_ITEM}
            elements={[...DEFAULT_INGREDIENT_ELEMENTS, {
                label: 'Completed',
                name: 'completed',
                type: 'switch',
                onValue: item => `${item?.completed}`
            }]}
            columns={[...DEFAULT_INGREDIENT_COLUMNS, {
                label: 'Completed',
                center: true,
                format(item, index) {
                    return (
                        <span className={item.completed ? 'text-success' : 'text-secondary'}>
                            <>{icons.icon(item.completed ? 'check-circle' : 'slash-circle')}</>
                        </span>
                    );
                },
            }]}
        />
    )
}

export default ShoppingListItemTable;