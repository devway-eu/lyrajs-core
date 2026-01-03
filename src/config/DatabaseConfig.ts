import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { DbConfigKey } from "@/core/types"

/**
 * DatabaseConfig class
 * Manages database-related configuration from database.yaml file
 * Provides type-safe access to database connection settings and ORM options
 */
export class DatabaseConfig {
  /**
   * Creates a new DatabaseConfig instance
   * @returns {DatabaseConfig} - The DatabaseConfig instance
   */
  constructor() {
    return this
  }

  /**
   * Retrieves the complete database configuration object
   * Parses the database.yaml file from the project's config directory
   * @returns {any} - Complete database configuration object
   * @example
   * const dbConfig = new DatabaseConfig()
   * const config = dbConfig.getConfig()
   */
  public getConfig() {
    const dbConfigFile = {
      name: "database",
      fullPath: path.join(process.cwd(), "config", "database.yaml")
    }
    return ConfigParser.ParseConfigFile(dbConfigFile)
  }

  /**
   * Retrieves a specific database configuration value by key
   * Provides type-safe access to database settings
   * @param {DbConfigKey} key - Database configuration key (e.g., 'host', 'port', 'database')
   * @returns {any} - Configuration value for the specified key
   * @example
   * const dbConfig = new DatabaseConfig()
   * const host = dbConfig.get('host')
   */
  public get(key: DbConfigKey) {
    const config = this.getConfig()
    return config[key]
  }
}
