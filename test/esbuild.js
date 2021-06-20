const { dtsPlugin } = require("../");
const { build } = require("esbuild");

build({
    bundle: true,
    target: "node16.0",
    platform: "node",
    color: true,
    logLevel: "info",
    format: "cjs",
    entryPoints: ["./index.ts"],
    outfile: "./dist/out.cjs",
    plugins: [dtsPlugin()],
});
