/**
 * ShowMigrationsCommand class
 * Shows the status of all migrations (executed and pending)
 * Uses the new TypeScript-based migration system
 */
export declare class ShowMigrationsCommand {
    /**
     * Executes the show migrations command
     * Displays all migrations with their execution status
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
