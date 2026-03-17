import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

function getDeclarationOutputs(
    inputFiles: string[],
    compilerOptions: ts.CompilerOptions,
    parsedCommandLine?: ts.ParsedCommandLine,
) {
    if (inputFiles.length === 0) {
        return [];
    }

    if (parsedCommandLine) {
        const commandLine: ts.ParsedCommandLine = {
            ...parsedCommandLine,
            fileNames: inputFiles,
            options: compilerOptions,
        };

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

    const declarationRoot =
        compilerOptions.declarationDir ?? compilerOptions.outDir;

    if (!declarationRoot) {
        return [];
    }

    return inputFiles.map((inputFile) =>
        resolve(
            declarationRoot,
            inputFile.replace(/^.*[\\/]/, "").replace(/\.tsx?$/, ".d.ts"),
        ),
    );
}

export function clearStaleBuildInfo(
    inputFiles: string[],
    compilerOptions: ts.CompilerOptions,
    parsedCommandLine?: ts.ParsedCommandLine,
) {
    if (!compilerOptions.incremental || !compilerOptions.tsBuildInfoFile) {
        return;
    }

    if (!existsSync(compilerOptions.tsBuildInfoFile)) {
        return;
    }

    const expectedOutputs = getDeclarationOutputs(
        inputFiles,
        compilerOptions,
        parsedCommandLine,
    );

    if (
        expectedOutputs.length > 0 &&
        expectedOutputs.some((outputPath) => !existsSync(outputPath))
    ) {
        rmSync(compilerOptions.tsBuildInfoFile, { force: true });
    }
}
