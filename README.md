# `esbuild-plugin-d.ts`

ESBuild plugin for compiling typescript declarations

## WARNING

This plugin was made to make it easier to build declarations without running two commands simultaneously. It will add a lot of overhead to your build time and should only really be used as a last resort.

### Alternatives

- [TSUP](https://npm.im/tsup) - Similar usage to this plugin, but more stable and configurable. A CLI tool wrapped around ESBuild rather than a plugin
- [Estrella](https://npm.im/estrella)

## Usage

```js
const { dtsPlugin } = require("esbuild-plugin-d.ts");
const { build } = require("esbuild");

build({
    entryPoints: ["./test/index.ts"],
    outdir: "./dist",
    plugins: [dtsPlugin({
        // Optional options here
    })]
})

```

The plugin uses the typescript compiler api. You don't need to enable declarations in your tsconfig.

- Plugin does not enable incremental mode unless `incremental` is set to true in your tsconfig. When this is enabled, the plugin will automatically assume a tsbuildinfo file but will respect your config if set there.
    - Be aware that if you delete your dist folder and have incremental mode enabled, your declarations may not be built.

### Options

- `outDir: string` (DEPRECATED) - override the output directory - you should define declarationDir in your tsconfig instead. The plugin will also fall back to your tsconfig outDir or esbuild outdir
- `tsconfig: string | object` - A path to your tsconfig or a tsconfig object. The plugin will automatically find your tsconfig if you don't specify one.

All other functionality is derived from your tsconfig

See tests here [here](./tests)
