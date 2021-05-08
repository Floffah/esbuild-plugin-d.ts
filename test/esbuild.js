const { dtsPlugin } = require("../");
const { build } = require("esbuild");

build({
    bundle: true,
    target: "node16.0",
    platform: "node",
    color: true,
    format: "cjs",
    entryPoints: ["./test/index.ts"],
    outfile: "./test/out.cjs",
    plugins: [dtsPlugin()]
})
