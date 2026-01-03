import { SecurityConfigKey } from "../types/index.js";
/**
 * SecurityConfig class
 * Manages security-related configuration from security.yaml file
 * Provides type-safe access to security settings like CORS, rate limiting, and authentication
 */
export declare class SecurityConfig {
    /**
     * Creates a new SecurityConfig instance
     * @returns {SecurityConfig} - The SecurityConfig instance
     */
    constructor();
    /**
     * Retrieves the complete security configuration object
     * Parses the security.yaml file from the project's config directory
     * @returns {any} - Complete security configuration object
     * @example
     * const securityConfig = new SecurityConfig()
     * const config = securityConfig.getConfig()
     */
    getConfig(): any;
    /**
     * Retrieves a specific security configuration value by key
     * Provides type-safe access to security settings
     * @param {SecurityConfigKey} key - Security configuration key (e.g., 'cors', 'rate_limit')
     * @returns {any} - Configuration value for the specified key
     * @example
     * const securityConfig = new SecurityConfig()
     * const corsConfig = securityConfig.get('cors')
     */
    get(key: SecurityConfigKey): any;
}
