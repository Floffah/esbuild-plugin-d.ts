import { Options } from "tsup";

export const tsup: Options = {
    target: "node12",
    entryPoints: ["./src/index.ts"],
    format: ["cjs", "esm"],
    external: ["esbuild", "typescript", "chalk", "tmp"],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
};
