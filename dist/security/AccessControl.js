import jwt from "jsonwebtoken";
import { SecurityConfig } from "../config/index.js";
import { UnauthorizedException } from "../errors/index.js";
export class AccessControl {
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
    static isRouteProtected(routePath) {
        const securityConfig = new SecurityConfig().getConfig();
        const protectedRoutes = securityConfig.access_control;
        const matchingRoutes = protectedRoutes.filter((protectedRoutes) => protectedRoutes.path.startsWith(routePath));
        return matchingRoutes.length > 0;
    }
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
    static async decodeToken(token) {
        return jwt.decode(token);
    }
    static isTokenValid(token) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.verify(token, securityConfig.jwt.secret_key, { algorithms: [securityConfig.jwt.algorithm] });
    }
    static checkRefreshTokenValid(refreshToken) {
        const securityConfig = new SecurityConfig().getConfig();
        jwt.verify(refreshToken, securityConfig.jwt.secret_key_refresh, { algorithms: [securityConfig.jwt.algorithm] });
    }
    static async getNewToken(user) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key, {
            expiresIn: securityConfig.jwt.token_expiration,
            algorithm: securityConfig.jwt.algorithm
        });
    }
    static async getNewRefreshToken(user) {
        const securityConfig = new SecurityConfig().getConfig();
        return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key_refresh, {
            expiresIn: securityConfig.jwt.refresh_token_expiration,
            algorithm: securityConfig.jwt.algorithm
        });
    }
    static hasRoleHigherThan(user, role) {
        if (!user || !user.role)
            return false;
        const roleMap = AccessControl.getRoleMap();
        const userInheritedRoles = roleMap[user.role];
        if (user.role === role)
            return false;
        return userInheritedRoles ? userInheritedRoles.has(role) : false;
    }
    static isOwner(user, resourceOwnerId) {
        if (!user || !user.id || !resourceOwnerId)
            return false;
        return String(user.id) === String(resourceOwnerId);
    }
}
//# sourceMappingURL=AccessControl.js.map