import { ConfigFile } from "../types/index.js";
export declare class ConfigParser {
    static ParseConfigFile(configFile: ConfigFile): any;
    private static interpolate;
}
