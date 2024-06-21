import { dtsPlugin, getCompilerOptions, resolveTSConfig } from "../src";
import { beforeEach, describe, expect, test } from "bun:test";
import { build } from "esbuild";
import { existsSync, readFileSync } from "fs";
import { rmSync } from "node:fs";
import { resolve } from "path";

const distDir = resolve(__dirname, "dist");

function readOutputFile() {
    return readFileSync(resolve(distDir, "index.d.ts"), "utf-8");
}

function clearDistDir() {
    if (existsSync(distDir)) {
        rmSync(distDir, { recursive: true });
    }
}

beforeEach(() => {
    clearDistDir();
});

test("Basic config", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await build({
        plugins: [dtsPlugin({ tsconfig })],
        entryPoints: ["./tests/inputs/index.ts"],
        outdir: distDir,
        tsconfig,
    });

    expect(readOutputFile()).toMatchSnapshot();
});

test("Incremental mode", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.incremental.json");
    const __buildContext = Date.now();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: ["./tests/inputs/index.ts"],
        outdir: distDir,
        tsconfig,
    });

    expect(readOutputFile()).toMatchSnapshot();

    clearDistDir();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: ["./tests/inputs/index.ts"],
        outdir: distDir,
        tsconfig,
    });

    expect(existsSync(resolve(distDir, "index.d.ts"))).toBe(false);
});

describe("TSConfig extends is resolved", () => {
    test("Relative path", async () => {
        const tsconfig = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.extends.json"),
        });

        const compilerOptions = getCompilerOptions({
            tsconfig,
            pluginOptions: {},
            esbuildOptions: {},
        });

        expect(compilerOptions.strict).toBe(true);
        expect(compilerOptions.emitDecoratorMetadata).toBe(true);
    });

    test("Module paths", async () => {
        const tsconfig = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.extendsModule.json"),
        });

        const compilerOptions = getCompilerOptions({
            tsconfig,
            pluginOptions: {},
            esbuildOptions: {},
        });

        expect(compilerOptions.strict).toBe(false);
        expect(compilerOptions.esModuleInterop).toBe(true);
    });
});

test("Fails on compiler error", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await expect(
        build({
            plugins: [dtsPlugin({ tsconfig })],
            entryPoints: ["./tests/inputs/index.errors.ts"],
            outdir: distDir,
            tsconfig,
        }),
    ).rejects.toThrow();
});
