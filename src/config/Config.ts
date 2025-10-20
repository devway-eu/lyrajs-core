import fs from "fs"
import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { ConfigFile } from "@/core/types"

export class Config {
  private folderPath: string
  private configFiles: ConfigFile[] = []

  constructor() {
    this.folderPath = path.join(process.cwd(), "config")
    const folderFiles = fs.readdirSync(this.folderPath).filter((f) => f.endsWith(".yaml"))

    folderFiles.forEach((file) => {
      this.configFiles.push({
        name: file.replace(".yaml", ""),
        fullPath: path.join(this.folderPath, file)
      })
    })
  }

  public get(fullKey: string) {
    const splittedKey: string[] = fullKey.split(".")
    const configFileName: string | null = splittedKey.length > 0 ? splittedKey[0] : null
    const key = splittedKey.length > 1 ? splittedKey[1] : null

    if (this.configFiles.length === 0) {
      throw new Error("No config files found")
    }

    if (!configFileName || !this.configFileExists(configFileName)) {
      throw new Error("Config file not found")
    }

    if (configFileName === "security") {
      throw new Error("Security config access is not allowed")
    }

    if (configFileName === "database") {
      throw new Error("Database config access is not allowed")
    }

    // if (!key) {
    //   throw new Error("Key parameter not found")
    // }

    const configFileFullPath = this.configFiles.find((file) => file.name === configFileName)?.fullPath

    if (!configFileFullPath) {
      throw new Error("Config file not found")
    }

    const requestedConfigFile = {
      name: configFileName,
      fullPath: configFileFullPath
    }

    if (!key) {
      return ConfigParser.ParseConfigFile(requestedConfigFile)
    }

    return ConfigParser.ParseConfigFile(requestedConfigFile)[key]
  }

  public getParam(param: string) {
    const parameterfileFullPath = this.configFiles.find((file) => file.name === "parameters")?.fullPath

    if (!parameterfileFullPath) {
      throw new Error("Config file not found")
    }

    const parsedConfigFile = ConfigParser.ParseConfigFile({
      name: "parameters",
      fullPath: parameterfileFullPath
    })
    return parsedConfigFile[param]
  }

  private configFileExists(file: string | null) {
    return !!this.configFiles.find((f) => f.name === file)
  }
}
