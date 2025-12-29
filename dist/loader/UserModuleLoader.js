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
        return this.loadUserModule(`entity/${entityName}.ts`);
    }
    async loadProjectRepository(repositoryName) {
        return this.loadUserModule(`repository/${repositoryName}.ts`);
    }
    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures.ts`);
    }
    async loadUserModule(modulePath) {
        const fullPath = path.resolve(this.srcRoot, modulePath);
        try {
            await fs.access(fullPath);
            const module = await import(`file://${fullPath}`);
            const className = modulePath.replace('.ts', '').replace('.js', '');
            return module[className];
        }
        catch (error) {
            // console.error(`Failed to load user module "${modulePath}" from "${fullPath}": ${error}`)
        }
    }
}
export const ProjectModuleLoader = new UserModuleLoader();
//# sourceMappingURL=UserModuleLoader.js.map