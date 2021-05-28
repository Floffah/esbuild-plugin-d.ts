const {build} = require("estrella");

const dev = process.argv.includes("--watch") || process.argv.includes("--dev");

build({
    bundle: true,
    target: "node16.0",
    platform: "node",
    watch: dev,
    color: true,
    logLevel: "info",
    minify: !dev,
    minifyIdentifiers: !dev,
    minifySyntax: !dev,
    minifyWhitespace: !dev,
    format: "cjs",
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/index.cjs",
    external: ["esbuild", "typescript", "chalk", "tmp"],
    tslint: false,
})
