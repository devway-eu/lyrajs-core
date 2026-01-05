/**
 * MigrationSquasher
 * Combines multiple migrations into a single squashed migration
 * Reduces migration count for fresh installations
 */
export declare class MigrationSquasher {
    private connection;
    constructor(connection: any);
    /**
     * Squash migrations up to a specific version
     * Creates a baseline migration representing the current schema state
     */
    squash(targetVersion?: string): Promise<void>;
    /**
     * Build the squashed migration file content
     */
    private buildSquashedMigration;
    /**
     * Generate UP SQL for squashed migration
     */
    private generateSquashedUpSQL;
    /**
     * Generate DOWN SQL for squashed migration
     */
    private generateSquashedDownSQL;
    /**
     * Generate dry run SQL
     */
    private generateSquashedDryRunSQL;
    /**
     * Generate CREATE TABLE SQL
     */
    private generateCreateTableSQL;
    /**
     * Generate CREATE INDEX SQL
     */
    private generateCreateIndexSQL;
    /**
     * Generate ADD FOREIGN KEY SQL
     */
    private generateCreateForeignKeySQL;
}
