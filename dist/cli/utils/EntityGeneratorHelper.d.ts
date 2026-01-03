import { ColumnType } from "../../orm/index.js";
/**
 * EntityGeneratorHelper class
 * Generates entity class code from property definitions
 * Creates entity files with decorators and TypeScript type annotations
 */
export declare class EntityGeneratorHelper {
    static starts: {
        table: string;
        column: string;
    };
    static ends: {
        table: string;
        column: string;
    };
    /**
     * Generates import statements for entity file
     * @returns {string} - Import statements code
     */
    static importsString: () => string;
    /**
     * Generates @Table decorator
     * @returns {string} - Table decorator code
     */
    static tableDecorator: () => string;
    /**
     * Generates constructor code for entity class
     * @param {string} entityName - Name of the entity
     * @returns {string} - Constructor code
     */
    static constructorString: (entityName: string) => string;
    /**
     * Generates @Column decorator for a property
     * @param {ColumnType} property - Property definition
     * @returns {string} - Column decorator code
     */
    static columnDecorator: (property: ColumnType) => string;
    /**
     * Generates property declaration with TypeScript type
     * @param {ColumnType} property - Property definition
     * @returns {string} - Property declaration code
     */
    static propertyString: (property: ColumnType) => string;
    /**
     * Generates property with decorator and declaration
     * @param {ColumnType} property - Property definition
     * @returns {string} - Complete property code
     */
    static propertyWithDecorator: (property: ColumnType) => string;
    /**
     * Generates complete entity file code
     * @param {string} entityName - Name of the entity
     * @param {ColumnType[]} properties - Array of entity properties
     * @returns {string} - Complete entity code
     * @example
     * // Generate entity for User
     * const code = EntityGeneratorHelper.getFullEntityCode('User', properties)
     */
    static getFullEntityCode(entityName: string, properties: ColumnType[]): string;
    /**
     * Adds new properties to existing entity file content
     * @param {string} existingContent - Current entity file content
     * @param {ColumnType[]} newProperties - Array of new properties to add
     * @returns {string} - Updated entity file content
     */
    static addPropertiesToExistingEntity(existingContent: string, newProperties: ColumnType[]): string;
}
