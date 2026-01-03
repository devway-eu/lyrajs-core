import * as fs from "node:fs";
import path from "node:path";
import * as process from "node:process";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { db, LyraConsole } from "../../orm/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class MigrateMigrationCommand {
    async execute() {
        const migrations = await this.listMigrationsFiles();
        if (migrations && migrations.length) {
            const timestampMigrations = migrations.map((migration) => {
                return parseInt(migration.replace("migration_", "").replace(".sql", ""));
            });
            const mostRecetMigration = `migration_${Math.max(...timestampMigrations)}.sql`;
            const migrationFullSql = fs.readFileSync(path.join(process.cwd(), "migrations", mostRecetMigration), "utf8");
            const migrationSqlQueries = migrationFullSql.split(";\n");
            migrationSqlQueries.pop();
            for (const query of migrationSqlQueries) {
                await db.query(query);
            }
        }
        LyraConsole.success("Migration applied");
        process.exit(0);
    }
    async listMigrationsFiles() {
        const migrationDirectory = path.join(process.cwd(), "migrations");
        return fs.readdirSync(migrationDirectory);
    }
}
//# sourceMappingURL=MigrateMigrationCommand.js.map