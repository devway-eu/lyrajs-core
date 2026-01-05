/**
 * RestoreBackupCommand class
 * Restores database from a backup created during migration
 * Can restore by migration version or specific backup file
 */
export declare class RestoreBackupCommand {
    /**
     * Executes the restore backup command
     * Restores database from backup associated with a migration version
     * @param {string[]} args - Command arguments [migration_version]
     * @returns {Promise<void>}
     */
    execute(args: string[]): Promise<void>;
    /**
     * Sleep for a specified number of milliseconds
     */
    private sleep;
}
