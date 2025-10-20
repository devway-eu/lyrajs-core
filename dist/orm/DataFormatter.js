import "reflect-metadata";
export class DataFormatter {
    static getFormattedEntityData(entity) {
        const columns = Reflect.getMetadata("entity:columns", entity);
        const EntityClass = entity.constructor;
        const formattedEntity = new EntityClass(entity);
        for (const [property, value] of Object.entries(entity)) {
            const columnInfo = columns?.find((col) => col.name === property);
            if (!columnInfo) {
                ;
                formattedEntity[property] = value;
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
                    formattedEntity[property] = value && !nullable ? new Date(value) : null;
                    break;
                case "tinyint":
                case "smallint":
                case "mediumint":
                case "int":
                case "integer":
                case "bigint":
                    ;
                    formattedEntity[property] = value && !nullable ? parseInt(value) : null;
                    break;
                case "float":
                case "double":
                case "decimal":
                    ;
                    formattedEntity[property] = value && !nullable ? parseFloat(value) : null;
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
                    formattedEntity[property] = value && !nullable ? String(value) : null;
                    break;
                case "json":
                    ;
                    formattedEntity[property] = value && !nullable ? JSON.stringify(value) : null;
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