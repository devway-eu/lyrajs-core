import dotenv from "dotenv"
import fs from "fs"
import YAML from "yaml"

import { ConfigFile } from "@/core/types"

dotenv.config()

export class ConfigParser {
  public static ParseConfigFile(configFile: ConfigFile) {
    const serverConfigFile = fs.readFileSync(configFile.fullPath, {
      encoding: "utf-8"
    })

    return this.interpolate(YAML.parse(serverConfigFile))[configFile.name]
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static interpolate(config: any) {
    if (typeof config === "string") {
      return config.replace(/%env\((.+?)\)%/g, (_, varName) => {
        return process.env[varName] || ""
      })
    } else if (typeof config === "object" && config !== null) {
      for (const key of Object.keys(config)) {
        config[key] = this.interpolate(config[key])
      }
    }
    return config
  }
}
