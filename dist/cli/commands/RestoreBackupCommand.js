import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
import { BackupManager } from "../../orm/migration/backup/BackupManager.js";
dotenv.config();
/**
 * RestoreBackupCommand class
 * Restores database from a backup created during migration
 * Can restore by migration version or specific backup file
 */
export class RestoreBackupCommand {
    /**
     * Executes the restore backup command
     * Restores database from backup associated with a migration version
     * @param {string[]} args - Command arguments [migration_version]
     * @returns {Promise<void>}
     */
    async execute(args) {
        const migrationVersion = args[0];
        if (!migrationVersion) {
            LyraConsole.error("Missing migration version", "Usage: npx maestro restore:backup <MIGRATION_VERSION>");
            return;
        }
        const connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        try {
            // Get backup path from migrations table
            const result = await connection.query(`
        SELECT backup_path FROM migrations WHERE version = ?
      `, [migrationVersion]);
            const rows = Array.isArray(result[0]) ? result[0] : result;
            if (rows.length === 0) {
                LyraConsole.error(`Migration version ${migrationVersion} not found`, "Run 'npx maestro show:migrations' to see available migrations");
                return;
            }
            const backupPath = rows[0].backup_path;
            if (!backupPath) {
                LyraConsole.error(`No backup found for migration ${migrationVersion}`, "This migration did not create a backup (non-destructive migration)");
                return;
            }
            // Display warning
            LyraConsole.warn("⚠️  WARNING: Database Restore Operation", "This will restore the database from backup", `Backup file: ${backupPath}`, "All data changes since this backup will be LOST", "", "This operation cannot be undone!", "", "Press Ctrl+C now to cancel, or wait 5 seconds to proceed...");
            // Wait 5 seconds for user to cancel
            await this.sleep(5000);
            // Perform restore
            const backupManager = new BackupManager(connection);
            await backupManager.restore(backupPath);
            LyraConsole.success("Database restored successfully", `Restored from migration: ${migrationVersion}`, "You may need to run migrations again to get back to the desired state");
        }
        catch (error) {
            LyraConsole.error(`Restore failed: ${error.message}`);
            throw error;
        }
        finally {
            await connection.end();
        }
    }
    /**
     * Sleep for a specified number of milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=RestoreBackupCommand.js.map