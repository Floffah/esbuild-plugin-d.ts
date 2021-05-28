import ts from "typescript";
import { readFileSync } from "fs";

export function getTSConfig(conf?: string, wd = process.cwd()): {loc: string, conf: any} {
    const f = ts.findConfigFile(wd, ts.sys.fileExists, conf);
    if (!f) throw "No config file found";
    const c = ts.readConfigFile(f, (path) => readFileSync(path, "utf-8"));
    if (c.error) throw c.error;
    else return {loc: f, conf: c.config};
}

export interface DTSPluginOpts {
    outDir?: string;
}
