import { readFileSync } from "fs";
import merge from "lodash.merge";
import { dirname, resolve } from "path";
import ts from "typescript";

export function getTSConfig(opts: {
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
        const parentConfig = getTSConfig({
            ...opts,
            configPath: resolve(dirname(configPath), config.config.extends),
        });

        config.config = merge(config.config, parentConfig);
    }

    if (config.error) {
        throw config.error;
    } else {
        return config.config;
    }
}
