import rateLimit from 'express-rate-limit'
import { SecurityConfig } from "@/core/config"

const securityConfig = new SecurityConfig().getConfig()

const rateLimiter = rateLimit({
    windowMs: securityConfig.rate_limiter.time,
    max: securityConfig.rate_limiter.max_attempts,
    message: securityConfig.rate_limiter.message
})