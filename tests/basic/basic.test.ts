import { distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build, context } from "esbuild";
import { resolve } from "path";

import { dtsPlugin } from "@/plugin";

test("Basic config", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await build({
        plugins: [dtsPlugin({ tsconfig })],
        entryPoints: [resolve(__dirname, "./inputs/basic.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(readOutputFile("basic")).toMatchSnapshot();
});

test("Warns when removed outDir plugin option is used", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    const result = await build({
        plugins: [
            dtsPlugin({
                tsconfig,
                outDir: distDir,
            } as Parameters<typeof dtsPlugin>[0] & { outDir: string }),
        ],
        entryPoints: [resolve(__dirname, "./inputs/basic.ts")],
        outdir: distDir,
        tsconfig,
        logLevel: "silent",
    });

    expect(result.warnings.map((warning) => warning.text)).toContain(
        'The dtsPlugin "outDir" option was removed in v2 and is ignored. Use "compilerOptions.declarationDir" in your tsconfig, or esbuild "outdir", instead.',
    );
});

test("Warns once when removed outDir plugin option is used across rebuilds", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    const buildContext = await context({
        plugins: [
            dtsPlugin({
                tsconfig,
                outDir: distDir,
            } as Parameters<typeof dtsPlugin>[0] & { outDir: string }),
        ],
        entryPoints: [resolve(__dirname, "./inputs/basic.ts")],
        outdir: distDir,
        tsconfig,
        logLevel: "silent",
    });

    try {
        const firstResult = await buildContext.rebuild();
        const secondResult = await buildContext.rebuild();

        expect(firstResult.warnings.map((warning) => warning.text)).toContain(
            'The dtsPlugin "outDir" option was removed in v2 and is ignored. Use "compilerOptions.declarationDir" in your tsconfig, or esbuild "outdir", instead.',
        );
        expect(
            secondResult.warnings.map((warning) => warning.text),
        ).not.toContain(
            'The dtsPlugin "outDir" option was removed in v2 and is ignored. Use "compilerOptions.declarationDir" in your tsconfig, or esbuild "outdir", instead.',
        );
    } finally {
        await buildContext.dispose();
    }
});
