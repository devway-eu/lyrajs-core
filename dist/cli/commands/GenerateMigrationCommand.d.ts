/**
 * GenerateMigrationCommand class
 * Generates TypeScript migration files based on entity definitions
 * Compares entity schema with current database and creates incremental migrations
 */
export declare class GenerateMigrationCommand {
    /**
     * Executes the generate migration command
     * Creates incremental TypeScript migrations by comparing entities with database
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
