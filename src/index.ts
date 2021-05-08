import { getTSConfig } from "./config";
import { dtsPlugin } from "./plugin";
import { getLogLevel, humanFileSize } from "./util";

export { dtsPlugin };
export const util = {
    humanFileSize, getLogLevel, getTSConfig,
};
