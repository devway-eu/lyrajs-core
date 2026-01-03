/**
 * GenerateEntityCommand class
 * Generates entity and repository files based on user input
 * Supports creating new entities or adding properties to existing ones
 * Handles property types, constraints, and relationships
 */
export declare class GenerateEntityCommand {
    /**
     * Executes the generate entity command
     * Prompts for entity name and either creates new entity or updates existing one
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
    /**
     * Prompts for entity properties and generates entity and repository files
     * @param {string} entity - Name of the entity to generate
     * @returns {Promise<void>}
     */
    private generateEntityPrompts;
    /**
     * Prompts for new properties to add to existing entity
     * @param {string} entityName - Name of the existing entity to update
     * @returns {Promise<void>}
     */
    private updateEntityPrompts;
    /**
     * Generates entity file content
     * @param {string} entityName - Name of the entity
     * @param {Array<ColumnType>} properties - Array of entity properties
     * @returns {string} - Generated entity file content
     */
    private generateEntityFile;
    /**
     * Generates repository file content
     * @param {string} entityName - Name of the entity
     * @returns {string} - Generated repository file content
     */
    private generateRepositoryFile;
    /**
     * Checks if an entity file already exists
     * @param {string} entityName - Name of the entity to check
     * @returns {boolean} - True if entity exists, false otherwise
     */
    private entityExists;
}
