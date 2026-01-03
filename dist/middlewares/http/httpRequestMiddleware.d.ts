import { NextFunction, Request, Response } from "../../server/index.js";
/**
 * HTTP request middleware
 * Authenticates users by extracting and validating JWT tokens
 * Supports both cookie-based (Token) and header-based (Authorization: Bearer) authentication
 * Sets req.user if valid token found, otherwise sets to null
 * Does not reject unauthenticated requests (use isAuthenticated middleware for that)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * import { httpRequestMiddleware } from '@lyra-js/core'
 * app.use(httpRequestMiddleware) // Should be early in middleware chain
 */
export declare const httpRequestMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
