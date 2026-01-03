/**
 * RepositoryGeneratorHelper class
 * Generates repository class code for entities
 * Creates repository files that extend the base Repository class
 */
export declare class RepositoryGeneratorHelper {
    /**
     * Generates import statements for repository file
     * @param {string} entityName - Name of the entity
     * @returns {string} - Import statements code
     */
    static importsString: (entityName: string) => string;
    /**
     * Generates constructor code for repository class
     * @param {string} entityName - Name of the entity
     * @returns {string} - Constructor code
     */
    static constructorString: (entityName: string) => string;
    /**
     * Generates export statement for repository instance
     * @param {string} entityName - Name of the entity
     * @returns {string} - Export statement code
     */
    static exportString: (entityName: string) => string;
    /**
     * Generates complete repository file code
     * @param {string} entityName - Name of the entity
     * @returns {string} - Complete repository code
     * @example
     * // Generate repository for User entity
     * const code = RepositoryGeneratorHelper.getFullRepositoryCode('User')
     */
    static getFullRepositoryCode(entityName: string): string;
}
