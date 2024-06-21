import { existsSync, readFileSync } from "fs";
import { rmSync } from "node:fs";
import { resolve } from "path";

export const distDir = resolve(__dirname, "dist");

export function readOutputFile(name = "index") {
    return readFileSync(resolve(distDir, name + ".d.ts"), "utf-8");
}

export function clearDistDir() {
    if (existsSync(distDir)) {
        rmSync(distDir, { recursive: true });
    }
}
