import { clearDistDir, distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { existsSync, readFileSync } from "fs";
import { tmpdir } from "node:os";
import { resolve } from "path";
import type { TsConfigJson } from "type-fest";
import ts from "typescript";

import {
    type InternalPluginOptions,
    getCompilerOptions,
    resolveTSConfig,
} from "@/lib";
import { getEmitCommandLine } from "@/lib/incremental.ts";
import { dtsPlugin } from "@/plugin";

test("Incremental mode", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");
    const __buildContext = Date.now();

    await build({
        plugins: [
            dtsPlugin({ tsconfig, __buildContext } as InternalPluginOptions),
        ],
        entryPoints: [resolve(__dirname, "./inputs/incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    const firstOutput = readOutputFile("incremental");

    expect(firstOutput).toMatchSnapshot();

    clearDistDir();

    await build({
        plugins: [
            dtsPlugin({ tsconfig, __buildContext } as InternalPluginOptions),
        ],
        entryPoints: [resolve(__dirname, "./inputs/incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(existsSync(resolve(distDir, "incremental.d.ts"))).toBe(true);
    expect(readOutputFile("incremental")).toBe(firstOutput);
});

test("Incremental cache defaults to the OS temp directory", () => {
    const tsconfigPath = resolve(__dirname, "./tsconfig.json");
    const { config } = resolveTSConfig({
        configPath: tsconfigPath,
    });

    const { compilerOptions } = getCompilerOptions({
        tsconfig: config,
        pluginOptions: { __buildContext: "incremental-cache-test" },
        esbuildOptions: {
            outdir: distDir,
        },
        willBundleDeclarations: false,
    });

    expect(compilerOptions.tsBuildInfoFile).toStartWith(
        resolve(tmpdir(), "esbuild-plugin-d.ts"),
    );
});

test("buildInfoDir overrides the default incremental cache directory", () => {
    const tsconfigPath = resolve(__dirname, "./tsconfig.json");
    const { config } = resolveTSConfig({
        configPath: tsconfigPath,
    });
    const customBuildInfoDir = resolve(distDir, ".build-info");

    const { compilerOptions } = getCompilerOptions({
        tsconfig: config,
        pluginOptions: {
            __buildContext: "incremental-cache-test",
            buildInfoDir: customBuildInfoDir,
        },
        esbuildOptions: {
            outdir: distDir,
        },
        willBundleDeclarations: false,
    });

    expect(compilerOptions.tsBuildInfoFile).toStartWith(customBuildInfoDir);
});

test("Incremental bundling rebuilds bundled outputs after dist is deleted", async () => {
    const tsconfig = resolve(__dirname, "../bundle/tsconfig.incremental.json");
    const entryPoints = [
        resolve(__dirname, "../bundle/inputs/bundle.ts"),
        resolve(__dirname, "../bundle/inputs/secondBundle.ts"),
    ];
    const __buildContext = "incremental-bundling";

    await build({
        plugins: [
            dtsPlugin({
                tsconfig,
                experimentalBundling: true,
                __buildContext,
            } as InternalPluginOptions),
        ],
        entryPoints,
        outdir: distDir,
        tsconfig,
        bundle: true,
    });

    const firstBundle = readOutputFile("bundle");
    const firstSecondBundle = readOutputFile("secondBundle");

    clearDistDir();

    await build({
        plugins: [
            dtsPlugin({
                tsconfig,
                experimentalBundling: true,
                __buildContext,
            } as InternalPluginOptions),
        ],
        entryPoints,
        outdir: distDir,
        tsconfig,
        bundle: true,
    });

    expect(readOutputFile("bundle")).toBe(firstBundle);
    expect(readOutputFile("secondBundle")).toBe(firstSecondBundle);
});

test("Object tsconfig incremental mode preserves nested declaration output paths", async () => {
    const entryPoint = resolve(__dirname, "./inputs/nested/object.ts");
    const tsconfig: TsConfigJson = {
        compilerOptions: {
            declarationDir: distDir,
            incremental: true,
            module: "commonjs",
            rootDir: resolve(__dirname, "./inputs"),
            target: "es6",
            types: [],
        },
    };
    const { compilerOptions } = getCompilerOptions({
        tsconfig,
        pluginOptions: {
            __buildContext: "object-tsconfig-incremental",
        },
        esbuildOptions: {
            outdir: distDir,
        },
        willBundleDeclarations: false,
    });
    const commandLine = getEmitCommandLine({
        tsconfig,
        compilerOptions,
        inputFiles: [entryPoint],
    });

    expect(
        ts
            .getOutputFileNames(
                commandLine!,
                entryPoint,
                !ts.sys.useCaseSensitiveFileNames,
            )
            .filter((outputPath) => outputPath.endsWith(".d.ts")),
    ).toContain(resolve(distDir, "nested/object.d.ts"));

    await build({
        plugins: [
            dtsPlugin({
                tsconfig,
                __buildContext: "object-tsconfig-incremental",
            } as InternalPluginOptions),
        ],
        entryPoints: [entryPoint],
        outdir: distDir,
        tsconfigRaw: tsconfig,
    });

    const outputPath = resolve(distDir, "nested/object.d.ts");
    const firstOutput = readFileSync(outputPath, "utf-8");

    clearDistDir();

    await build({
        plugins: [
            dtsPlugin({
                tsconfig,
                __buildContext: "object-tsconfig-incremental",
            } as InternalPluginOptions),
        ],
        entryPoints: [entryPoint],
        outdir: distDir,
        tsconfigRaw: tsconfig,
    });

    expect(readFileSync(outputPath, "utf-8")).toBe(firstOutput);
});
