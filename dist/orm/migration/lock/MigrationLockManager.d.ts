/**
 * MigrationLockManager
 * Prevents concurrent migration execution
 */
export declare class MigrationLockManager {
    private connection;
    private lockAcquired;
    constructor(connection: any);
    /**
     * Acquire a migration lock
     */
    acquireLock(): Promise<void>;
    /**
     * Release the migration lock
     */
    releaseLock(): Promise<void>;
    /**
     * Force release the lock (for stale locks)
     */
    private forceRelease;
    /**
     * Execute a callback with lock protection
     */
    withLock<T>(callback: () => Promise<T>): Promise<T>;
}
