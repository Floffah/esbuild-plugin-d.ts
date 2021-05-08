import { getTSConfig } from "./config";
import { Plugin } from "esbuild";
import ts from "typescript";
import { existsSync, lstatSync } from "fs";
import chalk from "chalk";
import { getLogLevel, humanFileSize } from "./util";
import { resolve } from "path";
import { tmpdir } from "tmp";

export const dtsPlugin: () => Plugin = () => ({
    name: "dts-plugin",
    async setup(build) {
        const l = getLogLevel(build.initialOptions.logLevel);
        const conf = getTSConfig();
        const copts = ts.convertCompilerOptionsFromJson(conf.conf, process.cwd()).options;
        copts.declaration = true;
        copts.emitDeclarationOnly = true;
        copts.incremental = true;
        const pjloc = resolve(conf.loc, "../", "package.json");
        if (existsSync(pjloc)) {
            copts.tsBuildInfoFile = resolve(tmpdir, require(pjloc).name ?? "unnamed", ".esbuild", ".tsbuildinfo");
        }
        copts.listEmittedFiles = true;


        const host = ts.createCompilerHost(copts);
        let files: string[] = [];

        build.onLoad({ filter: /(\.tsx|\.ts)$/ }, async (args) => {
            files.push(args.path);

            return {};
        });

        build.onEnd(() => {
            if (l.includes("info")) console.log();
            const start = Date.now();
            const program = ts.createProgram(files, copts, host);
            const emit = program.emit();
            let final = "";
            if (emit.emitSkipped || typeof emit.emittedFiles === "undefined") {
                if (l.includes("warning")) console.log(chalk`  {yellow Typescript did not emit anything}`);
            } else {
                for (const emitted of emit.emittedFiles) {
                    if (existsSync(emitted) && !emitted.endsWith(".tsbuildinfo")) {
                        const stat = lstatSync(emitted);
                        final += chalk`  {gray ${emitted}} {green ${humanFileSize(stat.size)}}\n`;
                    }
                }
            }
            if (l.includes("info")) console.log(final + chalk`\n{green Finished compiling declarations in ${Date.now() - start}ms}`);
        });
    },
});
