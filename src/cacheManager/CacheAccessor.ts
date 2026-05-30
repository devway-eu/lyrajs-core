import { Config, LyraConsole } from "../"
import { Redis } from "ioredis"

const { host, port, password } = new Config().get("redis")

export class CacheAccessor {
  private cache: Redis

  constructor() {
    this.cache = new Redis({
      host,
      port,
      password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        LyraConsole.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`)
        return delay
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    })

    // Error handling
    this.cache.on("error", (error) => {
      LyraConsole.error("Redis connection error:", error.message)
    })

    this.cache.on("connect", () => {
      LyraConsole.info("Redis connected successfully")
    })

    this.cache.on("ready", () => {
      LyraConsole.info("Redis is ready to accept commands")
    })

    this.cache.on("reconnecting", () => {
      LyraConsole.warn("Redis reconnecting...")
    })
  }

  /**
   * Get a value(s) from cache
   * @param key - Cache key or array of keys
   * @returns Parsed value or null if not found
   */
  async get<T = any>(key: string | string[]): Promise<T | T[] | null> {
    try {
      const jsonCached =
        typeof key === "string" ? await this.cache.get(key) : Array.isArray(key) ? await this.cache.mget(key) : null

      const cached =
        jsonCached && Array.isArray(jsonCached)
          ? jsonCached.map((json) => (json ? JSON.parse(json) : null))
          : jsonCached
            ? JSON.parse(jsonCached)
            : null

      return cached ?? null
    } catch (error) {
      LyraConsole.error(`Redis GET error for key "${key}":`, error as string)
      return null
    }
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds or string format "1 day", "2 hours", etc. (optional)
   */
  async set<T = any>(key: string, value: T, ttl?: number | string): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      const ttlSeconds = ttl ? (typeof ttl === "string" ? this.strToTTL(ttl) : ttl) : null
      if (ttlSeconds) {
        await this.cache.setex(key, ttlSeconds, serialized)
      } else {
        await this.cache.set(key, serialized)
      }
    } catch (error) {
      LyraConsole.error(`Redis SET error for key "${key}":`, error as string)
      throw error
    }
  }

  /**
   * Delete one or more keys from cache
   * @param keys - Single key or array of keys to delete
   * @returns Number of keys deleted
   */
  async delete(...keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0
      return await this.cache.del(...keys)
    } catch (error) {
      LyraConsole.error(`Redis DELETE error for keys "${keys.join(", ")}":`, error as string)
      throw error
    }
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   * @returns True if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.cache.exists(key)
      return result === 1
    } catch (error) {
      LyraConsole.error(`Redis EXISTS error for key "${key}":`, error as string)
      return false
    }
  }

  /**
   * Increment a numeric value in cache
   * @param key - Cache key
   * @param amount - Amount to increment (default: 1)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.cache.incrby(key, amount)
    } catch (error) {
      LyraConsole.error(`Redis INCREMENT error for key "${key}":`, error as string)
      throw error
    }
  }

  /**
   * Decrement a numeric value in cache
   * @param key - Cache key
   * @param amount - Amount to decrement (default: 1)
   * @returns New value after decrement
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.cache.decrby(key, amount)
    } catch (error) {
      LyraConsole.error(`Redis DECREMENT error for key "${key}":`, error as string)
      throw error
    }
  }

  /**
   * Clear all keys matching a pattern
   * @param pattern - Pattern to match (e.g., "user:*")
   * @returns Number of keys deleted
   */
  async clear(pattern: string = "*"): Promise<number> {
    try {
      const keys = await this.cache.keys(pattern)
      if (keys.length === 0) return 0
      return await this.cache.del(...keys)
    } catch (error) {
      LyraConsole.error(`Redis CLEAR error for pattern "${pattern}":`, error as string)
      throw error
    }
  }

  /**
   * Set expiration time on a key
   * @param key - Cache key
   * @param seconds - Expiration time in seconds
   * @returns True if expiration was set, false if key doesn't exist
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.cache.expire(key, seconds)
      return result === 1
    } catch (error) {
      LyraConsole.error(`Redis EXPIRE error for key "${key}":`, error as string)
      return false
    }
  }

  /**
   * Get remaining time to live for a key
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.cache.ttl(key)
    } catch (error) {
      LyraConsole.error(`Redis TTL error for key "${key}":`, error as string)
      return -2
    }
  }

  /**
   * Gracefully close the Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.cache.quit()
      LyraConsole.info("Redis connection closed")
    } catch (error) {
      LyraConsole.error("Redis disconnect error:", error as string)
    }
  }

  strToTTL(str: string): number | void {
    try {
      if (str === "forever") return -1
      const splitted = str.split(" ")
      if (splitted.length !== 2) throw new Error("Invalid TTL string: ")
      const duration = splitted[0]
      const unit = splitted[1]

      switch (unit) {
        case "second":
        case "seconds":
          return parseInt(duration)
        case "minute":
        case "minutes":
          return parseInt(duration) * 60
        case "hour":
        case "hours":
          return parseInt(duration) * 60 * 60
        case "day":
        case "days":
          return parseInt(duration) * 60 * 60 * 24
        case "week":
        case "weeks":
          return parseInt(duration) * 60 * 60 * 24 * 7
        case "month":
        case "months":
          return parseInt(duration) * 60 * 60 * 24 * 30
        case "year":
        case "years":
          return parseInt(duration) * 60 * 60 * 24 * 365
      }
    } catch (error) {
      LyraConsole.error(error as string)
      return
    }
  }
}

export const cacheAccessor = new CacheAccessor()
