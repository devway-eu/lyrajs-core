import { AccessControl } from "../../security/index.js";
import { getUserRepository } from "../../loader/index.js";
/**
 * Helper function to match route patterns with parameters
 * Converts Express-style route patterns to regex for matching
 * @param {string} pattern - Route pattern (e.g., "/user/:id")
 * @param {string} path - Actual request path (e.g., "/user/123")
 * @returns {boolean} - True if path matches pattern
 * @private
 * @example
 * matchRoute('/user/:id', '/user/123') // true
 * matchRoute('/user/:id', '/posts/123') // false
 */
const matchRoute = (pattern, path) => {
    // Convert route pattern to regex (e.g., "/user/:id" -> /^\/user\/[^\/]+$/)
    const regexPattern = pattern
        .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
        .replace(/\//g, '\\/'); // Escape slashes
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
};
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
export const httpRequestMiddleware = async (req, res, next) => {
    try {
        // Try to get authenticated user (don't throw error if not authenticated)
        req.user = null;
        // Try to get token from cookies first, then from Authorization header
        let token = req.cookies?.Token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (token) {
            try {
                const UserRepositoryClass = await getUserRepository();
                if (UserRepositoryClass) {
                    const userRepository = new UserRepositoryClass();
                    const decoded = AccessControl.isTokenValid(token);
                    if (decoded?.id) {
                        const user = await userRepository.find(decoded.id);
                        if (user) {
                            req.user = user;
                        }
                    }
                }
            }
            catch (error) {
                // Token invalid/expired or user not found - silently continue
                req.user = null;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=httpRequestMiddleware.js.map