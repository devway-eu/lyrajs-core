import { rateLimit } from '../../server/index.js';
import { SecurityConfig } from "../../config/index.js";
const securityConfig = new SecurityConfig().getConfig();
/**
 * Rate limiter middleware
 * Limits the number of requests from a single IP address within a time window
 * Configuration loaded from security.yaml (rate_limiter.time, rate_limiter.max_attempts, rate_limiter.message)
 * @example
 * import { rateLimiter } from '@lyra-js/core'
 * app.use(rateLimiter)
 */
export const rateLimiter = rateLimit({
    windowMs: securityConfig.rate_limiter.time,
    max: securityConfig.rate_limiter.max_attempts,
    message: securityConfig.rate_limiter.message
});
//# sourceMappingURL=rateLimiter.js.map