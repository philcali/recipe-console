import { Ingredient } from "../../lib/services/RecipeService";
import ChildResourceTable, { FormElement } from "./ChildResourceTable";
import { ResourceTableColumn } from "./ResourceTable";

const DEFAULT_INGREDIENT: Ingredient = {
    name: '',
    measurement: '',
    amount: 0
}

export interface IngredientTableProps {
    readonly disabled: boolean;
    readonly onMutate: (newValues: Ingredient[]) => void;
    readonly children?: JSX.Element;
    readonly ingredients?: Ingredient[];
}

export const DEFAULT_INGREDIENT_ELEMENTS: FormElement<Ingredient>[] = [
    {
        label: 'Measurement',
        name: 'measurement',
        onValue: item => item?.measurement,
        placeholder: 'Measurement'
    },
    {
        label: 'Amount',
        name: 'amount',
        onValue: item => item?.amount,
        type: 'number',
        min: '0',
        step: 0.01
    }
];

export const DEFAULT_INGREDIENT_COLUMNS: ResourceTableColumn<Ingredient>[] = [
    {
        label: 'Measurement',
        format: item => item.measurement
    },
    {
        label: 'Amount',
        format: item => item.amount.toString()
    }
];

function IngredientTable(props: IngredientTableProps) {
    return (
        <ChildResourceTable
            {...props}
            label="Ingredient"
            defaultItem={DEFAULT_INGREDIENT}
            items={props.ingredients}
            elements={DEFAULT_INGREDIENT_ELEMENTS}
            columns={DEFAULT_INGREDIENT_COLUMNS}
        />
    );
}

export default IngredientTable;