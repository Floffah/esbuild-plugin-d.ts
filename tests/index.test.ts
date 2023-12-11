import { dtsPlugin, getTSConfig } from "../src";
import { getCompilerOptions } from "../src/lib/getCompilerOptions";
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

test("TSConfig extends is resolved", async () => {
    const tsconfig = getTSConfig({
        configPath: resolve(__dirname, "./tsconfig.extends.json"),
    });

    const compilerOptions = getCompilerOptions({
        tsconfig,
        pluginOptions: {},
        esbuildOptions: {},
    });

    expect(compilerOptions).toMatchSnapshot();
    expect(compilerOptions.strict).toBe(true);
    expect(compilerOptions.emitDecoratorMetadata).toBe(true);
});
