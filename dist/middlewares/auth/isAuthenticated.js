export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
//# sourceMappingURL=isAuthenticated.js.map