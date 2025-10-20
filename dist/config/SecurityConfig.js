import path from "path";
import { ConfigParser } from "../config/ConfigParser.js";
export class SecurityConfig {
    constructor() {
        return this;
    }
    getConfig() {
        const securityConfigFile = {
            name: "security",
            fullPath: path.join(process.cwd(), "config", "security.yaml")
        };
        return ConfigParser.ParseConfigFile(securityConfigFile);
    }
    get(key) {
        const config = this.getConfig();
        return config[key];
    }
}
//# sourceMappingURL=SecurityConfig.js.map