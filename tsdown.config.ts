import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts"],
    dts: true,
    format: ["esm", "cjs"],
    platform: "node",
    sourcemap: true,
    deps: {
        neverBundle: ["typescript", "esbuild"],
    },
    outExtensions: (context) => {
        if (context.format === "cjs") {
            return {
                js: ".cjs",
                dts: ".d.cts",
            };
        }
        return {
            js: ".js",
            dts: ".d.ts",
        };
    },
});
