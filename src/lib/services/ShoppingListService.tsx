import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";
import { Ingredient } from "./RecipeService";

export interface ShoppingListItem extends Ingredient {
    readonly completed: boolean;
}

export interface ShoppingList {
    readonly listId: string;
    readonly items: ShoppingListItem[];
    readonly expiresIn?: string;
    readonly name: string;
    readonly owner?: string;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface ShoppingListUpdate {
    readonly name?: string;
    readonly items?: ShoppingListItem[];
    readonly expiresIn?: string;
}

class ShoppingListService extends BaseService<ShoppingList, ShoppingListUpdate> {
    constructor(sessions: SessionStorage) {
        super("lists", sessions);
    }
}

export default ShoppingListService;