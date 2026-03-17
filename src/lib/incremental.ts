import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import type { TsConfigJson } from "type-fest";

import type { ResolvedTSConfig } from "./resolveTSConfig";

type InlineTSConfig = TsConfigJson | { compilerOptions?: Record<string, unknown> };

function createInlineCommandLine(tsconfig: InlineTSConfig) {
    return ts.parseJsonConfigFileContent(
        tsconfig,
        ts.sys,
        process.cwd(),
        undefined,
        "tsconfig.json",
    );
}

export function getEmitCommandLine(opts: {
    compilerOptions: ts.CompilerOptions;
    inputFiles: string[];
    parsedCommandLine?: ts.ParsedCommandLine;
    tsconfig?: InlineTSConfig | ResolvedTSConfig;
}) {
    if (opts.inputFiles.length === 0) {
        return undefined;
    }

    const parsedCommandLine =
        opts.parsedCommandLine ??
        (opts.tsconfig && "parsedCommandLine" in opts.tsconfig
            ? opts.tsconfig.parsedCommandLine
            : opts.tsconfig
              ? createInlineCommandLine(opts.tsconfig)
              : undefined);

    if (!parsedCommandLine) {
        return undefined;
    }

    return {
        ...parsedCommandLine,
        fileNames: opts.inputFiles,
        options: {
            ...opts.compilerOptions,
            configFilePath:
                opts.compilerOptions.configFilePath ??
                parsedCommandLine.options.configFilePath ??
                resolve(process.cwd(), "tsconfig.json"),
        },
    } satisfies ts.ParsedCommandLine;
}

function getDeclarationOutputs(
    inputFiles: string[],
    commandLine?: ts.ParsedCommandLine,
) {
    if (inputFiles.length === 0 || !commandLine) {
        return [];
    }

    return inputFiles.flatMap((inputFile) =>
        ts
            .getOutputFileNames(
                commandLine,
                inputFile,
                !ts.sys.useCaseSensitiveFileNames,
            )
            .filter(
                (outputFile) =>
                    outputFile.endsWith(".d.ts") ||
                    outputFile.endsWith(".d.cts") ||
                    outputFile.endsWith(".d.mts"),
            ),
    );
}

export function clearStaleBuildInfo(
    inputFiles: string[],
    compilerOptions: ts.CompilerOptions,
    commandLine?: ts.ParsedCommandLine,
) {
    if (!compilerOptions.incremental || !compilerOptions.tsBuildInfoFile) {
        return;
    }

    if (!existsSync(compilerOptions.tsBuildInfoFile)) {
        return;
    }

    const expectedOutputs = getDeclarationOutputs(inputFiles, commandLine);

    if (
        expectedOutputs.length > 0 &&
        expectedOutputs.some((outputPath) => !existsSync(outputPath))
    ) {
        rmSync(compilerOptions.tsBuildInfoFile, { force: true });
    }
}
