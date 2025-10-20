import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { DbConfigKey } from "@/core/types"

export class DatabaseConfig {
  constructor() {
    return this
  }

  public getConfig() {
    const dbConfigFile = {
      name: "database",
      fullPath: path.join(process.cwd(), "config", "database.yaml")
    }
    return ConfigParser.ParseConfigFile(dbConfigFile)
  }

  public get(key: DbConfigKey) {
    const config = this.getConfig()
    return config[key]
  }
}
