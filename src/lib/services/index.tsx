import { sessionStorage } from "../session";
import AuthService from "./AuthService";

export const authService = new AuthService(sessionStorage);