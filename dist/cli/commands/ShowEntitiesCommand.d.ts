/**
 * ShowEntitiesCommand class
 * Lists all entities found in the project's entity folder
 * Displays entity names and their file paths
 */
export declare class ShowEntitiesCommand {
    /**
     * Executes the show entities command
     * Scans the entity folder and displays all entity files
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
