import { MigrationInterface } from '../interfaces/MigrationInterface.js';
import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
import { ValidationResult } from '../interfaces/types.js';
/**
 * MigrationValidator
 * Validates migrations before execution for safety
 */
export declare class MigrationValidator {
    private connection;
    constructor(connection: any);
    /**
     * Validate a migration before execution
     */
    validate(migration: MigrationInterface, schema: DatabaseSchema): Promise<ValidationResult>;
    /**
     * Check if table has existing data
     */
    private checkForExistingData;
    /**
     * Extract table name from SQL query
     */
    private extractTableName;
    /**
     * Get approximate row count for a table
     */
    private getTableRowCount;
}
