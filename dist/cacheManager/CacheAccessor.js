import { Config, LyraConsole } from "../index.js";
import { Redis } from "ioredis";
export class CacheAccessor {
    constructor() {
        this.cache = null;
        this.initialized = false;
        // Don't initialize Redis in constructor - wait for explicit enablement
    }
    /**
     * Enable cache manager and initialize Redis connection
     * @internal - Called by LyraServer.useCacheManager()
     */
    static enable() {
        CacheAccessor.enabled = true;
    }
    /**
     * Initialize Redis connection immediately (for server startup)
     * @internal - Called by LyraServer.listen()
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async initialize() {
        if (!CacheAccessor.enabled || this.initialized) {
            return { success: false };
        }
        this.initializeRedis();
        // Wait for Redis to be ready or error
        return new Promise((resolve) => {
            if (!this.cache) {
                resolve({ success: false });
                return;
            }
            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Connection timeout' });
            }, 5000); // 5 second timeout
            let errorMessage;
            this.cache.once('ready', () => {
                clearTimeout(timeout);
                resolve({ success: true });
            });
            this.cache.once('error', (error) => {
                var _a, _b, _c, _d, _e;
                clearTimeout(timeout);
                // Determine error type
                if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('NOAUTH')) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('AUTH')) || ((_c = error.command) === null || _c === void 0 ? void 0 : _c.name) === 'auth') {
                    errorMessage = 'Redis authentication failed (check credentials)';
                }
                else if (((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('ECONNREFUSED')) || error.code === 'ECONNREFUSED') {
                    errorMessage = 'Redis connection refused (check host/port)';
                }
                else if (((_e = error.message) === null || _e === void 0 ? void 0 : _e.includes('ETIMEDOUT')) || error.code === 'ETIMEDOUT') {
                    errorMessage = 'Redis connection timeout (check host/port)';
                }
                else {
                    errorMessage = 'Redis connection error';
                }
                resolve({ success: false, error: errorMessage });
            });
        });
    }
    /**
     * Check if cache manager is enabled
     */
    static isEnabled() {
        return CacheAccessor.enabled;
    }
    /**
     * Initialize Redis connection (lazy loading)
     * @private
     */
    initializeRedis() {
        if (this.initialized || !CacheAccessor.enabled) {
            return;
        }
        const { host, port, password } = new Config().get("redis");
        this.cache = new Redis({
            host,
            port,
            password,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: false
        });
        // Silent error handling - errors will be reported during initialization
        this.cache.on("error", () => {
            // Silent - will be handled by initialize() or first request
        });
        this.cache.on("connect", () => {
            // Silent - will be reported by initialize()
        });
        this.cache.on("ready", () => {
            // Silent - will be reported by initialize()
        });
        this.cache.on("reconnecting", () => {
            // Silent - we only report initial connection status
        });
        this.initialized = true;
    }
    /**
     * Get Redis instance (initializes if needed)
     * @private
     */
    getCache() {
        if (!CacheAccessor.enabled) {
            return null;
        }
        if (!this.initialized) {
            this.initializeRedis();
        }
        return this.cache;
    }
    /**
     * Get a value(s) from cache
     * @param key - Cache key or array of keys
     * @returns Parsed value or null if not found
     */
    async get(key) {
        const cache = this.getCache();
        if (!cache)
            return null;
        try {
            const jsonCached = typeof key === "string" ? await cache.get(key) : Array.isArray(key) ? await cache.mget(key) : null;
            const cached = jsonCached && Array.isArray(jsonCached)
                ? jsonCached.map((json) => (json ? JSON.parse(json) : null))
                : jsonCached
                    ? JSON.parse(jsonCached)
                    : null;
            return cached !== null && cached !== void 0 ? cached : null;
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis GET error for key "${key}":`, error);
            }
            return null;
        }
    }
    /**
     * Set a value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in seconds or string format "1 day", "2 hours", etc. (optional)
     */
    async set(key, value, ttl) {
        const cache = this.getCache();
        if (!cache)
            return;
        try {
            const serialized = JSON.stringify(value);
            const ttlSeconds = ttl ? (typeof ttl === "string" ? this.strToTTL(ttl) : ttl) : null;
            if (ttlSeconds) {
                await cache.setex(key, ttlSeconds, serialized);
            }
            else {
                await cache.set(key, serialized);
            }
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis SET error for key "${key}":`, error);
            }
            throw error;
        }
    }
    /**
     * Delete one or more keys from cache
     * @param keys - Single key or array of keys to delete
     * @returns Number of keys deleted
     */
    async delete(...keys) {
        const cache = this.getCache();
        if (!cache)
            return 0;
        try {
            if (keys.length === 0)
                return 0;
            return await cache.del(...keys);
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis DELETE error for keys "${keys.join(", ")}":`, error);
            }
            throw error;
        }
    }
    /**
     * Check if a key exists in cache
     * @param key - Cache key
     * @returns True if key exists, false otherwise
     */
    async exists(key) {
        const cache = this.getCache();
        if (!cache)
            return false;
        try {
            const result = await cache.exists(key);
            return result === 1;
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis EXISTS error for key "${key}":`, error);
            }
            return false;
        }
    }
    /**
     * Increment a numeric value in cache
     * @param key - Cache key
     * @param amount - Amount to increment (default: 1)
     * @returns New value after increment
     */
    async increment(key, amount = 1) {
        const cache = this.getCache();
        if (!cache)
            return 0;
        try {
            return await cache.incrby(key, amount);
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis INCREMENT error for key "${key}":`, error);
            }
            throw error;
        }
    }
    /**
     * Decrement a numeric value in cache
     * @param key - Cache key
     * @param amount - Amount to decrement (default: 1)
     * @returns New value after decrement
     */
    async decrement(key, amount = 1) {
        const cache = this.getCache();
        if (!cache)
            return 0;
        try {
            return await cache.decrby(key, amount);
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis DECREMENT error for key "${key}":`, error);
            }
            throw error;
        }
    }
    /**
     * Clear all keys matching a pattern
     * @param pattern - Pattern to match (e.g., "user:*")
     * @returns Number of keys deleted
     */
    async clear(pattern = "*") {
        const cache = this.getCache();
        if (!cache)
            return 0;
        try {
            const keys = await cache.keys(pattern);
            if (keys.length === 0)
                return 0;
            return await cache.del(...keys);
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis CLEAR error for pattern "${pattern}":`, error);
            }
            throw error;
        }
    }
    /**
     * Set expiration time on a key
     * @param key - Cache key
     * @param seconds - Expiration time in seconds
     * @returns True if expiration was set, false if key doesn't exist
     */
    async expire(key, seconds) {
        const cache = this.getCache();
        if (!cache)
            return false;
        try {
            const result = await cache.expire(key, seconds);
            return result === 1;
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis EXPIRE error for key "${key}":`, error);
            }
            return false;
        }
    }
    /**
     * Get remaining time to live for a key
     * @param key - Cache key
     * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
     */
    async ttl(key) {
        const cache = this.getCache();
        if (!cache)
            return -2;
        try {
            return await cache.ttl(key);
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(`Redis TTL error for key "${key}":`, error);
            }
            return -2;
        }
    }
    /**
     * Gracefully close the Redis connection
     */
    async disconnect() {
        const cache = this.getCache();
        if (!cache)
            return;
        try {
            await cache.quit();
            if (CacheAccessor.enabled) {
                LyraConsole.info("Redis connection closed");
            }
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error("Redis disconnect error:", error);
            }
        }
    }
    strToTTL(str) {
        try {
            if (str === "forever")
                return -1;
            const splitted = str.split(" ");
            if (splitted.length !== 2)
                throw new Error("Invalid TTL string: ");
            const duration = splitted[0];
            const unit = splitted[1];
            switch (unit) {
                case "second":
                case "seconds":
                    return parseInt(duration);
                case "minute":
                case "minutes":
                    return parseInt(duration) * 60;
                case "hour":
                case "hours":
                    return parseInt(duration) * 60 * 60;
                case "day":
                case "days":
                    return parseInt(duration) * 60 * 60 * 24;
                case "week":
                case "weeks":
                    return parseInt(duration) * 60 * 60 * 24 * 7;
                case "month":
                case "months":
                    return parseInt(duration) * 60 * 60 * 24 * 30;
                case "year":
                case "years":
                    return parseInt(duration) * 60 * 60 * 24 * 365;
            }
        }
        catch (error) {
            if (CacheAccessor.enabled) {
                LyraConsole.error(error);
            }
            return;
        }
    }
}
CacheAccessor.enabled = false;
export const cacheAccessor = new CacheAccessor();
//# sourceMappingURL=CacheAccessor.js.map