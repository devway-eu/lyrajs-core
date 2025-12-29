import path from "path";
import fs from "fs/promises";

class UserModuleLoader {
    private projectRoot?: string;
    private srcRoot: string;

    constructor() {
        this.projectRoot = process.cwd()
        this.srcRoot = path.resolve( this.projectRoot, 'src' )
    }

    async loadProjectEntity(entityName: string) {
        return this.loadUserModule(`entity/${entityName}.ts`)
    }

    async loadProjectRepository(repositoryName: string) {
        return this.loadUserModule(`repository/${repositoryName}.ts`)
    }

    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures.ts`)
    }

    private async loadUserModule(modulePath: string) {
       const fullPath = path.resolve(this.srcRoot, modulePath)

        try {
            await fs.access(fullPath)
            const module = await import(`file://${fullPath}`)
            const className = modulePath.replace('.ts', '').replace('.js', '')
            return module[className]
        } catch (error) {
            // console.error(`Failed to load user module "${modulePath}" from "${fullPath}": ${error}`)
        }
    }
}

export const ProjectModuleLoader = new UserModuleLoader()