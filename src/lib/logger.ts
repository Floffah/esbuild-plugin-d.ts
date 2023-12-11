import { LogLevel } from "esbuild";

export function createLogger(logLevel?: LogLevel) {
    const levels: LogLevel[] = [
        "verbose",
        "debug",
        "info",
        "warning",
        "error",
        "silent",
    ];

    for (const l of levels) {
        if (l === logLevel) {
            break;
        } else {
            levels.splice(levels.indexOf(l), 1);
        }
    }

    return {
        info: (...msg: string[]) => {
            if (levels.includes("info")) console.log(...msg);
        },
    };
}
