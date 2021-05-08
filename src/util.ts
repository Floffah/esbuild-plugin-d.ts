import { LogLevel } from "esbuild";

export function getLogLevel(level?: LogLevel): LogLevel[] {
    if (!level || level === "silent") return ["silent"];

    const levels: LogLevel[] =
        ["verbose", "debug", "info", "warning", "error", "silent"];

    for (const l of levels) {
        if (l === level) {
            break;
        } else {
            levels.splice(levels.indexOf(l), 1);
        }
    }

    return levels;
}

export function humanFileSize(size: number): string {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return Math.round((size / Math.pow(1024, i)) * 100) / 100 + ["b", "kb", "mb", "gb", "tb"][i];
}
