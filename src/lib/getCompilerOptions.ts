import { createHash } from "crypto";
import { BuildOptions } from "esbuild";
import { resolve } from "path";
import ts from "typescript";

import { DTSPluginOpts } from "@/types";

export function getCompilerOptions(opts: {
    tsconfig: any;
    pluginOptions: DTSPluginOpts;
    esbuildOptions: BuildOptions;
    willBundleDeclarations: boolean;
}) {
    const compilerOptions = ts.convertCompilerOptionsFromJson(
        opts.tsconfig.compilerOptions,
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
