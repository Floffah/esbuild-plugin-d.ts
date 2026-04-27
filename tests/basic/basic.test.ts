import { dtsPlugin } from "esbuild-plugin-d.ts";
import { distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { resolve } from "path";

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
