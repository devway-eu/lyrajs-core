/**
 * MigrateMigrationCommand class
 * Executes all pending database migrations
 * Uses the new TypeScript-based migration system
 */
export declare class MigrateMigrationCommand {
    /**
     * Executes the migrate migration command
     * Runs all pending migrations with proper tracking and transactions
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
