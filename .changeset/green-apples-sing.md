---
"esbuild-plugin-d.ts": patch
---

fix: recover incremental declaration output after the output directory is deleted

When no `tsBuildInfoFile` is configured, the plugin now stores incremental build
info in the OS temp directory by default. If incremental metadata exists but the
declaration outputs have been removed, the next build will invalidate the stale
build info and recreate the missing `.d.ts` files.
