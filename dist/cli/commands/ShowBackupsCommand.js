import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
import { BackupManager } from "../../orm/migration/backup/BackupManager.js";
dotenv.config();
/**
 * ShowBackupsCommand class
 * Shows all available backup files in a formatted table
 * Displays file name, size, and creation date with summary statistics
 */
export class ShowBackupsCommand {
    /**
     * Executes the show backups command
     * Displays all available backup files in a table format
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
            const backupManager = new BackupManager(connection);
            const backups = backupManager.listBackups();
            const output = ["BACKUPS"];
            if (backups.length === 0) {
                output.push("");
                output.push("No backups found");
                output.push("");
                LyraConsole.info(...output);
                return;
            }
            const rows = backups.map(backup => ({
                file: backup.file,
                size: backupManager.formatSize(backup.size),
                created: backup.created.toLocaleString()
            }));
            // Calculate column widths
            const fileWidth = Math.max(20, ...rows.map(r => r.file.length));
            const sizeWidth = Math.max(10, ...rows.map(r => r.size.length));
            const createdWidth = Math.max(20, ...rows.map(r => r.created.length));
            // Build table header
            output.push(`┌${"─".repeat(fileWidth + 2)}┬${"─".repeat(sizeWidth + 2)}┬${"─".repeat(createdWidth + 2)}┐`);
            output.push(`│ ${"FILE".padEnd(fileWidth)} │ ${"SIZE".padEnd(sizeWidth)} │ ${"CREATED".padEnd(createdWidth)} │`);
            output.push(`├${"─".repeat(fileWidth + 2)}┼${"─".repeat(sizeWidth + 2)}┼${"─".repeat(createdWidth + 2)}┤`);
            // Build table rows
            for (const row of rows) {
                output.push(`│ ${row.file.padEnd(fileWidth)} │ ${row.size.padEnd(sizeWidth)} │ ${row.created.padEnd(createdWidth)} │`);
            }
            // Build table footer
            output.push(`└${"─".repeat(fileWidth + 2)}┴${"─".repeat(sizeWidth + 2)}┴${"─".repeat(createdWidth + 2)}┘`);
            // Add summary
            const totalSize = backupManager.getTotalBackupSize();
            output.push("");
            output.push(`Total: ${backups.length} \u2502 Total size: ${backupManager.formatSize(totalSize)}`);
            output.push("");
            LyraConsole.success(...output);
        }
        catch (error) {
            LyraConsole.error(`Failed to show backups: ${error.message}`);
            throw error;
        }
        finally {
            await connection.end();
        }
    }
}
//# sourceMappingURL=ShowBackupsCommand.js.map