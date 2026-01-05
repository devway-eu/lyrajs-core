import { GenerateOptions } from '../interfaces/types.js';
/**
 * MigrationGenerator
 * Generates TypeScript migration files based on entity changes
 */
export declare class MigrationGenerator {
    private connection;
    constructor(connection: any);
    /**
     * Generate a new migration file
     */
    generate(options?: GenerateOptions): Promise<void>;
    /**
     * Build the TypeScript migration class content using string concatenation
     */
    private buildMigrationClass;
    /**
     * Generate UP migration SQL
     */
    private generateUpSQL;
    /**
     * Generate DOWN migration SQL (reverse operations)
     */
    private generateDownSQL;
    /**
     * Generate dry run SQL preview
     */
    private generateDryRunSQL;
    /**
     * Generate CREATE TABLE SQL
     */
    private generateCreateTableSQL;
    /**
     * Generate ADD COLUMN SQL
     */
    private generateAddColumnSQL;
    /**
     * Generate MODIFY COLUMN SQL
     */
    private generateModifyColumnSQL;
    /**
     * Generate ADD INDEX SQL
     */
    private generateAddIndexSQL;
    /**
     * Generate ADD FOREIGN KEY SQL
     */
    private generateAddForeignKeySQL;
    /**
     * Print a summary of the diff
     */
    private printDiffSummary;
}
