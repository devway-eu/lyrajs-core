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
                // Check if file exists first
                await fs.access(fullPath);
                // File exists, try to import it
                const module = await import(`file://${fullPath}`);
                // Extract just the filename without path and extension
                const fileName = path.basename(modulePath);
                return module[fileName] || undefined;
            }
            catch (error) {
                // File doesn't exist or import failed, try next extension
                continue;
            }
        }
        // Neither .ts nor .js found or imports failed
        return undefined;
    }
}
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map