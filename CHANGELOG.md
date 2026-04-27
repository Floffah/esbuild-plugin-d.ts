# esbuild-plugin-d.ts

## 2.0.0

### Major Changes

- [#28](https://github.com/Floffah/esbuild-plugin-d.ts/pull/28) [`180e511`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/180e51140647197cc388b5ef6710818fb288eca1) Thanks [@Floffah](https://github.com/Floffah)! - refactor: only export plugin itself & options type

- [#27](https://github.com/Floffah/esbuild-plugin-d.ts/pull/27) [`5062d5c`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/5062d5ce275d529c5b82b93081251976f3a1fb25) Thanks [@Floffah](https://github.com/Floffah)! - refactor: remove default export

    Default export + named exports causes interop issues in cjs consumers

    ```diff
    - import dtsPlugin from "esbuild-plugin-d.ts";
    + import { dtsPlugin } from "esbuild-plugin-d.ts";
    ```

- [#31](https://github.com/Floffah/esbuild-plugin-d.ts/pull/31) [`ebcc410`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/ebcc41081fc240213c876a852cd70150d6aa793c) Thanks [@Floffah](https://github.com/Floffah)! - Remove the deprecated `outDir` plugin option from the public options type.

    Passing `outDir` from JavaScript now emits a warning that the option has been
    removed and is ignored. Use `compilerOptions.declarationDir` in tsconfig, or
    esbuild `outdir`, instead.

- [#26](https://github.com/Floffah/esbuild-plugin-d.ts/pull/26) [`9270bd2`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/9270bd2c7b74656d10247837fdb6e41e696bf146) Thanks [@Floffah](https://github.com/Floffah)! - chore: raise the minimum supported Node.js version to 20

- [#30](https://github.com/Floffah/esbuild-plugin-d.ts/pull/30) [`4e1315f`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/4e1315fdc759b07c1cbf0f6fd48c37fd17373f2b) Thanks [@Floffah](https://github.com/Floffah)! - chore: narrow the supported TypeScript peer range to 5.5 through current 6.x

    This package uses the TypeScript compiler API directly and is now only supported
    with `typescript >=5.5.0 <7`.

### Minor Changes

- [#28](https://github.com/Floffah/esbuild-plugin-d.ts/pull/28) [`180e511`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/180e51140647197cc388b5ef6710818fb288eca1) Thanks [@Floffah](https://github.com/Floffah)! - fix: use real typescript compiler options resolution rather than merging

### Patch Changes

- [#25](https://github.com/Floffah/esbuild-plugin-d.ts/pull/25) [`1aba9c8`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/1aba9c8034461e9105cdf0228505b1ac9609b97d) Thanks [@Floffah](https://github.com/Floffah)! - ci: update lint tooling & build tooling

- [#31](https://github.com/Floffah/esbuild-plugin-d.ts/pull/31) [`ebcc410`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/ebcc41081fc240213c876a852cd70150d6aa793c) Thanks [@Floffah](https://github.com/Floffah)! - Improve experimental declaration bundling path handling.

    Bundling now supports esbuild object entry points and `{ in, out }` entry point
    arrays, writes declarations to matching custom output paths, and creates nested
    output directories when needed. Custom outputs that already end in `.d.ts`,
    `.d.mts`, or `.d.cts` are preserved as-is. Bundled declaration logs now report
    the final written declaration files instead of temporary prebundle paths.

- [`ee6fd1b`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/ee6fd1b531abda88e0598c95ba8a47fe9c67286e) Thanks [@Floffah](https://github.com/Floffah)! - fix: recover incremental declaration output after the output directory is deleted

    When no `tsBuildInfoFile` is configured, the plugin now stores incremental build
    info in the OS temp directory by default. If incremental metadata exists but the
    declaration outputs have been removed, the next build will invalidate the stale
    build info and recreate the missing `.d.ts` files.

- [#23](https://github.com/Floffah/esbuild-plugin-d.ts/pull/23) [`4551f6d`](https://github.com/Floffah/esbuild-plugin-d.ts/commit/4551f6df9cd4326df635abbc1a144ff391ea904f) Thanks [@Floffah](https://github.com/Floffah)! - Replace semantic versioning with changesets
