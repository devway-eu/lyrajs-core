import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import { LyraConsole } from "../../console/LyraConsole.js";
import { BackupManager } from "../../orm/migration/backup/BackupManager.js";
dotenv.config();
/**
 * ListBackupsCommand class
 * Lists all available backup files with details
 * Shows file name, size, and creation date
 */
export class ListBackupsCommand {
    /**
     * Executes the list backups command
     * Displays all available backup files with metadata
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
            const GREEN = '\x1b[32m';
            const CYAN = '\x1b[36m';
            const YELLOW = '\x1b[33m';
            const RESET = '\x1b[0m';
            console.log(`\n${CYAN}📦 Available Backups:${RESET}\n`);
            if (backups.length === 0) {
                console.log('  (no backups found)');
                console.log('');
                return;
            }
            // Display each backup
            backups.forEach((backup, index) => {
                const size = backupManager.formatSize(backup.size);
                const date = backup.created.toLocaleString();
                const fileName = backup.file;
                console.log(`${YELLOW}${index + 1}.${RESET} ${GREEN}${fileName}${RESET}`);
                console.log(`   Size: ${size}`);
                console.log(`   Created: ${date}`);
                console.log('');
            });
            // Show total
            const totalSize = backupManager.getTotalBackupSize();
            console.log(`${CYAN}Total backups: ${backups.length}${RESET}`);
            console.log(`${CYAN}Total size: ${backupManager.formatSize(totalSize)}${RESET}`);
            console.log('');
        }
        catch (error) {
            LyraConsole.error(`Failed to list backups: ${error.message}`);
            throw error;
        }
        finally {
            await connection.end();
        }
    }
}
//# sourceMappingURL=ListBackupsCommand.js.map