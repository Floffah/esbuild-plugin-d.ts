import { getTSConfig } from "./config";
import { Plugin } from "esbuild";
import { readFileSync } from "fs";
import ts from "typescript";

export const dtsPlugin: () => Plugin = () => ({
    name: "dts-plugin",
    async setup(build) {
        const conf = getTSConfig();
        const copts = ts.convertCompilerOptionsFromJson(conf, process.cwd()).options;
        copts.declaration = true;
        copts.emitDeclarationOnly = true;

        const host = ts.createCompilerHost(copts);
        let files: string[] = [];

        build.onLoad({ filter: /(\.tsx|\.ts)$/ }, async (args) => {
            files.push(args.path);

            const file = readFileSync(args.path, "utf-8");

            const compiled = ts.transpileModule(file, conf);
            return {
                contents: compiled.outputText,
            };
        });

        build.onEnd(() => {
            const program = ts.createProgram(files, copts, host);
            program.emit();
        });
    },
});
