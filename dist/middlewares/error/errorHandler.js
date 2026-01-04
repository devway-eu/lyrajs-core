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
export const errorHandler = (error, req, res, _next) => {
    const httpError = error;
    const status = httpError.status || 500;
    logError(httpError, req);
    // Don't send response if headers were already sent
    if (res.headersSent) {
        return;
    }
    // Try to redirect to ErrorController route if it exists
    // Avoid redirect loop - don't redirect if already on an error route
    const isErrorRoute = req.url?.startsWith('/error/') || req.url?.includes('/error/');
    if (!isErrorRoute) {
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
        const errorRoute = errorRoutes[status];
        if (errorRoute) {
            // Redirect to error route (ErrorController will handle the response)
            // Use direct HTTP redirect instead of enhanced res.redirect() to ensure it works
            res.statusCode = 302;
            res.setHeader('Location', errorRoute);
            res.end();
            return;
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