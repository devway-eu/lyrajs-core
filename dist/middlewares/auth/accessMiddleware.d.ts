import { NextFunction, Request, Response } from "../../server/index.js";
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
export declare const accessMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
