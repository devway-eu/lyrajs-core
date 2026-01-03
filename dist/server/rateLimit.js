/**
 * In-memory rate limiter store
 * For production with multiple servers, consider using Redis or another distributed store
 */
class RateLimitMemoryStore {
    store = new Map();
    cleanupInterval;
    constructor() {
        // Cleanup expired entries every minute
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.store.entries()) {
                if (now > value.resetTime) {
                    this.store.delete(key);
                }
            }
        }, 60000);
    }
    increment(key, windowMs) {
        const now = Date.now();
        const existing = this.store.get(key);
        if (existing && now < existing.resetTime) {
            // Within the current window
            existing.count++;
            return existing;
        }
        else {
            // New window
            const newEntry = {
                count: 1,
                resetTime: now + windowMs
            };
            this.store.set(key, newEntry);
            return newEntry;
        }
    }
    reset(key) {
        this.store.delete(key);
    }
    resetAll() {
        this.store.clear();
    }
    destroy() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}
/**
 * Create a rate limiting middleware
 *
 * @param options - Rate limit configuration options
 * @returns Middleware function that enforces rate limiting
 *
 * @example
 * ```typescript
 * const limiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100, // Limit each IP to 100 requests per windowMs
 *   message: 'Too many requests, please try again later.'
 * });
 *
 * app.use('/api', limiter);
 * ```
 */
export function rateLimit(options) {
    const { windowMs, max, message = 'Too many requests, please try again later.', statusCode = 429, keyGenerator = (req) => {
        // Default: use IP address as key
        return req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            (req.socket?.remoteAddress || 'unknown');
    }, skip = () => false, handler } = options;
    const store = new RateLimitMemoryStore();
    const middleware = (req, res, next) => {
        // Skip if skip function returns true
        if (skip(req)) {
            return next();
        }
        const key = keyGenerator(req);
        const { count, resetTime } = store.increment(key, windowMs);
        // Set rate limit headers
        const remaining = Math.max(0, max - count);
        const resetTimeSeconds = Math.ceil(resetTime / 1000);
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());
        if (count > max) {
            // Limit exceeded
            res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
            if (handler) {
                // Custom handler
                return handler(req, res);
            }
            else {
                // Default handler
                res.status(statusCode).json({
                    status: statusCode,
                    message: message,
                    retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
                });
                return;
            }
        }
        next();
    };
    // Attach store to middleware for testing/debugging
    middleware.store = store;
    middleware.resetKey = (key) => store.reset(key);
    middleware.resetAll = () => store.resetAll();
    return middleware;
}
/**
 * Create a rate limiter with sliding window algorithm
 * More accurate but slightly more expensive
 */
export function rateLimitSliding(options) {
    const { windowMs, max, message = 'Too many requests, please try again later.', statusCode = 429, keyGenerator = (req) => {
        return req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            (req.socket?.remoteAddress || 'unknown');
    }, skip = () => false, handler } = options;
    // Store request timestamps for sliding window
    const store = new Map();
    const middleware = (req, res, next) => {
        if (skip(req)) {
            return next();
        }
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;
        // Get or create request log for this key
        let requests = store.get(key) || [];
        // Remove expired timestamps
        requests = requests.filter(timestamp => timestamp > windowStart);
        // Add current request
        requests.push(now);
        store.set(key, requests);
        const count = requests.length;
        const remaining = Math.max(0, max - count);
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
        if (count > max) {
            // Calculate retry after based on oldest request
            const oldestRequest = requests[0];
            const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            if (handler) {
                return handler(req, res);
            }
            else {
                res.status(statusCode).json({
                    status: statusCode,
                    message: message,
                    retryAfter: retryAfter
                });
                return;
            }
        }
        next();
    };
    // Cleanup old entries periodically
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        const windowStart = now - windowMs;
        for (const [key, requests] of store.entries()) {
            const validRequests = requests.filter(timestamp => timestamp > windowStart);
            if (validRequests.length === 0) {
                store.delete(key);
            }
            else {
                store.set(key, validRequests);
            }
        }
    }, windowMs);
    // Attach utilities
    middleware.store = store;
    middleware.resetKey = (key) => store.delete(key);
    middleware.resetAll = () => store.clear();
    middleware.destroy = () => clearInterval(cleanupInterval);
    return middleware;
}
//# sourceMappingURL=rateLimit.js.map