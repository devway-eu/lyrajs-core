/**
 * ShowBackupsCommand class
 * Shows all available backup files in a formatted table
 * Displays file name, size, and creation date with summary statistics
 */
export declare class ShowBackupsCommand {
    /**
     * Executes the show backups command
     * Displays all available backup files in a table format
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
