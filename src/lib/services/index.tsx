import { sessionStorage } from "../session";
import ApiTokenService from "./ApiTokenService";
import AuditService from "./AuditService";
import AuthService from "./AuthService";
import RecipeService from "./RecipeService";
import SettingsService from "./SettingsService";
import ShareRequestService from "./ShareRequestService";
import ShoppingListService from "./ShoppingListService";

export const authService = new AuthService(sessionStorage);
export const recipes = new RecipeService(sessionStorage);
export const shoppingLists = new ShoppingListService(sessionStorage);
export const apiTokens = new ApiTokenService(sessionStorage);
export const auditService = new AuditService(sessionStorage);
export const settingService = new SettingsService(sessionStorage);
export const shareService = new ShareRequestService(sessionStorage);