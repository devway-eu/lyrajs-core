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