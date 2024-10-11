import { generateDtsBundle } from "dts-bundle-generator";
import { randomBytes } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, sep as pathSeparator, resolve } from "node:path";
import ts from "typescript";

function getHighestCommonDirectory(paths: string[]): string {
    if (paths.length === 0) {
        return "";
    } else if (paths.length === 1) {
        return dirname(paths[0]);
    }

    const [firstPath, ...otherPaths] = paths.map((p) => p.split(pathSeparator));
    let commonParts = firstPath;

    for (const currentPath of otherPaths) {
        commonParts = commonParts.slice(
            0,
            commonParts.findIndex((part, i) => part !== currentPath[i]) ||
                commonParts.length,
        );
    }

    return commonParts.join(pathSeparator);
}

export function generateBundle(
    entryPoints: string[],
    compilerOptions: ts.CompilerOptions,
    tsconfigPath?: string,
    originalConfig: any = {},
) {
    const commonOutDir = getHighestCommonDirectory(entryPoints);

    const relativeDeclarationPaths = entryPoints.map((entry) =>
        entry.replace(commonOutDir + "/", "").replace(/\.tsx?$/, ".d.ts"),
    );
    const postbundleOutDir = resolve(compilerOptions.declarationDir!, "..");

    let shouldDeleteTsConfig = false;
    if (!tsconfigPath) {
        const tempid = randomBytes(20).toString("hex");

        tsconfigPath = resolve(process.cwd(), `tsconfig.${tempid}.json`);

        writeFileSync(
            tsconfigPath,
            JSON.stringify({
                ...originalConfig,
                compilerOptions,
                include: entryPoints,
            }),
        );

        shouldDeleteTsConfig = true;
    }

    const bundles = generateDtsBundle(
        relativeDeclarationPaths.map((path) => ({
            filePath: resolve(compilerOptions.declarationDir!, path),
        })),
        {
            preferredConfigPath: tsconfigPath,
        },
    );

    for (let i = 0; i < bundles.length; i++) {
        const bundle = bundles[i];
        const originalPath = relativeDeclarationPaths[i];

        const outputPath = resolve(postbundleOutDir, originalPath);

        writeFileSync(outputPath, bundle);
    }

    if (compilerOptions.declarationDir!.endsWith("dts-prebundle")) {
        rmSync(compilerOptions.declarationDir!, { recursive: true });
    }

    if (shouldDeleteTsConfig) {
        rmSync(tsconfigPath);
    }
}
