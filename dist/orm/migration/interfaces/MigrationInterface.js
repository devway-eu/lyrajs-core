/**
 * Base Migration Class
 * Abstract base class providing default implementations for migration interface
 * Reduces boilerplate by providing sensible defaults for optional properties
 * Extend this class instead of implementing MigrationInterface directly
 * @abstract
 * @implements {MigrationInterface}
 * @example
 * export class Migration_1234567890 extends BaseMigration {
 *   readonly version = "1234567890"
 *
 *   async up(connection: any): Promise<void> {
 *     await connection.query("CREATE TABLE products (id INT PRIMARY KEY)")
 *   }
 *
 *   async down(connection: any): Promise<void> {
 *     await connection.query("DROP TABLE products")
 *   }
 * }
 */
export class BaseMigration {
    constructor() {
        /**
         * Default: non-destructive migration
         * Override to true for DROP, TRUNCATE, or DELETE operations
         */
        this.isDestructive = false;
        /**
         * Default: no forced backup
         * Override to true for risky operations
         */
        this.requiresBackup = false;
        /**
         * Default: automatic rollback on error
         * Override to false if migration handles errors internally
         */
        this.autoRollbackOnError = true;
        /**
         * Default: no dependencies
         * Override to specify required preceding migrations
         */
        this.dependsOn = [];
        /**
         * Default: no conflicts
         * Override to specify incompatible concurrent migrations
         */
        this.conflictsWith = [];
        /**
         * Default: can run in parallel
         * Override to false for migrations requiring exclusive access
         */
        this.canRunInParallel = true;
    }
    /**
     * Preview migration SQL
     * Default implementation returns empty array
     * Override to provide dry-run capability
     * @param {any} connection - Database connection
     * @returns {Promise<string[]>} SQL statements to be executed
     */
    async dryRun(connection) {
        return [];
    }
    /**
     * Validate migration before execution
     * Default implementation always returns valid
     * Override to add custom validation logic
     * @param {any} schema - Current database schema
     * @returns {Promise<ValidationResult>} Validation result
     */
    async validate(schema) {
        return { valid: true, errors: [] };
    }
}
//# sourceMappingURL=MigrationInterface.js.map