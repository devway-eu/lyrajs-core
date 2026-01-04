import 'reflect-metadata';
import { HttpMethod, Middleware } from '../serverTypes.js';
/** Parser type for request body parsing */
export type ParserType = 'json' | 'xml' | 'urlencoded' | 'raw';
/** Route metadata stored for each route method */
export interface RouteMetadata {
    path: string;
    method: HttpMethod;
    methodName: string;
    middlewares?: Middleware[];
    resolve?: Record<string, any>;
    parserType?: ParserType;
}
/** Route decorator options for class-level routing */
export interface ClassRouteOptions {
    path?: string;
    middlewares?: Middleware[];
}
/** Route decorator options for method-level routing */
export interface MethodRouteOptions {
    path?: string;
    method: HttpMethod;
    middlewares?: Middleware[];
    resolve?: Record<string, any>;
    parserType?: ParserType;
}
/** Combined route options type */
export type RouteOptions = ClassRouteOptions | MethodRouteOptions;
/**
 * Route decorator for class-level and method-level routing configuration
 * @param {ClassRouteOptions | MethodRouteOptions} options - Route configuration options
 * @returns {ClassDecorator | MethodDecorator} - Appropriate decorator based on options
 */
export declare function Route(options: ClassRouteOptions): ClassDecorator;
export declare function Route(options: MethodRouteOptions): MethodDecorator;
/** HTTP method decorator configuration options */
export interface HttpMethodOptions {
    path?: string;
    middlewares?: Middleware[];
    resolve?: Record<string, any>;
    parserType?: ParserType;
}
/**
 * GET method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export declare function Get(options?: string | HttpMethodOptions): MethodDecorator;
/**
 * POST method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export declare function Post(options?: string | HttpMethodOptions): MethodDecorator;
/**
 * PUT method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export declare function Put(options?: string | HttpMethodOptions): MethodDecorator;
/**
 * DELETE method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export declare function Delete(options?: string | HttpMethodOptions): MethodDecorator;
/**
 * PATCH method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export declare function Patch(options?: string | HttpMethodOptions): MethodDecorator;
/**
 * Get route prefix from controller class
 * @param {Function} controller - Controller class
 * @returns {string} - Route prefix path
 */
export declare function getRoutePrefix(controller: Function): string;
/**
 * Get all routes from controller class
 * @param {Function} controller - Controller class
 * @returns {RouteMetadata[]} - Array of route metadata
 */
export declare function getRoutes(controller: Function): RouteMetadata[];
