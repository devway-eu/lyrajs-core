/**
 * UserModuleLoader class
 * Dynamically loads user-defined modules from the project's src directory
 * Supports loading entities, repositories, and fixtures with fallback for .ts and .js extensions
 */
declare class UserModuleLoader {
    private projectRoot?;
    private srcRoot;
    /**
     * Creates a new UserModuleLoader instance
     * Initializes project root and source directory paths
     */
    constructor();
    /**
     * Loads a project entity by name
     * @param {string} entityName - Entity class name (e.g., 'User', 'Post')
     * @returns {Promise<any>} - Imported entity module or undefined if not found
     * @example
     * const User = await ProjectModuleLoader.loadProjectEntity('User')
     */
    loadProjectEntity(entityName: string): Promise<any>;
    /**
     * Loads a project repository by name
     * @param {string} repositoryName - Repository class name (e.g., 'UserRepository')
     * @returns {Promise<any>} - Imported repository module or undefined if not found
     * @example
     * const userRepo = await ProjectModuleLoader.loadProjectRepository('UserRepository')
     */
    loadProjectRepository(repositoryName: string): Promise<any>;
    /**
     * Loads the project's AppFixtures module
     * @returns {Promise<any>} - Imported AppFixtures module or undefined if not found
     * @example
     * const fixtures = await ProjectModuleLoader.loadProjectFixtures()
     */
    loadProjectFixtures(): Promise<any>;
    /**
     * Loads a user module from the project with multiple fallback strategies
     * Tries .js first (production), then .ts (development)
     * Handles various export patterns: named exports, default exports, camelCase vs PascalCase
     * @param {string} modulePath - Module path relative to src directory (without extension)
     * @returns {Promise<any>} - Imported module or undefined if not found
     * @private
     * @example
     * const entity = await this.loadUserModule('entity/User')
     */
    private loadUserModule;
}
/**
 * Singleton instance of UserModuleLoader
 * Provides centralized module loading for project entities, repositories, and fixtures
 * @example
 * import { ProjectModuleLoader } from '@lyra-js/core'
 * const User = await ProjectModuleLoader.loadProjectEntity('User')
 */
export declare const ProjectModuleLoader: UserModuleLoader;
export {};
