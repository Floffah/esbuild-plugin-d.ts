import chalk from "chalk";
import { PartialMessage, Plugin } from "esbuild";
import { existsSync, lstatSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

import { humanizeFileSize } from "@/lib";
import { generateBundle } from "@/lib/generateBundle";
import { getCompilerOptions } from "@/lib/getCompilerOptions";
import { createLogger } from "@/lib/logger";
import { resolveTSConfig } from "@/lib/resolveTSConfig";
import { DTSPluginOpts } from "@/types/options";

export const dtsPlugin = (opts: DTSPluginOpts = {}) =>
    ({
        name: "dts-plugin",
        async setup(build) {
            const log = createLogger(build.initialOptions.logLevel);

            const { config, configPath } =
                opts.tsconfig && typeof opts.tsconfig !== "string"
                    ? { config: opts.tsconfig, configPath: undefined }
                    : resolveTSConfig({
                          configPath: opts.tsconfig,
                      });

            // TODO: uncomment once proven to work
            // const willBundleDeclarations =
            //     !!build.initialOptions.bundle &&
            //     Array.isArray(build.initialOptions.entryPoints);
            const willBundleDeclarations =
                !!opts.experimentalBundling &&
                Array.isArray(build.initialOptions.entryPoints);

            const compilerOptions = getCompilerOptions({
                tsconfig: config,
                pluginOptions: opts,
                esbuildOptions: build.initialOptions,
                willBundleDeclarations,
            });

            const compilerHost = compilerOptions.incremental
                ? ts.createIncrementalCompilerHost(compilerOptions)
                : ts.createCompilerHost(compilerOptions);

            const inputFiles: string[] = [];

            build.onLoad({ filter: /(\.tsx|\.ts)$/ }, async (args) => {
                inputFiles.push(args.path);

                const errors: PartialMessage[] = [];

                compilerHost.getSourceFile(
                    args.path,
                    compilerOptions.target ?? ts.ScriptTarget.Latest,
                    (m) => {
                        errors.push({
                            detail: m,
                        });
                    },
                    true,
                );

                return {
                    errors,
                };
            });

            build.onEnd(() => {
                let compilerProgram;

                if (compilerOptions.incremental) {
                    compilerProgram = ts.createIncrementalProgram({
                        options: compilerOptions,
                        host: compilerHost,
                        rootNames: inputFiles,
                    });
                } else {
                    compilerProgram = ts.createProgram(
                        inputFiles,
                        compilerOptions,
                        compilerHost,
                    );
                }

                const diagnostics = ts
                    .getPreEmitDiagnostics(compilerProgram as ts.Program)
                    .map(
                        (d) =>
                            ({
                                text:
                                    typeof d.messageText === "string"
                                        ? d.messageText
                                        : d.messageText.messageText,
                                detail: d,
                                location: {
                                    file: d.file?.fileName,
                                    namespace: "file",
                                },
                                category: d.category,
                            }) satisfies PartialMessage & {
                                category: ts.DiagnosticCategory;
                            },
                    );

                const errors = diagnostics
                    .filter((d) => d.category === ts.DiagnosticCategory.Error)
                    .map(({ category: _, ...message }) => message);

                const warnings = diagnostics
                    .filter((d) => d.category === ts.DiagnosticCategory.Warning)
                    .map(({ category: _, ...message }) => message);

                if (errors.length > 0) {
                    return {
                        errors,
                        warnings,
                    };
                }

                const startTime = Date.now();
                const emitResult = compilerProgram.emit();

                if (willBundleDeclarations) {
                    let entryPoints: string[] = [];

                    if (Array.isArray(build.initialOptions.entryPoints)) {
                        entryPoints = build.initialOptions.entryPoints.map(
                            (entry: string | { in: string }) =>
                                typeof entry === "string" ? entry : entry.in,
                        );
                    } else {
                        entryPoints = Object.values(
                            build.initialOptions.entryPoints!,
                        );
                    }

                    generateBundle(
                        entryPoints,
                        compilerOptions,
                        configPath,
                        config,
                    );
                }

                if (
                    emitResult.emitSkipped ||
                    typeof emitResult.emittedFiles === "undefined"
                ) {
                    log.info(chalk`{yellow No declarations emitted}`);
                } else {
                    for (const emittedFile of emitResult.emittedFiles) {
                        const emittedPath = resolve(emittedFile);

                        if (
                            existsSync(emittedPath) &&
                            emittedPath !== compilerOptions.tsBuildInfoFile
                        ) {
                            const stat = lstatSync(emittedPath);

                            const pathFromContentRoot = emittedPath
                                .replace(resolve(process.cwd()), "")
                                .replace(/^[\\/]/, "");
                            const humanFileSize = humanizeFileSize(stat.size);

                            log.info(
                                chalk`  {bold ${pathFromContentRoot}} {cyan ${humanFileSize}}`,
                            );
                        }
                    }
                }

                log.info(
                    chalk`{green Finished compiling declarations in ${
                        Date.now() - startTime
                    }ms}`,
                );

                return {
                    warnings,
                };
            });
        },
    }) as Plugin;
