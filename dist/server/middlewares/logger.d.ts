import { NextFunction, Request, Response } from "../../server/index.js";
/**
 * Logging middleware that outputs request method, URL, status name, and status code with timestamp
 * Logs to console and writes to log files based on environment (dev.log or prod.log)
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export declare function logger(req: Request, res: Response, next: NextFunction): void;
