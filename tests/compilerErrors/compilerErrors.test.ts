import { distDir } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { resolve } from "path";

test("Fails on compiler error", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");

    expect(
        build({
            plugins: [dtsPlugin({ tsconfig })],
            entryPoints: [resolve(__dirname, "./inputs/compilerErrors.ts")],
            outdir: distDir,
            tsconfig,
        }),
    ).rejects.toThrow();
});
