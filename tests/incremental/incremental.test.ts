import { dtsPlugin } from "esbuild-plugin-d.ts";
import { clearDistDir, distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { existsSync } from "fs";
import { tmpdir } from "node:os";
import { resolve } from "path";

import { getCompilerOptions } from "../../src/lib/getCompilerOptions";
import { resolveTSConfig } from "../../src/lib/resolveTSConfig";

test("Incremental mode", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");
    const __buildContext = Date.now();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: [resolve(__dirname, "./inputs/incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(readOutputFile("incremental")).toMatchSnapshot();

    clearDistDir();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: [resolve(__dirname, "./inputs/incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(existsSync(resolve(distDir, "incremental.d.ts"))).toBe(true);
    expect(readOutputFile("incremental")).toMatchSnapshot();
});

test("Incremental cache defaults to the OS temp directory", () => {
    const tsconfigPath = resolve(__dirname, "./tsconfig.json");
    const { config } = resolveTSConfig({
        configPath: tsconfigPath,
    });

    const compilerOptions = getCompilerOptions({
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

    const compilerOptions = getCompilerOptions({
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
