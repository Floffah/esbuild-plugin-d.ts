import { getCompilerOptions, resolveTSConfig } from "../../dist";
import { describe, expect, test } from "bun:test";
import { resolve } from "path";

describe("TSConfig extends is resolved", () => {
    test("Relative path", async () => {
        const { config: tsconfig } = resolveTSConfig({
            configPath: resolve(__dirname, "./tsconfig.json"),
        });

        const compilerOptions = getCompilerOptions({
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

        const compilerOptions = getCompilerOptions({
            tsconfig,
            pluginOptions: {},
            esbuildOptions: {},
            willBundleDeclarations: false,
        });

        expect(compilerOptions.strict).toBe(false);
        expect(compilerOptions.esModuleInterop).toBe(true);
    });
});
