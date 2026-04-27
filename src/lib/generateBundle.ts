import { generateDtsBundle } from "dts-bundle-generator";
import type { BuildOptions } from "esbuild";
import { randomBytes } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, sep as pathSeparator, relative, resolve } from "node:path";
import ts from "typescript";

export interface BundleEntryPoint {
    inputPath: string;
    outputPath: string;
}

function getHighestCommonDirectory(paths: string[]): string {
    if (paths.length === 0) {
        return "";
    }

    const [firstPath, ...otherPaths] = paths;

    if (!firstPath) {
        return "";
    }

    if (otherPaths.length === 0) {
        return dirname(firstPath);
    }

    const [firstParts, ...otherPathParts] = paths.map((p) =>
        resolve(p).split(/[\\/]/),
    );

    if (!firstParts) {
        return "";
    }

    let commonParts = firstParts;

    for (const currentPath of otherPathParts) {
        commonParts = commonParts.slice(
            0,
            commonParts.findIndex((part, i) => part !== currentPath[i]) ||
                commonParts.length,
        );
    }

    return commonParts.join(pathSeparator);
}

function replaceDeclarationExtension(path: string) {
    if (/\.[cm]?[tj]sx?$/.test(path)) {
        return path.replace(/\.[cm]?[tj]sx?$/, ".d.ts");
    }

    return `${path}.d.ts`;
}

export function resolveBundleEntryPoints(
    entryPoints: NonNullable<BuildOptions["entryPoints"]>,
): BundleEntryPoint[] {
    const inputPaths = Array.isArray(entryPoints)
        ? entryPoints.map((entry) =>
              typeof entry === "string" ? entry : entry.in,
          )
        : Object.values(entryPoints);
    const commonOutDir = getHighestCommonDirectory(inputPaths);

    if (Array.isArray(entryPoints)) {
        return entryPoints.map((entry) => {
            if (typeof entry === "string") {
                return {
                    inputPath: entry,
                    outputPath: replaceDeclarationExtension(
                        relative(commonOutDir, entry),
                    ),
                };
            }

            return {
                inputPath: entry.in,
                outputPath: replaceDeclarationExtension(entry.out),
            };
        });
    }

    return Object.entries(entryPoints).map(([outputPath, inputPath]) => ({
        inputPath: inputPath as string,
        outputPath: replaceDeclarationExtension(outputPath),
    }));
}

function resolveDeclarationInputPath(
    entryPoint: BundleEntryPoint,
    compilerOptions: ts.CompilerOptions,
    commandLine?: ts.ParsedCommandLine,
) {
    if (commandLine) {
        const declarationOutput = ts
            .getOutputFileNames(
                commandLine,
                entryPoint.inputPath,
                !ts.sys.useCaseSensitiveFileNames,
            )
            .find(
                (outputPath) =>
                    outputPath.endsWith(".d.ts") ||
                    outputPath.endsWith(".d.cts") ||
                    outputPath.endsWith(".d.mts"),
            );

        if (declarationOutput) {
            return declarationOutput;
        }
    }

    const commonOutDir = getHighestCommonDirectory([entryPoint.inputPath]);

    return resolve(
        compilerOptions.declarationDir!,
        replaceDeclarationExtension(
            relative(commonOutDir, entryPoint.inputPath),
        ),
    );
}

export function generateBundle(
    entryPoints: BundleEntryPoint[],
    compilerOptions: ts.CompilerOptions,
    bundleOutDir: string,
    tsconfigPath?: string,
    originalConfig?: any,
    commandLine?: ts.ParsedCommandLine,
) {
    let shouldDeleteTsConfig = false;
    if (!tsconfigPath && originalConfig) {
        const tempid = randomBytes(6).toString("hex");

        tsconfigPath = resolve(process.cwd(), `tsconfig.${tempid}.json`);

        writeFileSync(
            tsconfigPath,
            JSON.stringify({
                ...originalConfig,
                compilerOptions: {
                    ...originalConfig.compilerOptions,
                    declaration: true,
                    emitDeclarationOnly: true,
                    declarationDir: bundleOutDir,
                },
                include: entryPoints.map((entry) => entry.inputPath),
            }),
        );

        shouldDeleteTsConfig = true;
    }

    try {
        const bundles = generateDtsBundle(
            entryPoints.map((entry) => ({
                filePath: resolveDeclarationInputPath(
                    entry,
                    compilerOptions,
                    commandLine,
                ),
            })),
            {
                preferredConfigPath: tsconfigPath,
            },
        );

        for (let i = 0; i < bundles.length; i++) {
            const bundle = bundles[i];
            const entryPoint = entryPoints[i];

            if (!bundle || !entryPoint) {
                continue;
            }

            const outputPath = resolve(bundleOutDir, entryPoint.outputPath);

            mkdirSync(dirname(outputPath), { recursive: true });
            writeFileSync(outputPath, bundle);
        }
    } finally {
        if (shouldDeleteTsConfig && tsconfigPath) {
            rmSync(tsconfigPath);
        }
    }
}
