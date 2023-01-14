import { Ingredient } from "../../lib/services/RecipeService";
import ChildResourceTable from "./ChildResourceTable";

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

function IngredientTable(props: IngredientTableProps) {
    return (
        <ChildResourceTable
            label="Ingredient"
            defaultItem={DEFAULT_INGREDIENT}
            disabled={props.disabled}
            onMutate={props.onMutate}
            items={props.ingredients}
            children={props.children}
            elements={[
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
            ]}
            columns={[
                {
                    label: 'Measurement',
                    format: item => item.measurement
                },
                {
                    label: 'Amount',
                    format: item => item.amount.toString()
                }
            ]}
        />
    );
}

export default IngredientTable;