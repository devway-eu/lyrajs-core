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
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user;
    if (user.role !== "ROLE_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};
//# sourceMappingURL=isAdmin.js.map