import chalk from "chalk";
import type { PartialMessage, Plugin } from "esbuild";
import { existsSync, lstatSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

import { humanizeFileSize } from "@/lib";
import { generateBundle, resolveBundleEntryPoints } from "@/lib/generateBundle";
import { getCompilerOptions } from "@/lib/getCompilerOptions";
import { clearStaleBuildInfo, getEmitCommandLine } from "@/lib/incremental";
import { createLogger } from "@/lib/logger";
import { resolveTSConfig } from "@/lib/resolveTSConfig";
import type { DTSPluginOpts } from "@/types/options";

export const dtsPlugin = (opts: DTSPluginOpts = {}) =>
    ({
        name: "dts-plugin",
        async setup(build) {
            const log = createLogger(build.initialOptions.logLevel);

            if ("outDir" in opts) {
                build.onStart(() => ({
                    warnings: [
                        {
                            text: 'The dtsPlugin "outDir" option was removed in v2 and is ignored. Use "compilerOptions.declarationDir" in your tsconfig, or esbuild "outdir", instead.',
                        },
                    ],
                }));
            }

            const { config, configPath } =
                opts.tsconfig && typeof opts.tsconfig !== "string"
                    ? { config: opts.tsconfig, configPath: undefined }
                    : resolveTSConfig({
                          configPath: opts.tsconfig,
                      });

            const willBundleDeclarations =
                !!opts.experimentalBundling &&
                !!build.initialOptions.entryPoints;

            const { bundleOutDir, compilerOptions } = getCompilerOptions({
                tsconfig: config,
                pluginOptions: opts,
                esbuildOptions: build.initialOptions,
                willBundleDeclarations,
            });
            const parsedCommandLine =
                "parsedCommandLine" in config
                    ? config.parsedCommandLine
                    : undefined;

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
                    const emitCommandLine = getEmitCommandLine({
                        tsconfig: config,
                        compilerOptions,
                        inputFiles,
                        parsedCommandLine,
                    });

                    clearStaleBuildInfo(
                        inputFiles,
                        compilerOptions,
                        emitCommandLine,
                    );

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

                const errors: PartialMessage[] = diagnostics
                    .filter((d) => d.category === ts.DiagnosticCategory.Error)
                    .map(({ category: _, ...message }) => message);

                const warnings: PartialMessage[] = diagnostics
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
                    const entryPoints = build.initialOptions.entryPoints;

                    if (!entryPoints) {
                        errors.push({
                            text: "Declaration bundling is enabled, but no entry points were provided.",
                        });
                        return {
                            errors,
                            warnings,
                        };
                    }

                    if (!bundleOutDir) {
                        errors.push({
                            text:
                                "Declaration bundling is enabled, but no output directory was provided. " +
                                "Please configure one via `compilerOptions.declarationDir`, esbuild `outdir`, " +
                                "or `compilerOptions.outDir`.",
                        });
                        return {
                            errors,
                            warnings,
                        };
                    }

                    generateBundle(
                        resolveBundleEntryPoints(entryPoints),
                        compilerOptions,
                        bundleOutDir,
                        configPath,
                        config,
                        getEmitCommandLine({
                            tsconfig: config,
                            compilerOptions,
                            inputFiles: inputFiles,
                            parsedCommandLine,
                        }),
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
