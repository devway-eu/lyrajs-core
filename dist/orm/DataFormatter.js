import "reflect-metadata";
/**
 * DataFormatter class
 * Formats entity data according to database column type metadata
 * Converts values to appropriate JavaScript types based on SQL column types
 */
export class DataFormatter {
    /**
     * Formats entity data based on column metadata
     * Converts database values to appropriate JavaScript types (Date, number, string, etc.)
     * Handles nullable columns and various SQL data types
     * Only includes properties that have @Column() decorator
     * @param {Entity<StdObject> | StdObject} entity - Entity instance to format
     * @returns {StdObject} - Formatted entity with properly typed values (only decorated columns)
     * @example
     * const formattedUser = DataFormatter.getFormattedEntityData(rawUser)
     * // Date strings become Date objects, numeric strings become numbers, etc.
     * // Non-decorated properties (like Category.posts) are excluded
     */
    static getFormattedEntityData(entity) {
        // Note: Column decorator stores metadata on the prototype, not the instance
        const columns = Reflect.getMetadata("entity:columns", entity.constructor.prototype);
        const EntityClass = entity.constructor;
        const formattedEntity = new EntityClass();
        for (const [property, value] of Object.entries(entity)) {
            const columnInfo = columns === null || columns === void 0 ? void 0 : columns.find((col) => col.name === property);
            // Skip properties without @Column() decorator (e.g., relationship properties, methods)
            if (!columnInfo) {
                continue;
            }
            const { type, nullable } = columnInfo;
            switch (type.toLowerCase()) {
                case "date":
                case "time":
                case "year":
                case "datetime":
                case "timestamp":
                    ;
                    formattedEntity[property] = value !== null && value !== undefined ? new Date(value) : null;
                    break;
                case "tinyint":
                case "smallint":
                case "mediumint":
                case "int":
                case "integer":
                case "bigint":
                    ;
                    formattedEntity[property] = value !== null && value !== undefined ? parseInt(value) : null;
                    break;
                case "float":
                case "double":
                case "decimal":
                    ;
                    formattedEntity[property] = value !== null && value !== undefined ? parseFloat(value) : null;
                    break;
                case "char":
                case "varchar":
                case "tinytext":
                case "text":
                case "mediumtext":
                case "longtext":
                case "tinyblob":
                case "blob":
                case "mediumblob":
                case "longblob":
                    ;
                    formattedEntity[property] = value !== null && value !== undefined ? String(value) : null;
                    break;
                case "json":
                    ;
                    formattedEntity[property] = value !== null && value !== undefined ? JSON.stringify(value) : null;
                    break;
                default:
                    ;
                    formattedEntity[property] = value;
                    break;
            }
        }
        return formattedEntity;
    }
}
//# sourceMappingURL=DataFormatter.js.map