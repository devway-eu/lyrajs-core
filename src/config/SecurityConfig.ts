import path from "path"

import { ConfigParser } from "@/core/config/ConfigParser"
import { SecurityConfigKey } from "@/core/types"

/**
 * SecurityConfig class
 * Manages security-related configuration from security.yaml file
 * Provides type-safe access to security settings like CORS, rate limiting, and authentication
 */
export class SecurityConfig {
  /**
   * Creates a new SecurityConfig instance
   * @returns {SecurityConfig} - The SecurityConfig instance
   */
  constructor() {
    return this
  }

  /**
   * Retrieves the complete security configuration object
   * Parses the security.yaml file from the project's config directory
   * @returns {any} - Complete security configuration object
   * @example
   * const securityConfig = new SecurityConfig()
   * const config = securityConfig.getConfig()
   */
  public getConfig() {
    const securityConfigFile = {
      name: "security",
      fullPath: path.join(process.cwd(), "config", "security.yaml")
    }
    return ConfigParser.ParseConfigFile(securityConfigFile)
  }

  /**
   * Retrieves a specific security configuration value by key
   * Provides type-safe access to security settings
   * @param {SecurityConfigKey} key - Security configuration key (e.g., 'cors', 'rate_limit')
   * @returns {any} - Configuration value for the specified key
   * @example
   * const securityConfig = new SecurityConfig()
   * const corsConfig = securityConfig.get('cors')
   */
  public get(key: SecurityConfigKey) {
    const config = this.getConfig()
    return config[key]
  }
}
