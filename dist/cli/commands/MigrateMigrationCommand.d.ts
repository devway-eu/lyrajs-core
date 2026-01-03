/**
 * MigrateMigrationCommand class
 * Applies the most recent migration file to the database
 * Executes SQL queries from the latest migration file
 */
export declare class MigrateMigrationCommand {
    /**
     * Executes the migrate migration command
     * Finds and applies the most recent migration file
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
    /**
     * Lists all migration files in the migrations directory
     * @returns {Promise<string[]>} - Array of migration file names
     */
    private listMigrationsFiles;
}
