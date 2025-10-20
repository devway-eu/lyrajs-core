import path from "path";
import { ConfigParser } from "../config/ConfigParser.js";
export class DatabaseConfig {
    constructor() {
        return this;
    }
    getConfig() {
        const dbConfigFile = {
            name: "database",
            fullPath: path.join(process.cwd(), "config", "database.yaml")
        };
        return ConfigParser.ParseConfigFile(dbConfigFile);
    }
    get(key) {
        const config = this.getConfig();
        return config[key];
    }
}
//# sourceMappingURL=DatabaseConfig.js.map