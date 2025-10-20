import fs from "fs";
import path from "path";
import { LyraConsole } from "../../orm/index.js";
export class ShowMigrationsCommand {
    async execute() {
        const migrationsFolder = path.join(process.cwd(), "migrations");
        const migrations = ["MIGRATIONS"];
        fs.readdirSync(migrationsFolder)
            .reverse()
            .forEach((file) => {
            const migration = file.replace(".sql", "");
            const timestamp = migration.replace("migration_", "");
            // const isoDate = new Date(parseInt(timestamp)).toISOString()
            const date = new Date(new Date(parseInt(timestamp)).toISOString()).toLocaleString();
            migrations.push(`\u27A5  ${migration} | ${date} \u0040 /migrations/${file}`);
        });
        LyraConsole.success(...migrations);
    }
}
//# sourceMappingURL=ShowMigrationsCommand.js.map