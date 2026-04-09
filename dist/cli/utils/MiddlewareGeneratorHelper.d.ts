/**
 * MiddlewareGeneratorHelper class
 * Generates ownership middleware code for entities with User relations
 * Creates middleware files that check entity ownership based on authenticated user
 */
export declare class MiddlewareGeneratorHelper {
    /**
     * Generates import statements for middleware file
     * @param {string} entityName - Name of the entity
     * @returns {string} - Import statements code
     */
    static importsString: (entityName: string) => string;
    /**
     * Generates complete ownership middleware code
     * @param {string} entityName - Name of the entity (e.g., "Post", "Cart")
     * @param {string} userPropertyName - Property name that references User (e.g., "author", "user")
     * @returns {string} - Complete middleware code
     * @example
     * // Generate middleware for Post entity with "author" property
     * const code = MiddlewareGeneratorHelper.getOwnershipMiddlewareCode('Post', 'author')
     */
    static getOwnershipMiddlewareCode(entityName: string, userPropertyName: string): string;
    /**
     * Gets the middleware file name
     * @param {string} entityName - Name of the entity
     * @returns {string} - Middleware file name
     */
    static getMiddlewareFileName(entityName: string): string;
}
