export interface SmokeUser {
    id: string;
    name: string;
}

export type SmokeStatus = "ready" | "waiting";

export const defaultStatus: SmokeStatus = "ready";
