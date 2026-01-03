/**
 * ShowMigrationsCommand class
 * Lists all migrations found in the migrations folder
 * Displays migration names with timestamps and file paths
 */
export declare class ShowMigrationsCommand {
    /**
     * Executes the show migrations command
     * Scans the migrations folder and displays all migration files in reverse chronological order
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
