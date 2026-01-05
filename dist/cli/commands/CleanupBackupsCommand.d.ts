/**
 * CleanupBackupsCommand class
 * Cleans up old backup files based on retention policy
 * Deletes backups older than specified number of days
 */
export declare class CleanupBackupsCommand {
    /**
     * Executes the cleanup backups command
     * Removes backup files older than retention period (default: 30 days)
     * @param {string[]} args - Command arguments [--days=N]
     * @returns {Promise<void>}
     */
    execute(args: string[]): Promise<void>;
}
