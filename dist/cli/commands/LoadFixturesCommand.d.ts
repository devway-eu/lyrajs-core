/**
 * LoadFixturesCommand class
 * Loads fixture data into the database
 * Empties all tables before loading fixtures to ensure clean state
 */
export declare class LoadFixturesCommand<T extends object> {
    /**
     * Executes the load fixtures command
     * Truncates all entity tables and loads fixture data
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
    /**
     * Empties all entity tables in the database
     * Disables foreign key checks, truncates tables, then re-enables checks
     * @returns {Promise<void>}
     */
    private emptyDatabase;
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Entity<T>[]>} - Array of entity instances
     */
    private getEntities;
}
