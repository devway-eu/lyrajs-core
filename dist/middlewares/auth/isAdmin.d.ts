import { NextFunction, Request, Response } from "../../server/index.js";
/**
 * Admin authorization middleware
 * Verifies that the authenticated user has admin role (ROLE_ADMIN)
 * Returns 401 if not authenticated, 403 if authenticated but not admin
 * @param {Request} req - Express request object with user property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * import { isAdmin } from '@lyra-js/core'
 * app.delete('/users/:id', isAdmin, (req, res) => {
 *   // Only admins can access this
 * })
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
