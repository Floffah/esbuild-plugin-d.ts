import { dtsPlugin } from "../../dist";
import { distDir, readOutputFile } from "../_utils";
import { expect, test } from "bun:test";
import { build } from "esbuild";
import { resolve } from "path";
import { TsConfigJson } from "type-fest";

test("Basic config", async () => {
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
    const tsconfig: TsConfigJson = {
        compilerOptions: {
            emitDeclarationOnly: true,
            allowImportingTsExtensions: true,
            target: "es6",
            module: "commonjs",
            lib: ["dom", "es6", "es2017", "esnext.asynciterable"],
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
