import { dtsPlugin } from "../../dist";
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
