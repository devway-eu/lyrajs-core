import * as os from 'os';
/**
 * MigrationLockManager
 * Prevents concurrent migration execution
 */
export class MigrationLockManager {
    constructor(connection) {
        this.connection = connection;
        this.lockAcquired = false;
    }
    /**
     * Acquire a migration lock
     */
    async acquireLock() {
        try {
            await this.connection.query(`
        INSERT INTO migration_lock (locked_at, hostname, process_id)
        VALUES (NOW(), ?, ?)
      `, [os.hostname(), process.pid]);
            this.lockAcquired = true;
        }
        catch (error) {
            // Lock already exists
            const locks = await this.connection.query('SELECT * FROM migration_lock LIMIT 1');
            if (locks.length > 0) {
                const lock = locks[0];
                const lockAge = Date.now() - new Date(lock.locked_at).getTime();
                // If lock is older than 1 hour, it's probably stale
                if (lockAge > 3600000) {
                    console.warn(`⚠️  Stale lock detected (${Math.round(lockAge / 1000)}s old), forcing release...`);
                    await this.forceRelease();
                    return this.acquireLock();
                }
                throw new Error(`Migration is locked by ${lock.hostname} (PID: ${lock.process_id}) since ${lock.locked_at}\n` +
                    `Please wait for the migration to complete or manually release the lock.`);
            }
            throw error;
        }
    }
    /**
     * Release the migration lock
     */
    async releaseLock() {
        if (this.lockAcquired) {
            await this.connection.query('DELETE FROM migration_lock');
            this.lockAcquired = false;
        }
    }
    /**
     * Force release the lock (for stale locks)
     */
    async forceRelease() {
        await this.connection.query('DELETE FROM migration_lock');
    }
    /**
     * Execute a callback with lock protection
     */
    async withLock(callback) {
        try {
            await this.acquireLock();
            return await callback();
        }
        finally {
            await this.releaseLock();
        }
    }
}
//# sourceMappingURL=MigrationLockManager.js.map