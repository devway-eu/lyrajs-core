/**
 * Authentication middleware
 * Verifies that a user is authenticated by checking for req.user
 * Returns 401 Unauthorized if user is not authenticated
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * import { isAuthenticated } from '@lyra-js/core'
 * app.get('/protected', isAuthenticated, (req, res) => {
 *   res.json({ user: req.user })
 * })
 */
export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
//# sourceMappingURL=isAuthenticated.js.map