import { dtsPlugin } from "../../dist";
import { clearDistDir, distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { existsSync } from "fs";
import { resolve } from "path";

test("Incremental mode", async () => {
    const tsconfig = resolve(__dirname, "./tsconfig.json");
    const __buildContext = Date.now();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: [resolve(__dirname, "./incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(readOutputFile("incremental")).toMatchSnapshot();

    clearDistDir();

    await build({
        plugins: [dtsPlugin({ tsconfig, __buildContext })],
        entryPoints: [resolve(__dirname, "./incremental.ts")],
        outdir: distDir,
        tsconfig,
    });

    expect(existsSync(resolve(distDir, "incremental.d.ts"))).toBe(false);
});
