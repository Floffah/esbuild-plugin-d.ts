import { createInternalRecord } from "./internal";
import { type SmokeStatus, type SmokeUser, defaultStatus } from "./shared";

export interface BasicSmokeResult {
    user: SmokeUser;
    status: SmokeStatus;
}

export function createBasicSmokeResult(user: SmokeUser): BasicSmokeResult {
    const record = createInternalRecord(user);

    return {
        user: record.user,
        status: defaultStatus,
    };
}

export type { SmokeUser };
