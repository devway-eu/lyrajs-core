/**
 * GenerateMigrationCommand class
 * Generates SQL migration files based on entity definitions
 * Creates timestamped migration files with CREATE TABLE and ALTER TABLE statements
 */
export declare class GenerateMigrationCommand {
    /**
     * Executes the generate migration command
     * Builds SQL queries from entities and writes them to a migration file
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
