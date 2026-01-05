import { TableDefinition, ColumnDefinition, SchemaDiff } from './types.js';
/**
 * Represents a complete database schema
 */
export declare class DatabaseSchema {
    private tables;
    /**
     * Add a table to the schema
     */
    addTable(table: TableDefinition): void;
    /**
     * Get a table by name
     */
    getTable(name: string): TableDefinition | undefined;
    /**
     * Get all tables
     */
    getTables(): TableDefinition[];
    /**
     * Check if table exists
     */
    hasTable(name: string): boolean;
    /**
     * Remove a table
     */
    removeTable(name: string): void;
    /**
     * Get table names
     */
    getTableNames(): string[];
    /**
     * Convert to JSON
     */
    toJSON(): any;
    /**
     * Create from JSON
     */
    static fromJSON(json: any): DatabaseSchema;
}
/**
 * Table helper class
 */
export declare class TableSchema {
    private table;
    constructor(table: TableDefinition);
    /**
     * Get column by name
     */
    getColumn(name: string): ColumnDefinition | undefined;
    /**
     * Check if column exists
     */
    hasColumn(name: string): boolean;
    /**
     * Get primary key column
     */
    getPrimaryKey(): ColumnDefinition | undefined;
    /**
     * Get all foreign keys
     */
    getForeignKeys(): import("./types.js").ForeignKeyDefinition[];
    /**
     * Get all indexes
     */
    getIndexes(): import("./types.js").IndexDefinition[];
}
/**
 * Schema diff result implementation
 */
export declare class SchemaDiffResult implements SchemaDiff {
    tablesToCreate: TableDefinition[];
    tablesToRename: any[];
    tablesToDrop: string[];
    columnsToAdd: any[];
    columnsToRename: any[];
    columnsToModify: any[];
    columnsToRemove: any[];
    indexesToAdd: any[];
    indexesToRemove: any[];
    foreignKeysToAdd: any[];
    foreignKeysToRemove: any[];
    isEmpty(): boolean;
    isDestructive(): boolean;
}
