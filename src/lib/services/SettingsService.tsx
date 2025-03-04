import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";

export interface Settings {
    readonly autoShareRecipes: boolean;
    readonly autoShareLists: boolean;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface SettingsUpdate {
    readonly autoShareRecipes?: boolean;
    readonly autoShareLists?: boolean;
}

class SettingsService extends BaseService<Settings, SettingsUpdate> {
    constructor(sessions: SessionStorage) {
        super("settings", sessions);
    }

    async one(): Promise<Settings> {
        const resp = await this.request(this.resource, {
            method: 'GET',
        });
        this.throwOnError(resp);
        return resp.json();
    }
}

export default SettingsService;