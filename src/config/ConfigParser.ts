import dotenv from "dotenv"
import fs from "fs"
import YAML from "yaml"

import { ConfigFile } from "@/core/types"

dotenv.config()

/**
 * ConfigParser class
 * Parses YAML configuration files and interpolates environment variables
 * Supports %env(VAR_NAME)% syntax for environment variable substitution
 */
export class ConfigParser {
  /**
   * Parses a YAML configuration file and interpolates environment variables
   * Reads the file, parses YAML content, and replaces %env()% placeholders with actual values
   * @param {ConfigFile} configFile - Configuration file object containing name and full path
   * @returns {any} - Parsed and interpolated configuration object for the specified file
   * @example
   * const config = ConfigParser.ParseConfigFile({
   *   name: 'database',
   *   fullPath: '/path/to/config/database.yaml'
   * })
   */
  public static ParseConfigFile(configFile: ConfigFile) {
    const serverConfigFile = fs.readFileSync(configFile.fullPath, {
      encoding: "utf-8"
    })

    return this.interpolate(YAML.parse(serverConfigFile))[configFile.name]
  }

  /**
   * Recursively interpolates environment variables in configuration values
   * Replaces %env(VAR_NAME)% patterns with actual environment variable values
   * @param {any} config - Configuration value (string, object, or primitive)
   * @returns {any} - Interpolated configuration value
   * @private
   */
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
