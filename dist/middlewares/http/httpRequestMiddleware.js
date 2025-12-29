import { MethodNotAllowedException, NotFoundException } from "../../errors/index.js";
import { AccessControl } from "../../security/index.js";
import { RouterHelper } from "../../security/index.js";
import { getUserRepository } from "../../loader/index.js";
// Helper function to match route patterns with parameters
const matchRoute = (pattern, path) => {
    // Convert route pattern to regex (e.g., "/user/:id" -> /^\/user\/[^\/]+$/)
    const regexPattern = pattern
        .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
        .replace(/\//g, '\\/'); // Escape slashes
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
};
export const httpRequestMiddleware = async (req, res, next) => {
    try {
        // Check if route exists
        const routerRoutes = RouterHelper.listRoutes();
        const routeWithMethod = routerRoutes.find((route) => matchRoute(route.path, req.originalUrl) && route.httpMethod === req.method);
        const routeExists = routerRoutes.find((route) => matchRoute(route.path, req.originalUrl));
        // Handle route not found or method not allowed
        if (!routeWithMethod) {
            if (routeExists) {
                throw new MethodNotAllowedException(`Method ${req.method} not allowed for this route`);
            }
            else {
                throw new NotFoundException("Route");
            }
        }
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
                const userRepository = await getUserRepository();
                if (userRepository) {
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