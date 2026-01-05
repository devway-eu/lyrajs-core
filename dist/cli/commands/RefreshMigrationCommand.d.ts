/**
 * RefreshMigrationCommand class
 * Rolls back all migrations and re-runs them from scratch
 * Useful for testing migration reversibility and getting a clean state
 */
export declare class RefreshMigrationCommand {
    /**
     * Executes the refresh migration command
     * Rolls back all migrations and re-runs them
     * @param {string[]} args - Command arguments [--force]
     * @returns {Promise<void>}
     */
    execute(args: string[]): Promise<void>;
}
