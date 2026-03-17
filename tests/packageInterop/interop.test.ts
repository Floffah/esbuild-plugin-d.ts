import { expect, test } from "bun:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

test("Package entrypoints work from both CJS and ESM builds", async () => {
    const esmModule = await import("esbuild-plugin-d.ts");
    const cjsModule = require("esbuild-plugin-d.ts");

    expect(typeof esmModule.dtsPlugin).toBe("function");
    expect(typeof cjsModule.dtsPlugin).toBe("function");
    expect("default" in esmModule).toBe(false);
    expect("default" in cjsModule).toBe(false);
});
