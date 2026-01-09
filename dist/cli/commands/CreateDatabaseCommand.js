import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
dotenv.config();
/**
 * CreateDatabaseCommand class
 * Creates a new MySQL database using credentials from environment variables
 * Database name is taken from DB_NAME environment variable
 */
export class CreateDatabaseCommand {
    /**
     * Executes the create database command
     * Connects to MySQL server and creates database if it doesn't exist
     * @returns {Promise<void>}
     */
    async execute() {
        var _a;
        const connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        const dbName = (_a = process.env.DB_NAME) === null || _a === void 0 ? void 0 : _a.replace(/[^a-zA-Z0-9_]/g, '');
        if (!dbName)
            throw new Error("Invalid database name");
        await connection.query(`CREATE DATABASE IF NOT EXISTS ??`, [dbName]);
        await connection.end();
        LyraConsole.success("Database created");
    }
}
//# sourceMappingURL=CreateDatabaseCommand.js.map