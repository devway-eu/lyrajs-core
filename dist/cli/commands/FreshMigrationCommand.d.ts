/**
 * FreshMigrationCommand class
 * Drops all tables and re-runs all migrations from scratch
 * Useful for development to get a clean database state
 */
export declare class FreshMigrationCommand {
    /**
     * Executes the fresh migration command
     * Drops all database tables and re-runs all migrations
     * @param {string[]} args - Command arguments [--force]
     * @returns {Promise<void>}
     */
    execute(args: string[]): Promise<void>;
}
