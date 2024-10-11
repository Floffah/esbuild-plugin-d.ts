import {TsconfigRaw} from "esbuild";

export interface DTSPluginOpts {
    /**
     * override the directory to output to.
     * @deprecated define declarationDir in tsconfig instead
     */
    outDir?: string;
    /**
     * path to the tsconfig to use. (some monorepos might need to use this)
     */
    tsconfig?: string | TsconfigRaw;
    /**
     * Directory to store build info files in (only if using incremental builds and no tsBuildInfoFile is defined in tsconfig)
     * @default os tmp directory
     */
    buildInfoDir?: string;
    /**
     * EXPERIMENTAL: Set to true to bundle the declarations into single files
     */
    experimentalBundling?: boolean;
    /**
     * For testing purposes, allows adding a context to different builds with the same tsconfig.
     */
    __buildContext?: any;
}