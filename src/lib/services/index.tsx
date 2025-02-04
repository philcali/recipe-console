import { sessionStorage } from "../session";
import ApiTokenService from "./ApiTokenService";
import AuthService from "./AuthService";
import RecipeService from "./RecipeService";
import ShoppingListService from "./ShoppingListService";

export const authService = new AuthService(sessionStorage);
export const recipes = new RecipeService(sessionStorage);
export const shoppingLists = new ShoppingListService(sessionStorage);
export const apiTokens = new ApiTokenService(sessionStorage);