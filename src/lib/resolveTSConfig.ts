import { readFileSync } from "fs";
import merge from "lodash.merge";
import { dirname, resolve } from "path";
import ts from "typescript";

function resolveModulePath(path: string) {
    try {
        return require.resolve(path);
    } catch (e) {
        return undefined;
    }
}

export function resolveTSConfig(opts: {
    configPath?: string;
    configName?: string;
    searchPath?: string;
}) {
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

    if (configPath.startsWith(".")) {
        configPath = require.resolve(configPath);
    }

    const config = ts.readConfigFile(configPath, (path) =>
        readFileSync(path, "utf-8"),
    );

    if (config.config.extends) {
        const parentConfig = resolveTSConfig({
            ...opts,
            configPath:
                resolveModulePath(config.config.extends) ??
                resolve(dirname(configPath), config.config.extends),
        }).config;

        config.config = merge(parentConfig, config.config);
    }

    if (config.error) {
        throw config.error;
    } else {
        return {
            config: config.config,
            configPath,
        };
    }
}
