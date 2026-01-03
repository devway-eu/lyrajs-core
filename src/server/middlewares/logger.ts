import {NextFunction, Request, Response} from "@/core/server";
import {HTTP_STATUS} from "@/core/errors/HttpStatus";
import {LyraConsole} from "@/core/console/LyraConsole";

// Create reverse mapping from status code to name
const STATUS_CODE_TO_NAME: Record<number, string> = Object.entries(HTTP_STATUS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {} as Record<number, string>);

/**
 * Logging middleware that outputs request method, URL, status name, and status code with timestamp
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export function logger(req: Request, res: Response, next: NextFunction) {
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
        } else if (statusCode >= 400) {
            LyraConsole.warn(logMessage);
        } else if (statusCode >= 300) {
            LyraConsole.info(logMessage);
        } else {
            LyraConsole.success(logMessage);
        }
    });

    next();
}