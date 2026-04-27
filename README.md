# `esbuild-plugin-d.ts`

ESBuild plugin for compiling typescript declarations

## WARNING

This plugin was made to make it easier to build declarations without running two commands simultaneously. It will add a lot of overhead to your build time and should only really be used as a last resort.

### Alternatives

- [TSUP](https://npm.im/tsup) - Similar usage to this plugin, but more stable and configurable. A CLI tool wrapped around ESBuild rather than a plugin
- [Estrella](https://npm.im/estrella)

## Version 2 Breaking Changes

- Minimum node version is now v20.
- Supported TypeScript versions are now 5.5 through current 6.x.
- Removed default export, must use dtsPlugin named export.
- Removed helper exports, only plugin and types remain.
    - If people rely on this, I'm happy to add some of it back in a future version.
- Removed the deprecated `outDir` plugin option. Use `compilerOptions.declarationDir` in your tsconfig, or esbuild `outdir`, instead.

## Usage

```js
const { dtsPlugin } = require("esbuild-plugin-d.ts");
const { build } = require("esbuild");
// OR
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { build } from "esbuild";

build({
    entryPoints: ["./test/index.ts"],
    outdir: "./dist",
    plugins: [dtsPlugin({
        // Optional options here
    })]
})

```

The plugin uses the typescript compiler api. You don't need to enable declarations in your tsconfig.
The supported TypeScript range is `>=5.5.0 <7`.

The plugin does not enable incremental mode unless `incremental` is set to true in your tsconfig. When this is enabled, the plugin will automatically assume a tsbuildinfo file but will respect your config if set there.

When no `tsBuildInfoFile` is configured, the plugin stores incremental build info in the OS temp directory by default. Deleting your output directory should not prevent the next incremental build from recreating declarations.

### Bundling

This plugin has experimental declaration bundling support, to enable it, set `experimentalBundling` to true in the plugin's options as follows:

Note that this also requires you to set your entry points in ESBuild.

```js
build({
    entryPoints: ["./test/index.ts"],
    outdir: "./dist",
    plugins: [
        dtsPlugin({
            experimentalBundling: true,
        }),
    ],
});
```

Once proven to be stable, this will be enabled when `bundle` is set to true in ESBuild and will be documented properly.

### Options

- `tsconfig: string | object` - A path to your tsconfig or a tsconfig object. The plugin will automatically find your tsconfig if you don't specify one.
- `buildInfoDir: string` - Directory to store incremental build info files when using incremental builds and no `tsBuildInfoFile` is defined in tsconfig.
- `experimentalBundling: boolean` - Enable experimental declaration bundling support.

All other functionality is derived from your tsconfig

See tests here [here](./tests)
