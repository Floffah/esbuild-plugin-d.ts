import { createHash } from "crypto";
import { BuildOptions } from "esbuild";
import { resolve } from "path";
import { tmpdir } from "tmp";
import ts from "typescript";

import { DTSPluginOpts } from "@/types";

export function getCompilerOptions(opts: {
    tsconfig: any;
    pluginOptions: DTSPluginOpts;
    esbuildOptions: BuildOptions;
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

    if (compilerOptions.incremental && !compilerOptions.tsBuildInfoFile) {
        const configHash = createHash("sha256")
            .update(
                JSON.stringify({
                    compilerOptions,
                    __buildContext: opts.pluginOptions?.__buildContext,
                }),
            )
            .digest("hex");

        compilerOptions.tsBuildInfoFile = resolve(
            opts.pluginOptions.buildInfoDir ?? tmpdir,
            `esbuild-plugin-dts-${configHash}.tsbuildinfo`,
        );
    }

    compilerOptions.listEmittedFiles = true;

    return compilerOptions;
}
