/**
 * GenerateEntityCommand class
 * Generates entity and repository files based on user input
 * Supports creating new entities or adding properties to existing ones
 * Handles property types, constraints, and relationships
 */
export declare class GenerateEntityCommand {
    /**
     * Executes the generate entity command
     * Accepts an optional entity name as CLI argument (npx maestro make:entity EntityName)
     * If provided, validates it the same way as the interactive prompt
     * If omitted, falls back to the interactive prompt
     * @param {string[]} args - Command arguments [entity_name]
     * @returns {Promise<void>}
     */
    execute(args?: string[]): Promise<void>;
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
    /**
     * Detects User relations and generates ownership middleware
     * @param {string} entityName - Name of the entity
     * @param {Array<ColumnType>} properties - Array of entity properties
     * @returns {void}
     */
    private generateOwnershipMiddleware;
}
