import { isAbsolute, resolve } from "node:path";
import ts from "typescript";

export interface ResolvedTSConfig {
    compilerOptions: ts.CompilerOptions;
}

function normalizeConfigPath(configPath: string, searchPath?: string) {
    if (isAbsolute(configPath)) {
        return configPath;
    }

    return resolve(searchPath ?? process.cwd(), configPath);
}

function parseTSConfig(configPath: string) {
    let unrecoverableDiagnostic: ts.Diagnostic | undefined;

    const parsed = ts.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic(diagnostic) {
                unrecoverableDiagnostic = diagnostic;
            },
        },
    );

    if (unrecoverableDiagnostic) {
        throw new Error(
            ts.flattenDiagnosticMessageText(
                unrecoverableDiagnostic.messageText,
                "\n",
            ),
        );
    }

    if (!parsed) {
        throw new Error(`Failed to parse config file: ${configPath}`);
    }

    const error = parsed.errors.find(
        (diagnostic) =>
            diagnostic.category === ts.DiagnosticCategory.Error &&
            diagnostic.code !== 18003,
    );

    if (error) {
        throw new Error(
            ts.flattenDiagnosticMessageText(error.messageText, "\n"),
        );
    }

    return parsed;
}

export function resolveTSConfig(opts: {
    configPath?: string;
    configName?: string;
    searchPath?: string;
}): {
    config: ResolvedTSConfig;
    configPath: string;
} {
    let configPath =
        opts.configPath ??
        ts.findConfigFile(
            opts.searchPath ?? process.cwd(),
            ts.sys.fileExists,
            opts.configName,
        );

    if (!configPath) {
        throw new Error("No config file found");
    }

    configPath = normalizeConfigPath(configPath, opts.searchPath);

    const parsed = parseTSConfig(configPath);

    return {
        config: {
            compilerOptions: parsed.options,
        },
        configPath,
    };
}
