import rateLimit from 'express-rate-limit';
import { SecurityConfig } from "../../config/index.js";
const securityConfig = new SecurityConfig().getConfig();
export const rateLimiter = rateLimit({
    windowMs: securityConfig.rate_limiter.time,
    max: securityConfig.rate_limiter.max_attempts,
    message: securityConfig.rate_limiter.message
});
//# sourceMappingURL=rateLimiter.js.map