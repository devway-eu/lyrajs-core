/**
 * LyraConfig class
 * Handles dynamic loading and compilation of TypeScript modules
 * Provides access to entities, repositories, controllers, migrations, and fixtures
 */
declare class LyraConfig {
    /**
     * Retrieves the complete application configuration
     * Compiles and loads all TypeScript modules from project directories
     * @returns {Promise<object>} - Configuration object containing entities, repositories, controllers, migrations, and fixtures
     * @example
     * const config = await Lyra.config()
     * console.log(config.entities) // Array of compiled entity modules
     */
    config(): Promise<{
        entities: any[];
        repositories: any[];
        controllers: any[];
        migrations: string[];
        fixtures: any[];
    }>;
    /**
     * Retrieves file paths from a directory
     * Filters for TypeScript and SQL files only
     * @param {string} dir - Directory path relative to project root
     * @returns {Promise<string[]>} - Array of absolute file paths
     * @example
     * const files = await Lyra.getFilesFromDir('migrations')
     */
    getFilesFromDir(dir: string): Promise<string[]>;
    /**
     * Compiles TypeScript files and imports their exports
     * Transpiles each TypeScript file, imports it, and cleans up compiled JavaScript
     * @param {string} dir - Directory containing TypeScript files
     * @returns {Promise<any[]>} - Array of imported module exports (default or named)
     * @example
     * const entities = await Lyra.getCompiledExports('src/entity')
     */
    getCompiledExports(dir: string): Promise<any[]>;
    /**
     * Compiles a single TypeScript file to JavaScript
     * Uses TypeScript compiler API to transpile with ES2022 target
     * @param {string} tsFilePath - Absolute path to TypeScript file
     * @returns {Promise<string>} - Path to compiled JavaScript file
     * @private
     */
    compileTsFile(tsFilePath: string): Promise<string>;
    /**
     * Loads and compiles the lyra.config.js file
     * Dynamically imports the configuration and cleans up temporary files
     * @returns {Promise<any>} - Lyra configuration object
     * @throws {Error} - If lyra.config.js file not found or compilation fails
     * @example
     * const config = await Lyra.getConfig()
     */
    getConfig(): Promise<any>;
}
/**
 * Singleton instance of LyraConfig
 * Provides centralized access to configuration loading and module compilation
 * @example
 * import { Lyra } from '@lyra-js/core'
 * const config = await Lyra.config()
 */
export declare const Lyra: LyraConfig;
export {};
