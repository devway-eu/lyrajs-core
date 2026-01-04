import { Request, Response, NextFunction } from "../serverTypes.js";
/**
 * Global error handler middleware for catching and handling request errors
 * Redirects to ErrorController routes if they exist, otherwise uses default error responses
 * @param {any} error - Error object
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export declare function errorHandler(error: any, req: Request, res: Response, next: NextFunction): void;
