import { NextFunction, Request, Response } from "../../server/index.js";
import { HttpExceptionType } from "../../types/Errors.js";
/**
 * Global error handler middleware
 * Catches all errors thrown in the application and formats them as JSON responses
 * Logs errors with request context and handles production/development differences
 * @param {HttpExceptionType} error - The error object (HttpException or generic error)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @example
 * import { errorHandler } from '@lyra-js/core'
 * app.use(errorHandler) // Must be last middleware
 */
export declare const errorHandler: (error: HttpExceptionType, req: Request, res: Response, _next?: NextFunction) => void;
