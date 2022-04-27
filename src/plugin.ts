import { DTSPluginOpts, getTSConfig } from "./config";
import { Plugin } from "esbuild";
import ts from "typescript";
import { existsSync, lstatSync, readFileSync } from "fs";
import chalk from "chalk";
import { getLogLevel, humanFileSize } from "./util";
import { resolve, basename, dirname } from "path";
import { tmpdir } from "tmp";
import { parse } from "jju";

export const dtsPlugin = (opts: DTSPluginOpts = {}) =>
    ({
        name: "dts-plugin",
        async setup(build) {
            // context
            const l = getLogLevel(build.initialOptions.logLevel);
            const conf = getTSConfig(opts.tsconfig);
            const finalconf = conf.conf;

            // get extended config
            if (Object.prototype.hasOwnProperty.call(conf.conf, "extends")) {
                const extendedfile = readFileSync(
                    resolve(dirname(conf.loc), conf.conf.extends),
                    "utf-8",
                );
                const extended = parse(extendedfile);
                if (
                    Object.prototype.hasOwnProperty.call(
                        extended,
                        "compilerOptions",
                    ) &&
                    Object.prototype.hasOwnProperty.call(
                        finalconf,
                        "compilerOptions",
                    )
                ) {
                    finalconf.compilerOptions = {
                        ...extended.compilerOptions,
                        ...finalconf.compilerOptions,
                    };
                }
            }

            // get and alter compiler options
            const copts = ts.convertCompilerOptionsFromJson(
                finalconf.compilerOptions,
                process.cwd(),
            ).options;
            copts.declaration = true;
            copts.emitDeclarationOnly = true;
            copts.incremental = true;
            if (!copts.declarationDir)
                copts.declarationDir =
                    opts.outDir ?? build.initialOptions.outdir ?? copts.outDir;

            // auto incremental
            const pjloc = resolve(conf.loc, "../", "package.json");
            if (existsSync(pjloc)) {
                copts.tsBuildInfoFile = resolve(
                    tmpdir,
                    require(pjloc).name ?? "unnamed",
                    ".esbuild",
                    ".tsbuildinfo",
                );
            }
            copts.listEmittedFiles = true;

            // ts compiler stuff
            const host = copts.incremental ? ts.createIncrementalCompilerHost(copts) : ts.createCompilerHost(copts);
            const files: string[] = [];

            // get all ts files
            build.onLoad({ filter: /(\.tsx|\.ts)$/ }, async (args) => {
                files.push(args.path);

                host.getSourceFile(
                    args.path,
                    copts.target ?? ts.ScriptTarget.Latest,
                    (m) => console.log(m),
                    true,
                );

                return {};
            });

            // finish compilation
            build.onEnd(() => {
                const finalprogram = copts.incremental ? ts.createIncrementalProgram({
                    options: copts,
                    host: host,
                    rootNames: files,
                }) : ts.createProgram(files, copts, host);

                const start = Date.now();
                const emit = finalprogram.emit();

                let final = "";
                if (
                    emit.emitSkipped ||
                    typeof emit.emittedFiles === "undefined"
                ) {
                    if (l.includes("warning"))
                        console.log(
                            chalk`  {yellow Typescript did not emit anything}`,
                        );
                } else {
                    for (const emitted of emit.emittedFiles) {
                        if (
                            existsSync(emitted) &&
                            !emitted.endsWith(".tsbuildinfo")
                        ) {
                            const stat = lstatSync(emitted);
                            final += chalk`  ${resolve(emitted)
                                .replace(resolve(process.cwd()), "")
                                .replace(/^[\\/]/, "")
                                .replace(
                                    basename(emitted),
                                    chalk`{bold ${basename(emitted)}}`,
                                )} {cyan ${humanFileSize(stat.size)}}\n`;
                        }
                    }
                }
                if (l.includes("info"))
                    console.log(
                        final +
                            chalk`\n{green Finished compiling declarations in ${
                                Date.now() - start
                            }ms}`,
                    );
            });
        },
    } as Plugin);
