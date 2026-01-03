import { SecurityConfig } from "../../config/index.js";
import { UnauthorizedException } from "../../errors/index.js";
import { AccessControl } from "../../security/index.js";
import { getUserRepository } from "../../loader/index.js";
/**
 * Access control middleware
 * Enforces role-based access control (RBAC) for protected routes
 * Validates JWT tokens and checks user roles against route permissions
 * Supports both cookie-based (Token) and header-based (Authorization: Bearer) authentication
 * Only applies to routes defined in security.yaml role_hierarchy
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @throws {UnauthorizedException} - If token missing, invalid, or user lacks permission
 * @example
 * import { accessMiddleware } from '@lyra-js/core'
 * app.use(accessMiddleware) // Applies to all routes, checks role_hierarchy config
 */
export const accessMiddleware = async (req, res, next) => {
    try {
        const routePath = req.url || '/';
        const securityConfig = new SecurityConfig().getConfig();
        const roleHierarchy = securityConfig.role_hierarchy;
        if (!AccessControl.isRouteProtected(routePath)) {
            return next();
        }
        // Try to get token from cookies first, then from Authorization header
        let token = req.cookies.Token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token)
            throw new UnauthorizedException("No token provided");
        try {
            const decoded = AccessControl.isTokenValid(token);
            const UserRepositoryClass = await getUserRepository();
            if (!UserRepositoryClass)
                throw new UnauthorizedException("Repository not available");
            const userRepository = new UserRepositoryClass();
            const user = await userRepository.find(decoded.id);
            if (!user)
                throw new UnauthorizedException("Invalid token");
            req.user = user;
            const matchingProtectedRoute = Array.isArray(roleHierarchy)
                ? roleHierarchy.find((route) => route.path === routePath)
                : undefined;
            if (matchingProtectedRoute && !(await AccessControl.canAccessRoute(user, matchingProtectedRoute))) {
                throw new UnauthorizedException("Access denied");
            }
            return next();
        }
        catch (_jwtError) {
            throw new UnauthorizedException('invalid token');
        }
    }
    catch (error) {
        return next(error);
    }
};
//# sourceMappingURL=accessMiddleware.js.map