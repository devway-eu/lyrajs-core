import { HTTP_STATUS } from "../../errors/HttpStatus.js";
import { LyraConsole } from "../../console/LyraConsole.js";
// Create reverse mapping from status code to name
const STATUS_CODE_TO_NAME = Object.entries(HTTP_STATUS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});
/**
 * Logging middleware that outputs request method, URL, status name, and status code with timestamp
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();
    // Log after response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusName = STATUS_CODE_TO_NAME[res.statusCode] || 'UNKNOWN';
        const statusCode = res.statusCode;
        const logMessage = `[${timestamp}] ${req.method} ${req.url} ➞ ${statusName} ${statusCode} (${duration}ms)`;
        // Use appropriate log level based on status code
        if (statusCode >= 500) {
            LyraConsole.error(logMessage);
        }
        else if (statusCode >= 400) {
            LyraConsole.warn(logMessage);
        }
        else if (statusCode >= 300) {
            LyraConsole.info(logMessage);
        }
        else {
            LyraConsole.success(logMessage);
        }
    });
    next();
}
//# sourceMappingURL=logger.js.map