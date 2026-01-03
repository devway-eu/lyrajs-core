/**
 * EntityGeneratorHelper class
 * Generates entity class code from property definitions
 * Creates entity files with decorators and TypeScript type annotations
 */
export class EntityGeneratorHelper {
    static starts = {
        table: "@Table(",
        column: "@Column({ "
    };
    static ends = {
        table: ")",
        column: " })"
    };
    /**
     * Generates import statements for entity file
     * @returns {string} - Import statements code
     */
    static importsString = () => {
        return `import { Column, Entity, Table } from "@lyra-js/core"\n\n`;
    };
    /**
     * Generates @Table decorator
     * @returns {string} - Table decorator code
     */
    static tableDecorator = () => {
        return this.starts.table + this.ends.table + "\n";
    };
    /**
     * Generates constructor code for entity class
     * @param {string} entityName - Name of the entity
     * @returns {string} - Constructor code
     */
    static constructorString = (entityName) => {
        return (`  constructor(${entityName.toLowerCase()}?: Partial<${entityName}> | ${entityName}) {` +
            `\n` +
            `    super(${entityName.toLowerCase()})` +
            `\n` +
            `  }` +
            `\n`);
    };
    /**
     * Generates @Column decorator for a property
     * @param {ColumnType} property - Property definition
     * @returns {string} - Column decorator code
     */
    static columnDecorator = (property) => {
        let decoratorString = "  " + this.starts.column;
        decoratorString += `type: "${property.type === "relation" ? "bigint" : property.type}"`;
        decoratorString += property.size ? `, size: ${property.size}` : ``;
        decoratorString += property.pk ? `, pk: true` : ``;
        decoratorString += property.references ? `, fk: true, references: "${property.references}.id"` : ``;
        decoratorString += property.onDelete ? `, onDelete: "${property.onDelete}"` : ``;
        decoratorString += property.nullable ? `, nullable: true` : ``;
        decoratorString += property.unique ? `, unique: true` : ``;
        decoratorString += property.default ? `, default: ${property.default}` : ``;
        decoratorString += this.ends.column;
        return decoratorString;
    };
    /**
     * Generates property declaration with TypeScript type
     * @param {ColumnType} property - Property definition
     * @returns {string} - Property declaration code
     */
    static propertyString = (property) => {
        let propertyString = "  " + property.name + ": ";
        switch (property.type.toLowerCase()) {
            case "date":
            case "time":
            case "year":
            case "datetime":
            case "timestamp":
                propertyString +=
                    `string | Date` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = new Date()`);
                break;
            case "tinyint":
            case "smallint":
            case "mediumint":
            case "int":
            case "integer":
            case "bigint":
            case "float":
            case "double":
            case "decimal":
                propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``);
                break;
            case "char":
            case "varchar":
            case "tinytext":
            case "text":
            case "mediumtext":
            case "longtext":
            case "json":
            case "tinyblob":
            case "blob":
            case "mediumblob":
            case "longblob":
                propertyString += `string` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``);
                break;
            case "bool":
                propertyString +=
                    `boolean` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = false`);
                break;
            case "relation":
                propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``);
                break;
        }
        return propertyString;
    };
    /**
     * Generates property with decorator and declaration
     * @param {ColumnType} property - Property definition
     * @returns {string} - Complete property code
     */
    static propertyWithDecorator = (property) => {
        return this.columnDecorator(property) + "\n" + this.propertyString(property) + "\n";
    };
    /**
     * Generates complete entity file code
     * @param {string} entityName - Name of the entity
     * @param {ColumnType[]} properties - Array of entity properties
     * @returns {string} - Complete entity code
     * @example
     * // Generate entity for User
     * const code = EntityGeneratorHelper.getFullEntityCode('User', properties)
     */
    static getFullEntityCode(entityName, properties) {
        let entityCodeContent = ``;
        entityCodeContent += this.importsString();
        entityCodeContent += this.tableDecorator();
        entityCodeContent += `export class ${entityName} extends Entity<${entityName}> {` + "\n";
        entityCodeContent += this.propertyWithDecorator({
            name: "id",
            type: "bigint",
            nullable: false,
            unique: false,
            pk: true
        });
        for (const prop of properties) {
            entityCodeContent += this.propertyWithDecorator(prop);
        }
        entityCodeContent += `\n`;
        entityCodeContent += this.constructorString(entityName);
        entityCodeContent += `}` + `\n`;
        return entityCodeContent;
    }
    /**
     * Adds new properties to existing entity file content
     * @param {string} existingContent - Current entity file content
     * @param {ColumnType[]} newProperties - Array of new properties to add
     * @returns {string} - Updated entity file content
     */
    static addPropertiesToExistingEntity(existingContent, newProperties) {
        let newPropertiesCode = `\n`;
        for (const prop of newProperties) {
            newPropertiesCode += this.propertyWithDecorator(prop);
        }
        const constructorRegex = /\s+constructor\(/;
        const constructorMatch = existingContent.match(constructorRegex);
        if (!constructorMatch || constructorMatch.index === undefined) {
            throw new Error("Could not find constructor in entity file");
        }
        // Insert new properties before the constructor
        const beforeConstructor = existingContent.substring(0, constructorMatch.index);
        const fromConstructor = existingContent.substring(constructorMatch.index);
        return beforeConstructor + newPropertiesCode + fromConstructor;
    }
}
//# sourceMappingURL=EntityGeneratorHelper.js.map