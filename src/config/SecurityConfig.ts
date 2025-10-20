import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { SecurityConfigKey } from "@/core/types"

export class SecurityConfig {
  constructor() {
    return this
  }

  public getConfig() {
    const securityConfigFile = {
      name: "security",
      fullPath: path.join(process.cwd(), "config", "security.yaml")
    }
    return ConfigParser.ParseConfigFile(securityConfigFile)
  }

  public get(key: SecurityConfigKey) {
    const config = this.getConfig()
    return config[key]
  }
}
