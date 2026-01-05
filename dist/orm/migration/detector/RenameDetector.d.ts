import { TableDefinition, ColumnDefinition, TableRename, ColumnRename } from "../interfaces/types.js";
/**
 * RenameDetector
 * Detects potential table and column renames using similarity algorithms
 * Helps prevent accidental data loss from DROP + CREATE operations
 */
export declare class RenameDetector {
    private readonly SIMILARITY_THRESHOLD;
    private readonly HIGH_CONFIDENCE_THRESHOLD;
    /**
     * Detect potential column renames within a table
     */
    detectColumnRenames(tableName: string, removedColumns: ColumnDefinition[], addedColumns: ColumnDefinition[]): ColumnRename[];
    /**
     * Detect potential table renames
     */
    detectTableRenames(removedTables: TableDefinition[], addedTables: TableDefinition[]): TableRename[];
    /**
     * Calculate Levenshtein distance-based similarity (0-1 scale)
     */
    private calculateSimilarity;
    /**
     * Calculate structural similarity between two tables
     */
    private calculateTableStructureSimilarity;
    /**
     * Check if two column types are compatible
     */
    private areTypesCompatible;
    /**
     * Check if column constraints match
     */
    private doConstraintsMatch;
    /**
     * Normalize type names for comparison
     */
    private normalizeType;
    /**
     * Check if a rename has high confidence
     */
    isHighConfidence(confidence: number): boolean;
}
