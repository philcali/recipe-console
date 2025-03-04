import SessionStorage from "../session/SessionStorage";
import { ReadOnlyService } from "./ReadOnlyService";

type ValueMap = {[key:string]: any} | undefined;

export interface AuditLog {
    readonly id: string;
    readonly resourceType: string;
    readonly resourceId: string;
    readonly action: string;
    readonly newValues: ValueMap;
    readonly oldValues: ValueMap;
    readonly createTime: number;
    readonly updateTime: number;
}

class AuditService extends ReadOnlyService<AuditLog> {
    constructor(sessions: SessionStorage) {
        super("audits", sessions);
    }
}

export default AuditService;