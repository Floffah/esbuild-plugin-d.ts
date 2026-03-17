import type { BuildOptions } from "esbuild";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
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

export interface CompilerOptionsResult {
    bundleOutDir?: string;
    compilerOptions: ts.CompilerOptions;
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
}): CompilerOptionsResult {
    const sourceCompilerOptions = opts.tsconfig.compilerOptions ?? {};
    const compilerOptions = isParsedCompilerOptions(sourceCompilerOptions)
        ? { ...sourceCompilerOptions }
        : ts.convertCompilerOptionsFromJson(
              sourceCompilerOptions,
              process.cwd(),
          ).options;

    compilerOptions.declaration = true;
    compilerOptions.emitDeclarationOnly = true;

    const bundleOutDir =
        compilerOptions.declarationDir ??
        opts.esbuildOptions.outdir ??
        compilerOptions.outDir;

    compilerOptions.declarationDir = bundleOutDir;

    const cacheDir = resolve(tmpdir(), "esbuild-plugin-d.ts");
    const cacheRoot = opts.pluginOptions.buildInfoDir ?? cacheDir;
    const configHash = createHash("sha256")
        .update(
            JSON.stringify({
                compilerOptions,
                __buildContext: opts.pluginOptions?.__buildContext,
                willBundleDeclarations: opts.willBundleDeclarations,
            }),
        )
        .digest("hex");

    if (compilerOptions.incremental && !compilerOptions.tsBuildInfoFile) {
        compilerOptions.tsBuildInfoFile = resolve(
            cacheRoot,
            `esbuild-plugin-dts-${configHash}.tsbuildinfo`,
        );
    }

    if (opts.willBundleDeclarations) {
        compilerOptions.declarationDir = resolve(
            cacheRoot,
            `esbuild-plugin-dts-${configHash}-prebundle`,
        );
    }

    compilerOptions.listEmittedFiles = true;

    return {
        compilerOptions,
        bundleOutDir: opts.willBundleDeclarations ? bundleOutDir : undefined,
    };
}
