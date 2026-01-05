import * as fs from "node:fs"
import * as path from "node:path"
import * as process from "node:process"

import {NextFunction, Request, Response} from "@/core/server";
import {HTTP_STATUS} from "@/core/errors/HttpStatus";
import {LyraConsole} from "@/core/console/LyraConsole";

// Create reverse mapping from status code to name
const STATUS_CODE_TO_NAME: Record<number, string> = Object.entries(HTTP_STATUS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {} as Record<number, string>);

/**
 * Writes a log message to the appropriate log file based on environment
 * Creates the logs directory and log file if they don't exist
 * @param {string} message - Log message to write
 * @returns {void}
 */
function writeToLogFile(message: string): void {
    try {
        const env = process.env.NODE_ENV || "dev"
        const logDir = path.join(process.cwd(), "logs")
        const logFile = env === "production" || env === "prod" ? "prod.log" : "dev.log"
        const logPath = path.join(logDir, logFile)

        // Ensure logs directory exists
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true })
        }

        // Ensure log file exists
        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, "", "utf8")
        }

        // Append log message with newline
        fs.appendFileSync(logPath, message + "\n", "utf8")
    } catch (error) {
        // If file logging fails, log error to console but don't crash the app
        console.error("Failed to write to log file:", error)
    }
}

/**
 * Logging middleware that outputs request method, URL, status name, and status code with timestamp
 * Logs to console and writes to log files based on environment (dev.log or prod.log)
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

        // Write to log file
        writeToLogFile(logMessage)

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