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
        // Try .ts first (development), then .js (production)
        const extensions = ['.ts', '.js'];
        for (const ext of extensions) {
            const fullPath = path.resolve(this.srcRoot, modulePath + ext);
            try {
                await fs.access(fullPath);
                const module = await import(`file://${fullPath}`);
                // Extract just the filename without path and extension
                const fileName = path.basename(modulePath);
                return module[fileName];
            }
            catch (error) {
                // Try next extension
                continue;
            }
        }
        // Neither .ts nor .js found
        return undefined;
    }
}
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map