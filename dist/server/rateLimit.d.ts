import { Request, Response, NextFunction } from './serverTypes.js';
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
    statusCode?: number;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
    handler?: (req: Request, res: Response) => void;
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
export declare function rateLimit(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Create a rate limiter with sliding window algorithm
 * More accurate but slightly more expensive
 */
export declare function rateLimitSliding(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
