/**
 * BackupManager
 * Manages database backups for migrations
 * Creates, restores, and cleans up backup files
 */
export declare class BackupManager {
    private connection;
    private backupDir;
    constructor(connection: any);
    /**
     * Create a full database backup before destructive migration
     */
    createBackup(migrationVersion: string): Promise<string>;
    /**
     * Create selective backup of specific tables only
     */
    createSelectiveBackup(migrationVersion: string, tables: string[]): Promise<string>;
    /**
     * Compress backup file using gzip
     */
    private compressBackup;
    /**
     * Restore database from backup file
     */
    restore(backupPath: string): Promise<void>;
    /**
     * List all available backups
     */
    listBackups(): Array<{
        file: string;
        path: string;
        size: number;
        created: Date;
    }>;
    /**
     * Clean up old backups based on retention policy
     */
    cleanupOldBackups(retentionDays?: number): Promise<number>;
    /**
     * Get total size of all backups
     */
    getTotalBackupSize(): number;
    /**
     * Format bytes to human-readable size
     */
    formatSize(bytes: number): string;
}
