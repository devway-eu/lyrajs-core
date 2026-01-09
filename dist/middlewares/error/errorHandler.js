import { Config } from "../../config/index.js";
import { LyraConsole } from "../../console/LyraConsole.js";
/**
 * Checks if the application is running in production mode
 * @returns {boolean} - True if api_env is 'prod' or 'production'
 * @private
 */
const isProduction = () => {
    const apiEnv = new Config().getParam("api_env");
    return apiEnv === "prod" || apiEnv === "production";
};
/**
 * Gets the appropriate error message for the client
 * Hides internal server error details in production
 * @param {HttpException} error - The error object
 * @returns {string} - Sanitized error message
 * @private
 */
const getErrorMessage = (error) => {
    if (isProduction() && error.status === 500) {
        return "Internal Server Error";
    }
    return error.message || "An error occurred";
};
/**
 * Logs error details to the console
 * Includes request metadata and stack trace in non-production environments
 * @param {HttpException} error - The error object
 * @param {Request} req - Express request object
 * @private
 */
const logError = (error, req) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.url || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = req.socket.remoteAddress || "unknown";
    LyraConsole.error("ERROR", `[${timestamp}] ${method} ${path} - ${error.status} - ${error.message}`, `User-Agent: ${userAgent}`, `IP: ${ip}`);
    if (!isProduction() && error.stack) {
        LyraConsole.error("ERROR", `Stack: ${error.stack}`);
    }
};
/**
 * Global error handler middleware
 * Catches all errors thrown in the application and redirects to ErrorController routes or formats them as JSON responses
 * Logs errors with request context and handles production/development differences
 * @param {HttpExceptionType} error - The error object (HttpException or generic error)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @example
 * import { errorHandler } from '@lyra-js/core'
 * app.use(errorHandler) // Must be last middleware
 */
export const errorHandler = async (error, req, res, _next) => {
    var _a, _b;
    const httpError = error;
    const status = httpError.status || 500;
    logError(httpError, req);
    // Don't send response if headers were already sent
    if (res.headersSent) {
        return;
    }
    // Try to internally forward to ErrorController route if it exists
    // Avoid infinite loop - don't forward if already on an error route
    const isErrorRoute = ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/error/')) || ((_b = req.url) === null || _b === void 0 ? void 0 : _b.includes('/error/'));
    if (!isErrorRoute && req._server) {
        // Get base path from config (e.g., '/api')
        let basePath = '';
        try {
            basePath = new Config().get("router.base_path") || '';
        }
        catch (error) {
            basePath = '';
        }
        const errorRoutes = {
            400: `${basePath}/error/400`,
            401: `${basePath}/error/401`,
            403: `${basePath}/error/403`,
            404: `${basePath}/error/404`,
            409: `${basePath}/error/409`,
            422: `${basePath}/error/422`,
            500: `${basePath}/error/500`
        };
        const errorPath = errorRoutes[status];
        if (errorPath) {
            // Internally forward to error route (preserves original URL for logging)
            const server = req._server;
            const errorRoute = server.matchRoute('GET', errorPath);
            if (errorRoute) {
                req.params = errorRoute.params;
                res.statusCode = status;
                // Execute error route handlers
                try {
                    await server.executeHandlers(errorRoute.handlers, req, res);
                    return;
                }
                catch (handlerError) {
                    // If error handler itself fails, fall through to JSON response
                    LyraConsole.error('ERROR', 'Error handler failed:', (handlerError === null || handlerError === void 0 ? void 0 : handlerError.message) || String(handlerError));
                }
            }
        }
    }
    // Fallback to JSON response if no error route exists or redirect is not available
    const errorResponse = {
        status,
        message: getErrorMessage(httpError),
        path: req.url || "unknown",
        timestamp: new Date().toISOString()
    };
    const requestId = req.headers["x-request-id"];
    if (requestId) {
        errorResponse.requestId = requestId;
    }
    res.status(status).json(errorResponse);
};
//# sourceMappingURL=errorHandler.js.map