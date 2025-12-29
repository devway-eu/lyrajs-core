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
        return this.loadUserModule(`entity/${entityName}.js`)
    }

    async loadProjectRepository(repositoryName: string) {
        return this.loadUserModule(`repository/${repositoryName}.js`)
    }

    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures.js`)
    }

    private async loadUserModule(modulePath: string) {
       const fullPath = path.resolve(this.srcRoot, modulePath)

        try {
            await fs.access(fullPath)
            const module = await import(`file://${fullPath}`)
            // Extract just the filename without path and extension
            const fileName = path.basename(modulePath)
            const className = fileName.replace('.ts', '').replace('.js', '')
            return module[className]
        } catch (error) {
            // console.error(`Failed to load user module "${modulePath}" from "${fullPath}": ${error}`)
        }
    }
}

export const ProjectModuleLoader = new UserModuleLoader()