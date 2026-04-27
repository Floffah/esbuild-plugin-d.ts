import chalk from "chalk";
import { existsSync, lstatSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

import { humanizeFileSize } from "./humanizeFileSize";

interface DeclarationOutputLogger {
    info: (...msg: string[]) => void;
}

function getDisplayPath(filePath: string) {
    const absolutePath = resolve(filePath);
    const relativePath = relative(resolve(process.cwd()), absolutePath);

    if (
        relativePath &&
        !relativePath.startsWith("..") &&
        !isAbsolute(relativePath)
    ) {
        return relativePath;
    }

    return absolutePath;
}

export function logDeclarationOutputs(
    log: DeclarationOutputLogger,
    files: string[],
    tsBuildInfoFile?: string,
) {
    for (const file of files) {
        const outputPath = resolve(file);

        if (
            existsSync(outputPath) &&
            (!tsBuildInfoFile || outputPath !== resolve(tsBuildInfoFile))
        ) {
            const stat = lstatSync(outputPath);
            const humanFileSize = humanizeFileSize(stat.size);

            log.info(
                chalk`  {bold ${getDisplayPath(outputPath)}} {cyan ${humanFileSize}}`,
            );
        }
    }
}
