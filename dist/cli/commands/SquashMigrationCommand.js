import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
import { MigrationSquasher } from "../../orm/migration/squasher/MigrationSquasher.js";
dotenv.config();
/**
 * SquashMigrationCommand class
 * Combines multiple migrations into a single squashed migration
 * Useful for reducing migration count in mature projects
 */
export class SquashMigrationCommand {
    /**
     * Executes the squash migration command
     * Combines all migrations up to a target version into one baseline migration
     * @param {string[]} args - Command arguments [--to=<version>]
     * @returns {Promise<void>}
     */
    async execute(args) {
        // Parse --to argument
        const toArg = args.find(arg => arg.startsWith("--to="));
        const targetVersion = toArg ? toArg.split("=")[1] : undefined;
        const connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        try {
            LyraConsole.info("\u2699 Migration Squashing", "This will combine multiple migrations into a single baseline migration.", targetVersion
                ? `Target version: ${targetVersion}`
                : "Target: All executed migrations");
            const squasher = new MigrationSquasher(connection);
            await squasher.squash(targetVersion);
        }
        catch (error) {
            LyraConsole.error("\u2717 Squash failed", error.message);
            throw error;
        }
        finally {
            await connection.end();
        }
    }
}
//# sourceMappingURL=SquashMigrationCommand.js.map