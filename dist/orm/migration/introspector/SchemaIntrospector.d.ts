import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
/**
 * SchemaIntrospector
 * Introspects the current database schema using information_schema
 * MySQL-specific implementation
 */
export declare class SchemaIntrospector {
    private connection;
    constructor(connection: any);
    /**
     * Get the complete current schema from the database
     */
    getCurrentSchema(): Promise<DatabaseSchema>;
    /**
     * Get all table names in the current database
     */
    private getTables;
    /**
     * Get all columns for a specific table
     */
    private getColumns;
    /**
     * Get all indexes for a specific table
     */
    private getIndexes;
    /**
     * Get all foreign keys for a specific table
     */
    private getForeignKeys;
    /**
     * Check if migrations tracking tables exist
     */
    migrationTablesExist(): Promise<boolean>;
    /**
     * Initialize migration tracking tables
     */
    initializeMigrationTables(): Promise<void>;
}
