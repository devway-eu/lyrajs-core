import "reflect-metadata";
import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { DatabaseConfig } from "../../config/index.js";
const dbConfig = new DatabaseConfig().getConfig();
/**
 * MigrationGeneratorHelper class
 * Generates SQL migration files from entity metadata
 * Creates CREATE TABLE and ALTER TABLE statements based on entity decorators
 */
export class MigrationGeneratorHelper {
    constructor() { }
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Array<Entity<T> | (new () => T)>>} - Array of entity instances
     */
    async getEntities() {
        const entities = [];
        const entityFolder = resolve(process.cwd(), "src", "entity");
        const files = fs.readdirSync(entityFolder).filter((f) => (f.endsWith(".ts") || f.endsWith(".js")) && !f.endsWith("~"));
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
    /**
     * Builds SQL CREATE TABLE and ALTER TABLE queries from entity metadata
     * Processes all entities and generates complete migration SQL
     * @returns {Promise<string[]>} - Array of SQL query strings
     */
    async buildCreateTableQueries() {
        const entities = await this.getEntities();
        const queries = [];
        queries.push("USE `" + dbConfig.name + "`;");
        entities.forEach((entity) => {
            const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase();
            const columns = Reflect.getMetadata("entity:columns", entity);
            const pk = Reflect.getMetadata("entity:columns", entity).filter((c) => c.pk === true)[0];
            const fks = Reflect.getMetadata("entity:columns", entity).filter((c) => c.fk === true);
            fks.forEach((fk) => {
                var _a;
                const reference = fk.references ? (_a = fk.references) === null || _a === void 0 ? void 0 : _a.split(".") : null;
                if (reference) {
                    const key = "fk_" + table + "_" + fk.name + "";
                    queries.push("ALTER TABLE `" + table + "` DROP FOREIGN KEY `" + key + "`;");
                }
            });
            queries.push("DROP TABLE IF EXISTS `" + table + "`;");
            let query = "CREATE TABLE IF NOT EXISTS `" + table + "` (";
            columns.forEach((column) => {
                if (column.pk) {
                    query +=
                        "`" +
                            column.name +
                            "` " +
                            column.type.toUpperCase() +
                            " " +
                            (column.size ? `(${column.size}) ` : "") +
                            "AUTO_INCREMENT NOT NULL, ";
                }
                else {
                    query +=
                        "`" +
                            column.name +
                            "` " +
                            column.type.toUpperCase() +
                            " " +
                            (column.size ? `(${column.size}) ` : "") +
                            " " +
                            (column.nullable ? "" : "NOT NULL") +
                            " " +
                            (column.unique ? "UNIQUE" : "") +
                            ", ";
                }
            });
            query += pk.pk && (pk === null || pk === void 0 ? void 0 : pk.name) ? "PRIMARY KEY (`" + pk.name + "`)" : "";
            fks.forEach((fk) => {
                var _a;
                const reference = fk.references ? (_a = fk.references) === null || _a === void 0 ? void 0 : _a.split(".") : null;
                if (reference) {
                    const key = "fk_" + table + "_" + fk.name + "";
                    query += ", KEY `" + key + "` (`" + fk.name + "`)";
                }
            });
            query += ");";
            queries.push(query);
        });
        entities.forEach((entity) => {
            const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase();
            const fks = Reflect.getMetadata("entity:columns", entity).filter((c) => c.fk === true);
            fks.forEach((fk) => {
                var _a;
                const reference = fk.references ? (_a = fk.references) === null || _a === void 0 ? void 0 : _a.split(".") : null;
                if (reference) {
                    let query = "ALTER TABLE `" + table + "` ADD ";
                    const key = `fk_${table}_${fk.name}`;
                    const name = fk.name === "user" ? "`user`" : fk.name;
                    query +=
                        "CONSTRAINT `" +
                            key +
                            "` FOREIGN KEY (`" +
                            name +
                            "`) REFERENCES `" +
                            reference[0] +
                            "` (`" +
                            reference[1] +
                            "`)";
                    if (fk.onDelete) {
                        query += ` ON DELETE ${fk.onDelete}`;
                    }
                    query += ";";
                    queries.push(query);
                }
            });
        });
        return queries; // return queries
    }
    /**
     * Generates a timestamped migration file with SQL queries
     * @param {string[]} queries - Array of SQL queries to write
     * @returns {void}
     */
    generateMigrationFile(queries) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const migrationDirectory = path.join(process.cwd(), "migrations");
        const migrationFile = path.join(migrationDirectory, `migration_${new Date().getTime()}.sql`);
        if (!fs.existsSync(migrationDirectory)) {
            fs.mkdirSync(migrationDirectory, { recursive: true });
        }
        fs.writeFileSync(migrationFile, queries.join("\n") + "\n");
    }
}
//# sourceMappingURL=MigrationGeneratorHelper.js.map