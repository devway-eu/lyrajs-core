/**
 * Available SQL data types for entity properties
 * Used in entity generation prompts
 */
export const sqlTypeChoices = [
    "tinyint",
    "smallint",
    "mediumint",
    "int",
    "integer",
    "bigint",
    "bool",
    "float",
    "double",
    "decimal",
    "char",
    "varchar",
    "tinytext",
    "text",
    "mediumtext",
    "longtext",
    "json",
    "tinyblob",
    "blob",
    "mediumblob",
    "longblob",
    "date",
    "time",
    "year",
    "datetime",
    "timestamp",
    "enum",
    "relation"
];
/**
 * Available foreign key constraint options for ON DELETE behavior
 * Used when defining entity relationships
 */
export const onDeleteChoices = ["CASCADE", "SET NULL", "NO ACTION", "RESTRICT", "SET DEFAULT"];
//# sourceMappingURL=Choices.js.map