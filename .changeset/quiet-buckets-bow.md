---
"esbuild-plugin-d.ts": major
---

Remove the deprecated `outDir` plugin option from the public options type.

Passing `outDir` from JavaScript now emits a warning that the option has been
removed and is ignored. Use `compilerOptions.declarationDir` in tsconfig, or
esbuild `outdir`, instead.
