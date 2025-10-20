import dotenv from "dotenv";
import fs from "fs";
import YAML from "yaml";
dotenv.config();
export class ConfigParser {
    static ParseConfigFile(configFile) {
        const serverConfigFile = fs.readFileSync(configFile.fullPath, {
            encoding: "utf-8"
        });
        return this.interpolate(YAML.parse(serverConfigFile))[configFile.name];
    }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    static interpolate(config) {
        if (typeof config === "string") {
            return config.replace(/%env\((.+?)\)%/g, (_, varName) => {
                return process.env[varName] || "";
            });
        }
        else if (typeof config === "object" && config !== null) {
            for (const key of Object.keys(config)) {
                config[key] = this.interpolate(config[key]);
            }
        }
        return config;
    }
}
//# sourceMappingURL=ConfigParser.js.map