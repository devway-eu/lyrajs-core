import { MigrateOptions } from '../interfaces/types.js';
/**
 * MigrationExecutor
 * Executes and tracks migrations with transaction support
 */
export declare class MigrationExecutor {
    private connection;
    constructor(connection: any);
    /**
     * Execute all pending migrations
     */
    migrate(options?: MigrateOptions): Promise<void>;
    /**
     * Rollback the last batch of migrations
     */
    rollback(steps?: number): Promise<void>;
    /**
     * Rollback to a specific migration version
     * Rolls back all migrations after (and including) the specified version
     */
    rollbackToVersion(targetVersion: string): Promise<void>;
    /**
     * Rollback all executed migrations
     * Rolls back every migration in reverse order (most recent first)
     */
    rollbackAll(): Promise<void>;
    /**
     * Show migration status with enhanced details
     */
    status(): Promise<void>;
    /**
     * Validate pending migrations
     */
    private validateMigrations;
    /**
     * Execute a single migration
     */
    private executeMigration;
    /**
     * Rollback a single migration
     */
    private rollbackMigration;
    /**
     * Load all migration files from migrations folder
     */
    private loadAllMigrations;
    /**
     * Load a specific migration by version
     */
    private loadMigration;
    /**
     * Get all executed migrations from database
     */
    private getExecutedMigrations;
    /**
     * Get the next batch number for migrations
     */
    private getNextBatchNumber;
}
