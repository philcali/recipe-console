import { Nutrient } from "../../lib/services/RecipeService";
import ChildResourceTable from "./ChildResourceTable";

const DEFAULT_NUTRIENT: Nutrient = {
    name: '',
    amount: 0,
    unit: ''
};

export interface NutrientTableProps {
    readonly disabled: boolean;
    readonly onMutate: (newValues: Nutrient[]) => void;
    readonly children?: JSX.Element;
    readonly nutrients?: Nutrient[];
}

function NutrientTable(props: NutrientTableProps) {
    return (
        <ChildResourceTable
            {...props}
            label="Nutrient"
            items={props.nutrients}
            defaultItem={DEFAULT_NUTRIENT}
            elements={[
                {
                    label: "Unit",
                    name: 'unit',
                    placeholder: 'Unit',
                    onValue: item => item?.unit
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
                    label: 'Unit',
                    format: item => item.unit
                },
                {
                    label: 'Amount',
                    format: item => item.amount.toString()
                }
            ]}
        />
    )
}

export default NutrientTable;