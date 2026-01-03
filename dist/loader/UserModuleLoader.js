import path from "path";
import fs from "fs/promises";
/**
 * UserModuleLoader class
 * Dynamically loads user-defined modules from the project's src directory
 * Supports loading entities, repositories, and fixtures with fallback for .ts and .js extensions
 */
class UserModuleLoader {
    projectRoot;
    srcRoot;
    /**
     * Creates a new UserModuleLoader instance
     * Initializes project root and source directory paths
     */
    constructor() {
        this.projectRoot = process.cwd();
        this.srcRoot = path.resolve(this.projectRoot, 'src');
    }
    /**
     * Loads a project entity by name
     * @param {string} entityName - Entity class name (e.g., 'User', 'Post')
     * @returns {Promise<any>} - Imported entity module or undefined if not found
     * @example
     * const User = await ProjectModuleLoader.loadProjectEntity('User')
     */
    async loadProjectEntity(entityName) {
        return this.loadUserModule(`entity/${entityName}`);
    }
    /**
     * Loads a project repository by name
     * @param {string} repositoryName - Repository class name (e.g., 'UserRepository')
     * @returns {Promise<any>} - Imported repository module or undefined if not found
     * @example
     * const userRepo = await ProjectModuleLoader.loadProjectRepository('UserRepository')
     */
    async loadProjectRepository(repositoryName) {
        return this.loadUserModule(`repository/${repositoryName}`);
    }
    /**
     * Loads the project's AppFixtures module
     * @returns {Promise<any>} - Imported AppFixtures module or undefined if not found
     * @example
     * const fixtures = await ProjectModuleLoader.loadProjectFixtures()
     */
    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures`);
    }
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
    async loadUserModule(modulePath) {
        // Try .js first (production/compiled), then .ts (development with tsx)
        const extensions = ['.js', '.ts'];
        for (const ext of extensions) {
            const fullPath = path.resolve(this.srcRoot, modulePath + ext);
            try {
                // Check if file exists first (with timeout)
                await Promise.race([
                    fs.access(fullPath),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
                ]);
                // File exists, try to import it (increased timeout for tsx compilation)
                // Convert Windows path to proper file:// URL format
                const fileUrl = new URL(`file:///${fullPath.replace(/\\/g, '/')}`).href;
                const module = await Promise.race([
                    import(fileUrl),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Import timeout')), 10000))
                ]);
                // Extract just the filename without path and extension
                const fileName = path.basename(modulePath);
                // For repositories, convert to camelCase (first letter lowercase)
                // For entities and other modules, keep PascalCase
                let exportName = fileName;
                if (modulePath.startsWith('repository/')) {
                    exportName = fileName.charAt(0).toLowerCase() + fileName.slice(1);
                }
                // Try to get the export in multiple ways
                // 1. Try the expected export name (e.g., 'userRepository')
                if (module[exportName]) {
                    return module[exportName];
                }
                // 2. Try PascalCase version (e.g., 'UserRepository')
                if (module[fileName]) {
                    return module[fileName];
                }
                // 3. Try default export
                if (module.default) {
                    return module.default;
                }
                // 4. Return first non-default export
                const exports = Object.keys(module).filter(key => key !== 'default' && key !== '__esModule');
                if (exports.length > 0) {
                    return module[exports[0]];
                }
                return undefined;
            }
            catch (error) {
                // File doesn't exist, import failed, or timeout - try next extension
                continue;
            }
        }
        // Neither .ts nor .js found or imports failed
        return undefined;
    }
}
/**
 * Singleton instance of UserModuleLoader
 * Provides centralized module loading for project entities, repositories, and fixtures
 * @example
 * import { ProjectModuleLoader } from '@lyra-js/core'
 * const User = await ProjectModuleLoader.loadProjectEntity('User')
 */
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map