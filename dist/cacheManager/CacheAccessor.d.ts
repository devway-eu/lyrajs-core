export declare class CacheAccessor {
    private cache;
    private static enabled;
    private initialized;
    constructor();
    /**
     * Enable cache manager and initialize Redis connection
     * @internal - Called by LyraServer.useCacheManager()
     */
    static enable(): void;
    /**
     * Initialize Redis connection immediately (for server startup)
     * @internal - Called by LyraServer.listen()
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    initialize(): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Check if cache manager is enabled
     */
    static isEnabled(): boolean;
    /**
     * Initialize Redis connection (lazy loading)
     * @private
     */
    private initializeRedis;
    /**
     * Get Redis instance (initializes if needed)
     * @private
     */
    private getCache;
    /**
     * Get a value(s) from cache
     * @param key - Cache key or array of keys
     * @returns Parsed value or null if not found
     */
    get<T = any>(key: string | string[]): Promise<T | T[] | null>;
    /**
     * Set a value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in seconds or string format "1 day", "2 hours", etc. (optional)
     */
    set<T = any>(key: string, value: T, ttl?: number | string): Promise<void>;
    /**
     * Delete one or more keys from cache
     * @param keys - Single key or array of keys to delete
     * @returns Number of keys deleted
     */
    delete(...keys: string[]): Promise<number>;
    /**
     * Check if a key exists in cache
     * @param key - Cache key
     * @returns True if key exists, false otherwise
     */
    exists(key: string): Promise<boolean>;
    /**
     * Increment a numeric value in cache
     * @param key - Cache key
     * @param amount - Amount to increment (default: 1)
     * @returns New value after increment
     */
    increment(key: string, amount?: number): Promise<number>;
    /**
     * Decrement a numeric value in cache
     * @param key - Cache key
     * @param amount - Amount to decrement (default: 1)
     * @returns New value after decrement
     */
    decrement(key: string, amount?: number): Promise<number>;
    /**
     * Clear all keys matching a pattern
     * @param pattern - Pattern to match (e.g., "user:*")
     * @returns Number of keys deleted
     */
    clear(pattern?: string): Promise<number>;
    /**
     * Set expiration time on a key
     * @param key - Cache key
     * @param seconds - Expiration time in seconds
     * @returns True if expiration was set, false if key doesn't exist
     */
    expire(key: string, seconds: number): Promise<boolean>;
    /**
     * Get remaining time to live for a key
     * @param key - Cache key
     * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
     */
    ttl(key: string): Promise<number>;
    /**
     * Gracefully close the Redis connection
     */
    disconnect(): Promise<void>;
    strToTTL(str: string): number | void;
}
export declare const cacheAccessor: CacheAccessor;
