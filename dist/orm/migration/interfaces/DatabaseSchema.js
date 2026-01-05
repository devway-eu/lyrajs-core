/**
 * Represents a complete database schema
 */
export class DatabaseSchema {
    tables = new Map();
    /**
     * Add a table to the schema
     */
    addTable(table) {
        this.tables.set(table.name, table);
    }
    /**
     * Get a table by name
     */
    getTable(name) {
        return this.tables.get(name);
    }
    /**
     * Get all tables
     */
    getTables() {
        return Array.from(this.tables.values());
    }
    /**
     * Check if table exists
     */
    hasTable(name) {
        return this.tables.has(name);
    }
    /**
     * Remove a table
     */
    removeTable(name) {
        this.tables.delete(name);
    }
    /**
     * Get table names
     */
    getTableNames() {
        return Array.from(this.tables.keys());
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            tables: Array.from(this.tables.values())
        };
    }
    /**
     * Create from JSON
     */
    static fromJSON(json) {
        const schema = new DatabaseSchema();
        if (json.tables) {
            for (const table of json.tables) {
                schema.addTable(table);
            }
        }
        return schema;
    }
}
/**
 * Table helper class
 */
export class TableSchema {
    table;
    constructor(table) {
        this.table = table;
    }
    /**
     * Get column by name
     */
    getColumn(name) {
        return this.table.columns.find(c => c.name === name);
    }
    /**
     * Check if column exists
     */
    hasColumn(name) {
        return this.table.columns.some(c => c.name === name);
    }
    /**
     * Get primary key column
     */
    getPrimaryKey() {
        return this.table.columns.find(c => c.primary);
    }
    /**
     * Get all foreign keys
     */
    getForeignKeys() {
        return this.table.foreignKeys;
    }
    /**
     * Get all indexes
     */
    getIndexes() {
        return this.table.indexes;
    }
}
/**
 * Schema diff result implementation
 */
export class SchemaDiffResult {
    tablesToCreate = [];
    tablesToRename = [];
    tablesToDrop = [];
    columnsToAdd = [];
    columnsToRename = [];
    columnsToModify = [];
    columnsToRemove = [];
    indexesToAdd = [];
    indexesToRemove = [];
    foreignKeysToAdd = [];
    foreignKeysToRemove = [];
    isEmpty() {
        return (this.tablesToCreate.length === 0 &&
            this.tablesToRename.length === 0 &&
            this.tablesToDrop.length === 0 &&
            this.columnsToAdd.length === 0 &&
            this.columnsToRename.length === 0 &&
            this.columnsToModify.length === 0 &&
            this.columnsToRemove.length === 0 &&
            this.indexesToAdd.length === 0 &&
            this.indexesToRemove.length === 0 &&
            this.foreignKeysToAdd.length === 0 &&
            this.foreignKeysToRemove.length === 0);
    }
    isDestructive() {
        return (this.tablesToDrop.length > 0 ||
            this.columnsToRemove.length > 0);
    }
}
//# sourceMappingURL=DatabaseSchema.js.map