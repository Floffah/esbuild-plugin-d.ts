When you're free, check out [this discussion](https://github.com/Floffah/esbuild-plugin-d.ts/discussions/3)

# ESBuild Plugin D.TS

ESBuild plugin for compiling typescript declarations along with your outputted js

## WARNING

This plugin was made to make it easier to build declarations without running two commands simultaneously. It slows down ESBuild to over 1-2 seconds of compile time just for my small test file.

Good (faster, and more stable) alternatives include [estrella](https://npm.im/estrella) and my favourite (+ what this project uses), [tsup](https://npm.im/tsup)

## Config

The plugin uses all built in typescript methods which it will use to find your tsconfig.json file. You do not need to enable declaration or emit declarations but you probably do want to set outDir or declarationDir

## Usage
```js
const { dtsPlugin } = require("esbuild-plugin-d.ts");
const { build } = require("esbuild");

build({
    bundle: true,
    target: "node16.0",
    platform: "node",
    format: "cjs",
    entryPoints: ["./test/index.ts"],
    outfile: "./test/out.cjs",
    plugins: [dtsPlugin()]
})

```

See an example [here](./test)
