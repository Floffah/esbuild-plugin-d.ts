# `esbuild-plugin-d.ts`

ESBuild plugin for compiling TypeScript declaration files.

## Warning

This plugin exists for projects that want declaration emit to happen inside an
esbuild build. It uses the TypeScript compiler API and can add noticeable
overhead to build time. If you can run `tsc --emitDeclarationOnly` separately,
that is usually simpler and more predictable.

### Alternatives

- [tsup](https://npm.im/tsup) - a CLI tool around esbuild with declaration
  generation support
- [estrella](https://npm.im/estrella)

## Version 2 Breaking Changes

- Minimum Node.js version is now 20.
- Supported TypeScript versions are now 5.5 through current 6.x
  (`>=5.5.0 <7`).
- The default export has been removed. Use the `dtsPlugin` named export.
- Helper exports have been removed. Only the plugin and public types are
  exported.
- The deprecated `outDir` plugin option has been removed. Use
  `compilerOptions.declarationDir` in your tsconfig, or esbuild `outdir`,
  instead.

## Usage

```js
import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

await build({
    entryPoints: ["./src/index.ts"],
    outdir: "./dist",
    plugins: [dtsPlugin()],
});
```

CommonJS is also supported:

```js
const { build } = require("esbuild");
const { dtsPlugin } = require("esbuild-plugin-d.ts");
```

The plugin uses the TypeScript compiler API. You do not need to enable
`declaration` or `emitDeclarationOnly` in your tsconfig; the plugin sets those
for declaration emit.

Declaration output goes to the first configured location in this order:

1. `compilerOptions.declarationDir`
2. esbuild `outdir`
3. `compilerOptions.outDir`

## Incremental Builds

The plugin only uses TypeScript incremental mode when `incremental` is enabled
in your tsconfig. If `tsBuildInfoFile` is set, the plugin respects it.

When incremental mode is enabled without `tsBuildInfoFile`, build info is stored
under an `esbuild-plugin-d.ts` directory in the OS temp directory by default.
This keeps declaration rebuilds working even if you delete your output
directory. Use `buildInfoDir` to choose a different cache directory.

## Bundling

Declaration bundling is experimental and opt-in:

```js
await build({
    entryPoints: {
        "public/api": "./src/index.ts",
    },
    outdir: "./dist",
    bundle: true,
    plugins: [
        dtsPlugin({
            experimentalBundling: true,
        }),
    ],
});
```

Bundling supports esbuild string entry points, object entry points, and
`{ in, out }` entry point arrays. Bundled declarations are written to the same
custom output paths as esbuild's JavaScript outputs.

## Options

- `tsconfig?: string | object` - Path to the tsconfig to use, or an inline
  tsconfig object. If omitted, the plugin searches for a tsconfig from the
  current working directory.
- `buildInfoDir?: string` - Directory for generated `.tsbuildinfo` files when
  incremental mode is enabled and `tsBuildInfoFile` is not configured.
- `experimentalBundling?: boolean` - Enable experimental declaration bundling.

All other behavior is derived from your tsconfig and esbuild options.
