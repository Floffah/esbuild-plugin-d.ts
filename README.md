# ESBuild Plugin D.TS

ESBuild plugin for compiling typescript declarations along with your js

## WARNING

This plugin was just made to make it easier to use. It slows down ESBuild to over 3 seconds of compile time just for my small test file

## Config

The plugin uses all built in typescript methods which it will use to find your tsconfig.json file. You do not need to enable declaration or emit declarations only but you probably do want to set declarationDir

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
