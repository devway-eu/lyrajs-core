/**
 * OPTIONS request handler middleware
 * Automatically handles CORS preflight requests by returning 204 No Content
 * Sets standard CORS headers to allow cross-origin requests
 * @returns {Middleware} - OPTIONS handler middleware function
 */
export function optionsHandler() {
    return (req, res, next) => {
        if (req.method === "OPTIONS") {
            // Set CORS headers for preflight response
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
            // Return 204 No Content for OPTIONS requests
            res.statusCode = 204;
            res.setHeader("Content-Length", "0");
            res.end();
            return;
        }
        next();
    };
}
//# sourceMappingURL=optionsHandler.js.map