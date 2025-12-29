import path from "path";
import fs from "fs/promises";
class UserModuleLoader {
    projectRoot;
    srcRoot;
    constructor() {
        this.projectRoot = process.cwd();
        this.srcRoot = path.resolve(this.projectRoot, 'src');
    }
    async loadProjectEntity(entityName) {
        return this.loadUserModule(`entity/${entityName}`);
    }
    async loadProjectRepository(repositoryName) {
        return this.loadUserModule(`repository/${repositoryName}`);
    }
    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures`);
    }
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
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map