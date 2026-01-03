import { IncomingMessage, ServerResponse } from 'http';
import { User } from '../loader/index.js';
/** Supported HTTP methods */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
/** Route methods including middleware */
export type RouteMethod = HttpMethod | 'USE';
/**
 * Next function for middleware chain control
 * @param {any} [err] - Optional error to pass to error handler
 * @returns {void}
 */
export type NextFunction = (err?: any) => void;
/** Route URL parameters extracted from path patterns */
export interface RouteParams {
    [key: string]: string;
}
/** Parsed query string parameters */
export interface ParsedQuery {
    [key: string]: string | string[] | undefined;
}
/** Enhanced HTTP Request with routing capabilities */
export interface Request extends IncomingMessage {
    url: string;
    method: string;
    headers: IncomingMessage['headers'];
    params: RouteParams;
    query: ParsedQuery;
    body: any;
    cookies: {
        [key: string]: string;
    };
    user?: typeof User | Partial<typeof User> | null;
}
/** Enhanced HTTP Response with helper methods */
export interface Response extends ServerResponse {
    statusCode: number;
    setHeader(name: string, value: number | string | readonly string[]): this;
    end(cb?: (() => void) | undefined): this;
    end(chunk: any, cb?: (() => void) | undefined): this;
    end(chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined): this;
    /**
     * Send JSON response
     * @param {any} data - Data to send as JSON
     * @returns {void}
     */
    json: (data: any) => void;
    /**
     * Send response data
     * @param {any} data - Data to send
     * @returns {void}
     */
    send: (data: any) => void;
    /**
     * Set HTTP status code
     * @param {number} code - HTTP status code
     * @returns {Response} - Response instance for chaining
     */
    status: (code: number) => Response;
    /**
     * Redirect to URL
     * @param {string} url - Target URL
     * @returns {void}
     */
    redirect: (url: string) => void;
    /**
     * Set cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {CookieOptions} [options] - Cookie options
     * @returns {Response} - Response instance for chaining
     */
    cookie: (name: string, value: string, options?: CookieOptions) => Response;
    /**
     * Clear cookie
     * @param {string} name - Cookie name
     * @param {CookieOptions} [options] - Cookie options
     * @returns {Response} - Response instance for chaining
     */
    clearCookie: (name: string, options?: CookieOptions) => Response;
}
/** Cookie configuration options */
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    partitioned?: boolean;
}
/**
 * Middleware function signature
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next middleware function
 * @returns {void | Promise<void>}
 */
export type Middleware = (req: Request | any, res: Response, next: NextFunction) => void | Promise<void>;
/**
 * Route handler function signature
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @param {NextFunction} next - Next function in chain
 * @returns {void | Promise<void>}
 */
export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
/** Internal route structure (not exported to avoid conflict with Route decorator) */
interface Route {
    pattern: RegExp;
    paramNames: string[];
    handlers: RouteHandler[];
}
/** Routes registry organized by HTTP method and path */
export type Routes = Record<HttpMethod, Record<string, Route>>;
/** Matched route result */
export interface MatchedRoute {
    handlers: RouteHandler[];
    params: RouteParams;
}
/** CORS middleware configuration */
export interface CorsOptions {
    origin?: string;
    methods?: string;
    headers?: string;
    credentials?: boolean;
}
/** Router interface for modular routing */
export interface IRouter {
    /**
     * Get all routes from this router
     * @returns {RouterRoute[]} - Array of router routes
     */
    getRoutes(): RouterRoute[];
    mountPath?: string;
}
/** Router route definition */
export interface RouterRoute {
    method: RouteMethod;
    path: string;
    handlers: (RouteHandler | IRouter)[];
}
/** Path-specific middleware configuration */
export interface MiddlewareRoute {
    path: string;
    middleware: Middleware;
}
export {};
