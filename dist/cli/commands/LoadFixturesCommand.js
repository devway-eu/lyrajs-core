import fs from "fs";
import * as process from "node:process";
import path from "path";
import { db, LyraConsole } from "../../orm/index.js";
import { AppFixtures } from "../../loader/index.js";
/**
 * LoadFixturesCommand class
 * Loads fixture data into the database
 * Empties all tables before loading fixtures to ensure clean state
 */
export class LoadFixturesCommand {
    /**
     * Executes the load fixtures command
     * Truncates all entity tables and loads fixture data
     * @returns {Promise<void>}
     */
    async execute() {
        await this.emptyDatabase();
        const fixtures = new AppFixtures();
        await fixtures.load();
        LyraConsole.success("Fixtures loaded");
        process.exit(0);
    }
    /**
     * Empties all entity tables in the database
     * Disables foreign key checks, truncates tables, then re-enables checks
     * @returns {Promise<void>}
     */
    async emptyDatabase() {
        const entities = await this.getEntities();
        await db.query(`SET FOREIGN_KEY_CHECKS = 0`);
        for (const entity of entities.reverse()) {
            const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase();
            await db.query("TRUNCATE TABLE `" + table + "`");
        }
        await db.query(`SET FOREIGN_KEY_CHECKS = 1`);
    }
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Entity<T>[]>} - Array of entity instances
     */
    async getEntities() {
        const entities = [];
        const entityFolder = path.join(process.cwd(), "src", "entity");
        const files = fs.readdirSync(entityFolder).filter((f) => f.endsWith(".ts") && !f.endsWith("~"));
        for (const file of files) {
            const modulePath = path.join(entityFolder, file);
            const entityModule = await import(`file://${modulePath}`);
            const className = file.replace(".ts", "");
            const EntityClass = entityModule[className];
            if (!EntityClass) {
                throw new Error(`Class ${className} not exported correctly in ${file}`);
            }
            const instance = new EntityClass();
            entities.push(instance);
        }
        return entities;
    }
}
//# sourceMappingURL=LoadFixturesCommand.js.map