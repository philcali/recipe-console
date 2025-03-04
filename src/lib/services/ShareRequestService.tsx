import SessionStorage from "../session/SessionStorage";
import { BaseService } from "./BaseService";

export enum ApprovalStatus {
    REQUESTED = "REQUESTED",
    APPROVED = "APPROVED",
    REJECTED = "REJETED",
}

export interface ShareRequest {
    readonly id: string;
    readonly approver: string;
    readonly requester: string;
    readonly approvalStatus: ApprovalStatus; 
    readonly createTime: number;
    readonly updateTime: number;
}

export interface ShareRequestUpdate {
    readonly approver?: string;
    readonly approvalStatus?: ApprovalStatus;
}

class ShareRequestService extends BaseService<ShareRequest, ShareRequestUpdate> {
    constructor(sessions: SessionStorage) {
        super("shares", sessions);
    }
}

export default ShareRequestService;