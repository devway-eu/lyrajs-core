import { ConfigFile } from "../types/index.js";
/**
 * ConfigParser class
 * Parses YAML configuration files and interpolates environment variables
 * Supports %env(VAR_NAME)% syntax for environment variable substitution
 */
export declare class ConfigParser {
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
    static ParseConfigFile(configFile: ConfigFile): any;
    /**
     * Recursively interpolates environment variables in configuration values
     * Replaces %env(VAR_NAME)% patterns with actual environment variable values
     * @param {any} config - Configuration value (string, object, or primitive)
     * @returns {any} - Interpolated configuration value
     * @private
     */
    private static interpolate;
}
