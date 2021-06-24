import ts from "typescript";
import { readFileSync } from "fs";

export function getTSConfig(forcepath?: string, conf?: string, wd = process.cwd()): {loc: string, conf: any} {
    let f = forcepath ?? ts.findConfigFile(wd, ts.sys.fileExists, conf);
    if (!f) throw "No config file found";
    if(f.startsWith(".")) f = require.resolve(f);
    const c = ts.readConfigFile(f, (path) => readFileSync(path, "utf-8"));
    if (c.error) throw c.error;
    else return {loc: f, conf: c.config};
}

export interface DTSPluginOpts {
    /**
     * override the directory to output to.
     * @default undefined
     */
    outDir?: string;
    /**
     * path to the tsconfig to use. (some monorepos might need to use this)
     */
    tsconfig?: string;
}
