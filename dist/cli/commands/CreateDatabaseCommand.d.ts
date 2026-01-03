/**
 * CreateDatabaseCommand class
 * Creates a new MySQL database using credentials from environment variables
 * Database name is taken from DB_NAME environment variable
 */
export declare class CreateDatabaseCommand {
    /**
     * Executes the create database command
     * Connects to MySQL server and creates database if it doesn't exist
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
