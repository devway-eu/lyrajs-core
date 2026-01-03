import jwt from "jsonwebtoken";
import { ProtectedRouteType } from "../types/index.js";
import { User } from "../loader/index.js";
/**
 * AccessControl class
 * Handles authentication, authorization, and JWT token management
 * Provides role-based access control (RBAC) with role hierarchy support
 * Manages JWT token generation, validation, and refresh
 */
export declare class AccessControl {
    /**
     * Builds a role hierarchy map with inherited roles
     * Recursively resolves role inheritance from security configuration
     * @returns {Record<string, Set<string>>} - Map of roles to their inherited roles
     * @example
     * const roleMap = AccessControl.getRoleMap()
     * // { ROLE_ADMIN: Set(['ROLE_USER', 'ROLE_GUEST']), ... }
     */
    static getRoleMap(): Record<string, Set<string>>;
    /**
     * Checks if a route is protected by access control
     * @param {string} routePath - Route path to check
     * @returns {boolean} - True if route has access control rules
     * @example
     * const isProtected = AccessControl.isRouteProtected('/api/admin')
     */
    static isRouteProtected(routePath: string): boolean;
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
    static canAccessRoute(user: typeof User, route: ProtectedRouteType): Promise<boolean>;
    /**
     * Decodes a JWT token without verification
     * @param {string} token - JWT token to decode
     * @returns {Promise<jwt.JwtPayload>} - Decoded token payload
     * @example
     * const payload = await AccessControl.decodeToken(token)
     */
    static decodeToken(token: string): Promise<jwt.JwtPayload>;
    /**
     * Validates a JWT access token
     * Verifies signature and expiration using configured secret and algorithm
     * @param {string} token - JWT token to validate
     * @returns {jwt.JwtPayload} - Verified token payload
     * @throws {Error} - If token invalid or expired
     * @example
     * const payload = AccessControl.isTokenValid(token)
     */
    static isTokenValid(token: string): jwt.JwtPayload;
    /**
     * Validates a JWT refresh token
     * Verifies signature and expiration using configured refresh secret
     * @param {string} refreshToken - JWT refresh token to validate
     * @throws {Error} - If refresh token invalid or expired
     * @example
     * AccessControl.checkRefreshTokenValid(refreshToken)
     */
    static checkRefreshTokenValid(refreshToken: string): void;
    /**
     * Generates a new JWT access token for a user
     * Includes user ID in payload with configured expiration
     * @param {typeof User} user - User object to generate token for
     * @returns {Promise<string>} - Signed JWT access token
     * @example
     * const token = await AccessControl.getNewToken(user)
     */
    static getNewToken(user: typeof User): Promise<string>;
    /**
     * Generates a new JWT refresh token for a user
     * Includes user ID in payload with longer expiration than access token
     * @param {typeof User} user - User object to generate refresh token for
     * @returns {Promise<string>} - Signed JWT refresh token
     * @example
     * const refreshToken = await AccessControl.getNewRefreshToken(user)
     */
    static getNewRefreshToken(user: typeof User): Promise<string>;
    /**
     * Checks if user has a role higher than the specified role in hierarchy
     * Returns false if user has the exact role (not higher)
     * @param {typeof User} user - User object with role property
     * @param {string} role - Role to compare against
     * @returns {boolean} - True if user's role is higher in hierarchy
     * @example
     * const isHigher = AccessControl.hasRoleHigherThan(user, 'ROLE_USER')
     */
    static hasRoleHigherThan(user: typeof User, role: string): boolean;
    /**
     * Checks if user owns a specific resource
     * Compares user ID with resource owner ID
     * @param {typeof User} user - User object with id property
     * @param {number | string} resourceOwnerId - ID of the resource owner
     * @returns {boolean} - True if user owns the resource
     * @example
     * const isOwner = AccessControl.isOwner(user, post.authorId)
     */
    static isOwner(user: typeof User, resourceOwnerId: number | string): boolean;
}
