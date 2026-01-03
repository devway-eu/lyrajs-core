import fs from "fs"
import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { ConfigFile } from "@/core/types"

/**
 * Config class
 * Central configuration manager for LyraJS applications
 * Loads and provides access to all YAML configuration files in the config directory
 * Enforces use of specialized config classes for security and database settings
 */
export class Config {
  private folderPath: string
  private configFiles: ConfigFile[] = []

  /**
   * Creates a new Config instance
   * Scans the config directory and loads all YAML configuration files
   * @example
   * const config = new Config()
   * const appName = config.get('app.name')
   */
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

  /**
   * Retrieves a configuration value using dot notation
   * Supports file.key format (e.g., 'router.base_path')
   * Returns entire config file if only filename is provided
   * Prevents direct access to security and database configs
   * @param {string} fullKey - Configuration key in format 'filename.key' or just 'filename'
   * @returns {any} - Configuration value for the specified key
   * @throws {Error} - If no config files found, file not found, or accessing restricted configs
   * @example
   * const config = new Config()
   * const basePath = config.get('router.base_path')
   * const routerConfig = config.get('router')
   */
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
      throw new Error(
        'Direct security config access is not allowed. Use SecurityConfig class instead:\n' +
        'import { SecurityConfig } from "@lyra-js/core"\n' +
        'const securityConfig = new SecurityConfig().getConfig()'
      )
    }

    if (configFileName === "database") {
      throw new Error(
        'Direct database config access is not allowed. Use DatabaseConfig class instead:\n' +
        'import { DatabaseConfig } from "@lyra-js/core"\n' +
        'const databaseConfig = new DatabaseConfig().getConfig()'
      )
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

  /**
   * Retrieves a parameter from the parameters.yaml file
   * Provides direct access to custom application parameters
   * @param {string} param - Parameter name to retrieve
   * @returns {any} - Parameter value
   * @throws {Error} - If parameters.yaml file not found
   * @example
   * const config = new Config()
   * const appVersion = config.getParam('app_version')
   */
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

  /**
   * Checks if a configuration file exists in the loaded config files
   * @param {string | null} file - Configuration filename to check (without .yaml extension)
   * @returns {boolean} - True if file exists, false otherwise
   * @private
   */
  private configFileExists(file: string | null) {
    return !!this.configFiles.find((f) => f.name === file)
  }
}
