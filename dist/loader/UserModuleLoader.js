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
        return this.loadUserModule(`entity/${entityName}.js`);
    }
    async loadProjectRepository(repositoryName) {
        return this.loadUserModule(`repository/${repositoryName}.js`);
    }
    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures.js`);
    }
    async loadUserModule(modulePath) {
        const fullPath = path.resolve(this.srcRoot, modulePath);
        try {
            await fs.access(fullPath);
            const module = await import(`file://${fullPath}`);
            // Extract just the filename without path and extension
            const fileName = path.basename(modulePath);
            const className = fileName.replace('.ts', '').replace('.js', '');
            return module[className];
        }
        catch (error) {
            // console.error(`Failed to load user module "${modulePath}" from "${fullPath}": ${error}`)
        }
    }
}
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map