/**
 * Global error handler middleware for catching and handling request errors
 * Redirects to ErrorController routes if they exist, otherwise uses default error responses
 * @param {any} error - Error object
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export function errorHandler(error, req, res, next) {
    console.error('Error:', error);
    if (res.headersSent) {
        return;
    }
    // Determine status code from error or default to 500
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'An unexpected error occurred';
    // Try to redirect to ErrorController route
    const errorRoutes = {
        400: '/error/400',
        401: '/error/401',
        403: '/error/403',
        404: '/error/404',
        409: '/error/409',
        422: '/error/422',
        500: '/error/500'
    };
    const errorRoute = errorRoutes[statusCode];
    if (errorRoute) {
        // Redirect to error route
        res.redirect(errorRoute);
    }
    else {
        // Fallback to default error response
        res.status(statusCode).json({
            error: error.name || 'Error',
            message: message,
            statusCode: statusCode
        });
    }
}
//# sourceMappingURL=errorHandler.js.map