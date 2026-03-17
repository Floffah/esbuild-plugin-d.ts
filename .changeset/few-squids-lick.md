---
"esbuild-plugin-d.ts": major
---

refactor: remove default export

Default export + named exports causes interop issues in cjs consumers

```diff
- import dtsPlugin from "esbuild-plugin-d.ts";
+ import { dtsPlugin } from "esbuild-plugin-d.ts";
```