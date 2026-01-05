import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
import { MigrationGenerator } from "../../orm/migration/index.js";
dotenv.config();
/**
 * GenerateMigrationCommand class
 * Generates TypeScript migration files based on entity definitions
 * Compares entity schema with current database and creates incremental migrations
 */
export class GenerateMigrationCommand {
    /**
     * Executes the generate migration command
     * Creates incremental TypeScript migrations by comparing entities with database
     * @returns {Promise<void>}
     */
    async execute() {
        const connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        try {
            const generator = new MigrationGenerator(connection);
            await generator.generate();
            LyraConsole.success("Migration generation completed");
        }
        catch (error) {
            LyraConsole.error(`Migration generation failed: ${error.message}`);
            throw error;
        }
        finally {
            await connection.end();
        }
    }
}
//# sourceMappingURL=GenerateMigrationCommand.js.map