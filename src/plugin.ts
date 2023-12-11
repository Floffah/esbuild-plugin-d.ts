import chalk from "chalk";
import { Plugin } from "esbuild";
import { existsSync, lstatSync } from "fs";
import { resolve } from "path";
import ts from "typescript";

import { humanizeFileSize } from "@/lib";
import { getCompilerOptions } from "@/lib/getCompilerOptions";
import { getTSConfig } from "@/lib/getTSConfig";
import { createLogger } from "@/lib/logger";
import { DTSPluginOpts } from "@/types/options";

export const dtsPlugin = (opts: DTSPluginOpts = {}) =>
    ({
        name: "dts-plugin",
        async setup(build) {
            const log = createLogger(build.initialOptions.logLevel);

            const config =
                opts.tsconfig && typeof opts.tsconfig !== "string"
                    ? opts.tsconfig
                    : getTSConfig({
                          configPath: opts.tsconfig,
                      });

            const compilerOptions = getCompilerOptions({
                tsconfig: config,
                pluginOptions: opts,
                esbuildOptions: build.initialOptions,
            });

            const compilerHost = compilerOptions.incremental
                ? ts.createIncrementalCompilerHost(compilerOptions)
                : ts.createCompilerHost(compilerOptions);

            const inputFiles: string[] = [];

            build.onLoad({ filter: /(\.tsx|\.ts)$/ }, async (args) => {
                inputFiles.push(args.path);

                compilerHost.getSourceFile(
                    args.path,
                    compilerOptions.target ?? ts.ScriptTarget.Latest,
                    (m) => console.log(m),
                    true,
                );

                return {};
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

                const startTime = Date.now();
                const emitResult = compilerProgram.emit();

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
            });
        },
    }) as Plugin;
