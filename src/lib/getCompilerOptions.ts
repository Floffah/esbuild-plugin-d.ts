import type { BuildOptions } from "esbuild";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import ts from "typescript";

import type { DTSPluginOpts } from "@/types";
import type { ResolvedTSConfig } from "@/lib/resolveTSConfig";

function isParsedCompilerOptions(
    compilerOptions: unknown,
): compilerOptions is ts.CompilerOptions {
    if (!compilerOptions || typeof compilerOptions !== "object") {
        return false;
    }

    const options = compilerOptions as ts.CompilerOptions;

    return (
        typeof options.target === "number" ||
        typeof options.module === "number" ||
        typeof options.moduleResolution === "number" ||
        typeof options.configFilePath === "string"
    );
}

export function getCompilerOptions(opts: {
    tsconfig:
        | ResolvedTSConfig
        | {
              compilerOptions?: Record<string, unknown>;
          };
    pluginOptions: DTSPluginOpts;
    esbuildOptions: BuildOptions;
    willBundleDeclarations: boolean;
}) {
    const sourceCompilerOptions = opts.tsconfig.compilerOptions ?? {};
    const compilerOptions = isParsedCompilerOptions(sourceCompilerOptions)
        ? { ...sourceCompilerOptions }
        : ts.convertCompilerOptionsFromJson(
              sourceCompilerOptions,
              process.cwd(),
          ).options;

    compilerOptions.declaration = true;
    compilerOptions.emitDeclarationOnly = true;

    if (!compilerOptions.declarationDir) {
        compilerOptions.declarationDir =
            compilerOptions.declarationDir ??
            opts.esbuildOptions.outdir ??
            compilerOptions.outDir;
    }

    if (opts.willBundleDeclarations) {
        compilerOptions.declarationDir = resolve(
            compilerOptions.declarationDir!,
            "dts-prebundle",
        );
    }

    if (compilerOptions.incremental && !compilerOptions.tsBuildInfoFile) {
        const configHash = createHash("sha256")
            .update(
                JSON.stringify({
                    compilerOptions,
                    __buildContext: opts.pluginOptions?.__buildContext,
                }),
            )
            .digest("hex");

        const cacheDir = resolve(
            require.resolve("esbuild/package.json"),
            "../../.cache/esbuild-plugin-d.ts",
        );

        compilerOptions.tsBuildInfoFile = resolve(
            opts.pluginOptions.buildInfoDir ?? cacheDir,
            `esbuild-plugin-dts-${configHash}.tsbuildinfo`,
        );
    }

    compilerOptions.listEmittedFiles = true;

    return compilerOptions;
}
