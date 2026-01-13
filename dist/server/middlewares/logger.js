import { HTTP_STATUS } from "../../errors/HttpStatus.js";
import { logger as coreLogger } from "../../logger/index.js";
// Create reverse mapping from status code to name
const STATUS_CODE_TO_NAME = Object.entries(HTTP_STATUS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});
/**
 * Logging middleware that outputs request method, URL, status name, and status code with timestamp
 * Logs to console and writes to log files based on environment (dev.log or prod.log)
 * Uses the Logger class for centralized logging
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();
    // Use original URL (captured at request start) for logging
    // This ensures we log the actual URL the user requested, not internal forwards
    const originalUrl = req.originalUrl || req.url;
    // Log after response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusName = STATUS_CODE_TO_NAME[res.statusCode] || 'UNKNOWN';
        const statusCode = res.statusCode;
        const logMessage = `[${timestamp}] ${req.method} ${originalUrl} ➞ ${statusName} ${statusCode} (${duration}ms)`;
        // Use Logger class with appropriate log level based on status code
        if (statusCode >= 500) {
            coreLogger.error(logMessage);
        }
        else if (statusCode >= 400) {
            coreLogger.warn(logMessage);
        }
        else if (statusCode >= 300) {
            coreLogger.info(logMessage);
        }
        else {
            coreLogger.success(logMessage);
        }
    });
    next();
}
//# sourceMappingURL=logger.js.map