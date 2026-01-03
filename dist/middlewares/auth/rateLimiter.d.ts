/**
 * Rate limiter middleware
 * Limits the number of requests from a single IP address within a time window
 * Configuration loaded from security.yaml (rate_limiter.time, rate_limiter.max_attempts, rate_limiter.message)
 * @example
 * import { rateLimiter } from '@lyra-js/core'
 * app.use(rateLimiter)
 */
export declare const rateLimiter: (req: import("../../server/index.js").Request, res: import("../../server/index.js").Response, next: import("../../server/index.js").NextFunction) => void;
