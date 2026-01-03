import jwt from "jsonwebtoken";
import { SecurityConfig } from "../config/index.js";
import { UnauthorizedException } from "../errors/index.js";
/**
 * AccessControl class
 * Handles authentication, authorization, and JWT token management
 * Provides role-based access control (RBAC) with role hierarchy support
 * Manages JWT token generation, validation, and refresh
 */
export class AccessControl {
    /**
     * Builds a role hierarchy map with inherited roles
     * Recursively resolves role inheritance from security configuration
     * @returns {Record<string, Set<string>>} - Map of roles to their inherited roles
     * @example
     * const roleMap = AccessControl.getRoleMap()
     * // { ROLE_ADMIN: Set(['ROLE_USER', 'ROLE_GUEST']), ... }
     */
    static getRoleMap() {
        const hierarchy = new SecurityConfig().getConfig().role_hierarchy;
        const resolved = {};
        const resolve = (role) => {
            if (resolved[role])
                return resolved[role];
            const children = Array.isArray(hierarchy[role]) ? hierarchy[role] : [hierarchy[role]];
            const result = new Set(children);
            for (const child of children) {
                if (hierarchy[child]) {
                    for (const r of resolve(child))
                        result.add(r);
                }
            }
            resolved[role] = result;
            return result;
        };
        for (const role of Object.keys(hierarchy))
            resolve(role);
        return resolved;
    }
    /**
     * Checks if a route is protected by access control
     * @param {string} routePath - Route path to check
     * @returns {boolean} - True if route has access control rules
     * @example
     * const isProtected = AccessControl.isRouteProtected('/api/admin')
     */
    static isRouteProtected(routePath) {
        const securityConfig = new SecurityConfig().getConfig();
        const protectedRoutes = securityConfig.access_control;
        const matchingRoutes = protectedRoutes.filter((protectedRoutes) => protectedRoutes.path.startsWith(routePath));
        return matchingRoutes.length > 0;
    }
    /**
     * Checks if user can access a specific route based on roles
     * Considers both direct role and inherited roles from hierarchy
     * @param {typeof User} user - User object with role property
     * @param {ProtectedRouteType} route - Protected route with allowed roles
     * @returns {Promise<boolean>} - True if user has permission
     * @throws {UnauthorizedException} - If user or route not provided
     * @example
     * const canAccess = await AccessControl.canAccessRoute(user, route)
     */
    static async canAccessRoute(user, route) {
        if (!user || !user.role || !route)
            throw new UnauthorizedException("No user or route provided");
        const roleMap = AccessControl.getRoleMap();
        const userRoles = new Set([user.role]);
        const inheritedRoles = roleMap[user.role];
        if (inheritedRoles) {
            for (const r of inheritedRoles)
                userRoles.add(r);
        }
        const allowedRoles = route.roles;
        return allowedRoles.some((role) => userRoles.has(role));
    }
    /**
     * Decodes a JWT token without verification
     * @param {string} token - JWT token to decode
     * @returns {Promise<jwt.JwtPayload>} - Decoded token payload
     * @example
     * const payload = await AccessControl.decodeToken(token)
     */
    static async decodeToken(token) {
        return jwt.decode(token);
    }
    /**
     * Validates a JWT access token
     * Verifies signature and expiration using configured secret and algorithm
     * @param {string} token - JWT token to validate
     * @returns {jwt.JwtPayload} - Verified token payload
     * @throws {Error} - If token invalid or expired
     * @example
     * const payload = AccessControl.isTokenValid(token)
     */
    static isTokenValid(token) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.verify(token, securityConfig.jwt.secret_key, { algorithms: [securityConfig.jwt.algorithm] });
    }
    /**
     * Validates a JWT refresh token
     * Verifies signature and expiration using configured refresh secret
     * @param {string} refreshToken - JWT refresh token to validate
     * @throws {Error} - If refresh token invalid or expired
     * @example
     * AccessControl.checkRefreshTokenValid(refreshToken)
     */
    static checkRefreshTokenValid(refreshToken) {
        const securityConfig = new SecurityConfig().getConfig();
        jwt.verify(refreshToken, securityConfig.jwt.secret_key_refresh, { algorithms: [securityConfig.jwt.algorithm] });
    }
    /**
     * Generates a new JWT access token for a user
     * Includes user ID in payload with configured expiration
     * @param {typeof User} user - User object to generate token for
     * @returns {Promise<string>} - Signed JWT access token
     * @example
     * const token = await AccessControl.getNewToken(user)
     */
    static async getNewToken(user) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key, {
            expiresIn: securityConfig.jwt.token_expiration,
            algorithm: securityConfig.jwt.algorithm
        });
    }
    /**
     * Generates a new JWT refresh token for a user
     * Includes user ID in payload with longer expiration than access token
     * @param {typeof User} user - User object to generate refresh token for
     * @returns {Promise<string>} - Signed JWT refresh token
     * @example
     * const refreshToken = await AccessControl.getNewRefreshToken(user)
     */
    static async getNewRefreshToken(user) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key_refresh, {
            expiresIn: securityConfig.jwt.refresh_token_expiration,
            algorithm: securityConfig.jwt.algorithm
        });
    }
    /**
     * Checks if user has a role higher than the specified role in hierarchy
     * Returns false if user has the exact role (not higher)
     * @param {typeof User} user - User object with role property
     * @param {string} role - Role to compare against
     * @returns {boolean} - True if user's role is higher in hierarchy
     * @example
     * const isHigher = AccessControl.hasRoleHigherThan(user, 'ROLE_USER')
     */
    static hasRoleHigherThan(user, role) {
        if (!user || !user.role)
            return false;
        const roleMap = AccessControl.getRoleMap();
        const userInheritedRoles = roleMap[user.role];
        if (user.role === role)
            return false;
        return userInheritedRoles ? userInheritedRoles.has(role) : false;
    }
    /**
     * Checks if user owns a specific resource
     * Compares user ID with resource owner ID
     * @param {typeof User} user - User object with id property
     * @param {number | string} resourceOwnerId - ID of the resource owner
     * @returns {boolean} - True if user owns the resource
     * @example
     * const isOwner = AccessControl.isOwner(user, post.authorId)
     */
    static isOwner(user, resourceOwnerId) {
        if (!user || !user.id || !resourceOwnerId)
            return false;
        return String(user.id) === String(resourceOwnerId);
    }
}
//# sourceMappingURL=AccessControl.js.map