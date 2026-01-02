import {NextFunction, Request, Response} from "../serverTypes";

/**
 * Logging middleware that outputs request method and URL with timestamp
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void}
 */
export function logger(req: Request, res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
}