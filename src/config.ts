import ts from "typescript";
import { readFileSync } from "fs";

export function getTSConfig(conf?: string, wd = process.cwd()): any {
    const f = ts.findConfigFile(wd, ts.sys.fileExists, conf);
    if (!f) throw "No config file found";
    const c = ts.readConfigFile(f, (path) => readFileSync(path, "utf-8"));
    if (c.error) throw c.error;
    else return c.config;
}
