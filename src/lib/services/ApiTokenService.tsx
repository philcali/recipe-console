import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";

export enum Scope {
    RECIPE_READ = "recipes.readonly",
    RECIPE_WRITE = "recipes",
    LIST_READ = "lists.readonly",
    LIST_WRITE = "lists",
    SETTINGS_READ = "settings.readonly",
    SETTINGS_WRITE = "settings",
    AUDIT_READ = "audits.readonly",
    AUDIT_WRITE = "audits",
    SHARES_READ = "shares.readonly",
    SHARES_WRITE = "shares",
}

export interface ApiToken {
    readonly name: string;
    readonly scopes: Scope[];
    readonly value: string;
    readonly expiresIn?: string;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface ApiTokenUpdate {
    readonly name?: string;
    readonly scopes?: Scope[];
    readonly expiresIn?: string;
}

class ApiTokenService extends BaseService<ApiToken, ApiTokenUpdate> {
    constructor(sessions: SessionStorage) {
        super("tokens", sessions);
    }
}

export default ApiTokenService;