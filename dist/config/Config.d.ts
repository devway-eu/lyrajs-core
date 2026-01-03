/**
 * Config class
 * Central configuration manager for LyraJS applications
 * Loads and provides access to all YAML configuration files in the config directory
 * Enforces use of specialized config classes for security and database settings
 */
export declare class Config {
    private folderPath;
    private configFiles;
    /**
     * Creates a new Config instance
     * Scans the config directory and loads all YAML configuration files
     * @example
     * const config = new Config()
     * const appName = config.get('app.name')
     */
    constructor();
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
    get(fullKey: string): any;
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
    getParam(param: string): any;
    /**
     * Checks if a configuration file exists in the loaded config files
     * @param {string | null} file - Configuration filename to check (without .yaml extension)
     * @returns {boolean} - True if file exists, false otherwise
     * @private
     */
    private configFileExists;
}
