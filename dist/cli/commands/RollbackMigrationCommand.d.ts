/**
 * RollbackMigrationCommand class
 * Rolls back migrations to a specific version or by steps
 * Uses the new TypeScript-based migration system
 *
 * Usage:
 *   maestro migration:rollback                    (rollback last batch)
 *   maestro migration:rollback --steps=2          (rollback 2 batches)
 *   maestro migration:rollback --version=123456   (rollback to specific version)
 */
export declare class RollbackMigrationCommand {
    /**
     * Executes the rollback migration command
     * Parses args for --version or --steps flags
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    execute(args?: string[]): Promise<void>;
}
