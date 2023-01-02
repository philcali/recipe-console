import { sessionStorage } from "../session";
import AuthService from "./AuthService";
import RecipeService from "./RecipeService";

export const authService = new AuthService(sessionStorage);
export const recipes = new RecipeService(sessionStorage);