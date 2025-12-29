import { MethodNotAllowedException, NotFoundException } from "../../errors/index.js";
import { AccessControl } from "../../security/index.js";
import { RouterHelper } from "../../security/index.js";
import { userRepository } from "../../loader/index.js";
export const httpRequestMiddleware = async (req, res, next) => {
    try {
        // Check if route exists
        const routerRoutes = RouterHelper.listRoutes();
        const routeWithMethod = routerRoutes.find((route) => route.path === req.originalUrl && route.httpMethod === req.method);
        const routeExists = routerRoutes.find((route) => route.path === req.originalUrl);
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
        try {
            const token = req.cookies?.Token;
            if (token) {
                const decoded = AccessControl.isTokenValid(token);
                if (userRepository && decoded?.id) {
                    const user = await userRepository.find(decoded.id);
                    if (user) {
                        req.user = user;
                    }
                }
            }
        }
        catch (error) {
            // Silently fail - user remains null
            req.user = null;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=httpRequestMiddleware.js.map