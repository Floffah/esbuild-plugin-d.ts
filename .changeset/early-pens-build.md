---
"esbuild-plugin-d.ts": patch
---

Improve experimental declaration bundling path handling.

Bundling now supports esbuild object entry points and `{ in, out }` entry point
arrays, writes declarations to matching custom output paths, and creates nested
output directories when needed. Bundled declaration logs now report the final
written declaration files instead of temporary prebundle paths.
