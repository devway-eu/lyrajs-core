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
        return this.loadUserModule(`entity/${entityName}`)
    }

    async loadProjectRepository(repositoryName: string) {
        return this.loadUserModule(`repository/${repositoryName}`)
    }

    async loadProjectFixtures() {
        return this.loadUserModule(`fixtures/AppFixtures`)
    }

    private async loadUserModule(modulePath: string) {
        // Try .js first (production/compiled), then .ts (development with tsx)
        const extensions = ['.js', '.ts']

        for (const ext of extensions) {
            const fullPath = path.resolve(this.srcRoot, modulePath + ext)

            try {
                // Check if file exists first
                await fs.access(fullPath)
            } catch {
                // File doesn't exist, try next extension
                continue
            }

            // File exists, try to import it
            try {
                const module = await import(`file://${fullPath}`)
                // Extract just the filename without path and extension
                const fileName = path.basename(modulePath)
                return module[fileName]
            } catch (error) {
                // Import failed (e.g., syntax error), return undefined
                return undefined
            }
        }

        // Neither .ts nor .js found
        return undefined
    }
}

export const ProjectModuleLoader = new UserModuleLoader()