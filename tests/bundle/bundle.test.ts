import { clearDistDir, distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { resolve } from "path";
import type { TsConfigJson } from "type-fest";

test("Basic config", async () => {
    clearDistDir();

    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await build({
        plugins: [dtsPlugin({ tsconfig, experimentalBundling: true })],
        entryPoints: [
            resolve(__dirname, "./inputs/bundle.ts"),
            resolve(__dirname, "./inputs/secondBundle.ts"),
        ],
        outdir: distDir,
        tsconfig,
        bundle: true,
    });

    expect(readOutputFile("bundle")).toMatchSnapshot();
    expect(readOutputFile("secondBundle")).toMatchSnapshot();
});

test("Pass tsconfig as object", async () => {
    clearDistDir();

    const tsconfig: TsConfigJson = {
        compilerOptions: {
            emitDeclarationOnly: true,
            allowImportingTsExtensions: true,
            target: "es6",
            module: "commonjs",
            lib: ["dom", "es6", "es2017", "esnext.asynciterable"],
            types: [],
        },
    };

    await build({
        plugins: [dtsPlugin({ tsconfig, experimentalBundling: true })],
        entryPoints: [
            resolve(__dirname, "./inputs/bundle.ts"),
            resolve(__dirname, "./inputs/secondBundle.ts"),
        ],
        outdir: distDir,
        tsconfigRaw: tsconfig,
        bundle: true,
    });

    expect(readOutputFile("bundle")).toMatchSnapshot();
});

test("Supports object entry points with custom output paths", async () => {
    clearDistDir();

    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await build({
        plugins: [dtsPlugin({ tsconfig, experimentalBundling: true })],
        entryPoints: {
            "public/api": resolve(__dirname, "./inputs/bundle.ts"),
            "public/secondary": resolve(__dirname, "./inputs/secondBundle.ts"),
        },
        outdir: distDir,
        tsconfig,
        bundle: true,
    });

    expect(readOutputFile("public/api")).toMatchSnapshot();
    expect(readOutputFile("public/secondary")).toMatchSnapshot();
});

test("Supports array entry points with custom output paths", async () => {
    clearDistDir();

    const tsconfig = resolve(__dirname, "./tsconfig.json");

    await build({
        plugins: [dtsPlugin({ tsconfig, experimentalBundling: true })],
        entryPoints: [
            {
                in: resolve(__dirname, "./inputs/bundle.ts"),
                out: "entries/api",
            },
            {
                in: resolve(__dirname, "./inputs/secondBundle.ts"),
                out: "entries/secondary",
            },
        ],
        outdir: distDir,
        tsconfig,
        bundle: true,
    });

    expect(readOutputFile("entries/api")).toMatchSnapshot();
    expect(readOutputFile("entries/secondary")).toMatchSnapshot();
});
