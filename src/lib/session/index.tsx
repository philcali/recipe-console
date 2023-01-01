import { siteStorage } from "../storage";
import SessionStorage from "./SessionStorage";

export const sessionStorage = new SessionStorage(siteStorage);