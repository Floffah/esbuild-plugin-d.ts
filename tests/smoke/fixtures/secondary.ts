import type { SmokeStatus } from "./shared";

export interface SecondarySmokeReport {
    status: SmokeStatus;
    count: number;
}

export function createSecondarySmokeReport(
    status: SmokeStatus,
): SecondarySmokeReport {
    return {
        status,
        count: 1,
    };
}
