import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
import { SchemaDiff } from '../interfaces/types.js';
/**
 * SchemaDiffer
 * Compares two database schemas and generates a diff
 * Detects table/column additions, modifications, and removals
 */
export declare class SchemaDiffer {
    /**
     * Compare current and desired schemas
     */
    diff(current: DatabaseSchema, desired: DatabaseSchema): SchemaDiff;
    /**
     * Find tables that exist in desired but not in current
     */
    private findNewTables;
    /**
     * Find tables that exist in current but not in desired
     */
    private findRemovedTables;
    /**
     * Detect potential table renames using similarity
     */
    private detectTableRenames;
    /**
     * Get tables that exist in both schemas
     */
    private getCommonTables;
    /**
     * Find new columns in a table
     */
    private findNewColumns;
    /**
     * Find removed columns from a table
     */
    private findRemovedColumns;
    /**
     * Find modified columns (type, nullable, default changes)
     */
    private findModifiedColumns;
    /**
     * Find new indexes
     */
    private findNewIndexes;
    /**
     * Find removed indexes
     */
    private findRemovedIndexes;
    /**
     * Find new foreign keys
     */
    private findNewForeignKeys;
    /**
     * Find removed foreign keys
     */
    private findRemovedForeignKeys;
    /**
     * Normalize type names for comparison
     */
    private normalizeType;
    /**
     * Calculate Levenshtein distance for similarity detection
     */
    private calculateSimilarity;
}
