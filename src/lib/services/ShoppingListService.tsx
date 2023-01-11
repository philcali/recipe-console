import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";
import { Ingredient } from "./RecipeService";

export interface ShoppingList {
    readonly listId: string;
    readonly items: Ingredient[];
    readonly expiresIn: number;
    readonly name: string;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface ShoppingListUpdate {
    readonly name?: string;
    readonly items?: Ingredient[];
    readonly expiresIn?: number;
}

class ShoppingListService extends BaseService<ShoppingList, ShoppingListUpdate> {
    constructor(sessions: SessionStorage) {
        super("lists", sessions);
    }
}

export default ShoppingListService;