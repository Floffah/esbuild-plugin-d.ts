import { describe, expect, test } from "bun:test";
import { resolve } from "path";

import { getCompilerOptions } from "../../src/lib/getCompilerOptions";
import { resolveTSConfig } from "../../src/lib/resolveTSConfig";

describe("TSConfig extends is resolved", () => {
    test("Relative path", async () => {
        const { config: tsconfig } = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.json"),
        });

        const { compilerOptions } = getCompilerOptions({
            tsconfig,
            pluginOptions: {},
            esbuildOptions: {},
            willBundleDeclarations: false,
        });

        expect(compilerOptions.strict).toBe(true);
        expect(compilerOptions.emitDecoratorMetadata).toBe(true);
    });

    test("Module paths", async () => {
        const { config: tsconfig } = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.extendsModule.json"),
        });

        const { compilerOptions } = getCompilerOptions({
            tsconfig,
            pluginOptions: {},
            esbuildOptions: {},
            willBundleDeclarations: false,
        });

        expect(compilerOptions.strict).toBe(false);
        expect(compilerOptions.esModuleInterop).toBe(true);
    });

    test("Array options follow TypeScript override semantics", async () => {
        const { config } = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.arrayChild.json"),
        });

        expect(config.compilerOptions.lib).toEqual(["lib.es2020.d.ts"]);
    });

    test("Can discover a config by searchPath and configName", async () => {
        const { config, configPath } = resolveTSConfig({
            searchPath: __dirname,
            configName: "tsconfig.extendsModule.json",
        });

        expect(configPath).toBe(
            resolve(__dirname, "./tsconfig.extendsModule.json"),
        );
        expect(config.compilerOptions.strict).toBe(false);
    });
});
