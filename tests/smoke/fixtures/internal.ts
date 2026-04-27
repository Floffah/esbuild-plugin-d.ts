import type { SmokeStatus, SmokeUser } from "./shared";

export interface InternalRecord {
    user: SmokeUser;
    status: SmokeStatus;
    createdAt: Date;
}

export function createInternalRecord(user: SmokeUser): InternalRecord {
    return {
        user,
        status: "ready",
        createdAt: new Date(0),
    };
}
