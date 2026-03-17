import { createRequire } from "node:module";
import { expect, test } from "bun:test";

const require = createRequire(import.meta.url);

test("Package entrypoints work from both CJS and ESM builds", async () => {
    const esmModule = await import("esbuild-plugin-d.ts");
    const cjsModule = require("esbuild-plugin-d.ts");

    expect(typeof esmModule.dtsPlugin).toBe("function");
    expect(typeof esmModule.default).toBe("function");
    expect(typeof cjsModule.dtsPlugin).toBe("function");
    expect(typeof cjsModule.default).toBe("function");
});
