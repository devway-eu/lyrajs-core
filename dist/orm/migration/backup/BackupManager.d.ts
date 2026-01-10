/**
 * BackupManager
 * Manages database backups for migrations using pure SQL and Node.js native libraries
 * No external dependencies required (mysqldump, mysql, gzip)
 * Works cross-platform: Windows, Linux, macOS
 */
export declare class BackupManager {
    private connection;
    private backupDir;
    constructor(connection: any);
    /**
     * Create a full database backup using SQL queries (no mysqldump needed)
     */
    createBackup(migrationVersion: string): Promise<string>;
    /**
     * Create selective backup of specific tables only using SQL queries
     */
    createSelectiveBackup(migrationVersion: string, tables: string[]): Promise<string>;
    /**
     * Compress backup file using Node.js native zlib (no external gzip needed)
     */
    private compressBackupNative;
    /**
     * Restore database from backup file using native SQL execution (no external mysql needed)
     */
    restore(backupPath: string): Promise<void>;
    /**
     * Decompress backup file using Node.js native zlib
     */
    private decompressBackupNative;
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
