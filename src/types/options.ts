import type { TsConfigJson } from "type-fest";

export interface DTSPluginOpts {
    /**
     * path to the tsconfig to use. (some monorepos might need to use this)
     */
    tsconfig?: string | TsConfigJson;
    /**
     * Directory to store build info files in when using incremental builds and no tsBuildInfoFile is defined in tsconfig.
     * Defaults to an esbuild-plugin-d.ts directory under the OS temp directory.
     */
    buildInfoDir?: string;
    /**
     * EXPERIMENTAL: Set to true to bundle the declarations into single files
     */
    experimentalBundling?: boolean;
}
