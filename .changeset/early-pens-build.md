---
"esbuild-plugin-d.ts": patch
---

Improve experimental declaration bundling path handling.

Bundling now supports esbuild object entry points and `{ in, out }` entry point
arrays, writes declarations to matching custom output paths, and creates nested
output directories when needed. Custom outputs that already end in `.d.ts`,
`.d.mts`, or `.d.cts` are preserved as-is. Bundled declaration logs now report
the final written declaration files instead of temporary prebundle paths.
