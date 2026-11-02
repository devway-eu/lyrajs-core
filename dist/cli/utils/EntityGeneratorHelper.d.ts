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
     * Imports related entities for TypeScript types (FK properties, inverse relations)
     * @param {ColumnType[]} properties - Array of entity properties to check for relations
     * @returns {string} - Import statements code
     */
    static importsString: (properties?: ColumnType[]) => string;
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
     * Handles foreign keys: if property name matches related entity (camelCase), type is number | Entity
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
     * Generates an inverse relation array property (without decorator)
     * @param {string} propertyName - Name of the property
     * @param {string} relatedEntity - Name of the related entity
     * @returns {string} - Property declaration code
     */
    static inverseRelationProperty: (propertyName: string, relatedEntity: string) => string;
    /**
     * Generates relation metadata registration code
     * DEPRECATED: Relations now use @Relation decorator instead of manual metadata
     * @param {ColumnType[]} properties - Array of properties
     * @param {string} entityName - Name of the current entity
     * @returns {string} - Empty string (metadata no longer generated)
     */
    static relationMetadata: (properties: ColumnType[], entityName?: string) => string;
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
