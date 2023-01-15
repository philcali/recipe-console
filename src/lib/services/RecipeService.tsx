import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";

export interface Ingredient {
    readonly name: string;
    readonly measurement: string;
    readonly amount: number;
}

export interface Nutrient {
    readonly name: string;
    readonly unit: string;
    readonly amount: number;
}

export interface Recipe {
    readonly recipeId: string;
    readonly name: string;
    readonly instructions: string;
    readonly ingredients: Ingredient[];
    readonly nutrients: Nutrient[];
    readonly thumbnail?: string;
    readonly prepareTimeMinutes?: number;
    readonly numberOfServings?: number;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface RecipeUpdate {
    readonly name?: string;
    readonly instructions?: string;
    readonly thumbnail?: string;
    readonly ingredients?: Ingredient[];
    readonly prepareTimeMinutes?: number;
    readonly numberOfServings?: number;
    readonly nutrients?: Nutrient[];
}

class RecipeService extends BaseService<Recipe, RecipeUpdate> {
    constructor(sessions: SessionStorage) {
        super("recipes", sessions);
    }
}

export default RecipeService;