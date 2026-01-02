import 'reflect-metadata';
import {HttpMethod, Middleware} from '../serverTypes';

const ROUTE_PREFIX_KEY = Symbol('routePrefix');
const ROUTES_KEY = Symbol('routes');

/** Route metadata stored for each route method */
export interface RouteMetadata {
    path: string;
    method: HttpMethod;
    methodName: string;
    middlewares?: Middleware[];
    resolve?: Record<string, any>;
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
}

/** Combined route options type */
export type RouteOptions = ClassRouteOptions | MethodRouteOptions;

/**
 * Route decorator for class-level and method-level routing configuration
 * @param {ClassRouteOptions | MethodRouteOptions} options - Route configuration options
 * @returns {ClassDecorator | MethodDecorator} - Appropriate decorator based on options
 */
export function Route(options: ClassRouteOptions): ClassDecorator;
export function Route(options: MethodRouteOptions): MethodDecorator;
export function Route(options: RouteOptions): ClassDecorator | MethodDecorator {
    if ('method' in options && options.method) {
        return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
            const constructor = typeof target === 'function' ? target : target.constructor;

            const routes: RouteMetadata[] = Reflect.getMetadata(ROUTES_KEY, constructor) || [];

            routes.push({
                path: options.path || '',
                method: options.method,
                methodName: propertyKey.toString(),
                middlewares: options.middlewares,
                resolve: options.resolve
            });

            Reflect.defineMetadata(ROUTES_KEY, routes, constructor);
        } as MethodDecorator;
    } else {
        return function (constructor: Function) {
            Reflect.defineMetadata(ROUTE_PREFIX_KEY, options.path || '', constructor);

            if (options.middlewares) {
                Reflect.defineMetadata('routeClassMiddlewares', options.middlewares, constructor);
            }
        } as ClassDecorator;
    }
}

/** HTTP method decorator configuration options */
export interface HttpMethodOptions {
    path?: string;
    middlewares?: Middleware[];
    resolve?: Record<string, any>;
}

/**
 * GET method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Get(options?: string | HttpMethodOptions): MethodDecorator {
    const opts = typeof options === 'string'
        ? { path: options, method: 'GET' as HttpMethod }
        : { path: options?.path || '', method: 'GET' as HttpMethod, middlewares: options?.middlewares, resolve: options?.resolve };
    return Route(opts) as MethodDecorator;
}

/**
 * POST method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Post(options?: string | HttpMethodOptions): MethodDecorator {
    const opts = typeof options === 'string'
        ? { path: options, method: 'POST' as HttpMethod }
        : { path: options?.path || '', method: 'POST' as HttpMethod, middlewares: options?.middlewares, resolve: options?.resolve };
    return Route(opts) as MethodDecorator;
}

/**
 * PUT method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Put(options?: string | HttpMethodOptions): MethodDecorator {
    const opts = typeof options === 'string'
        ? { path: options, method: 'PUT' as HttpMethod }
        : { path: options?.path || '', method: 'PUT' as HttpMethod, middlewares: options?.middlewares, resolve: options?.resolve };
    return Route(opts) as MethodDecorator;
}

/**
 * DELETE method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Delete(options?: string | HttpMethodOptions): MethodDecorator {
    const opts = typeof options === 'string'
        ? { path: options, method: 'DELETE' as HttpMethod }
        : { path: options?.path || '', method: 'DELETE' as HttpMethod, middlewares: options?.middlewares, resolve: options?.resolve };
    return Route(opts) as MethodDecorator;
}

/**
 * PATCH method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Patch(options?: string | HttpMethodOptions): MethodDecorator {
    const opts = typeof options === 'string'
        ? { path: options, method: 'PATCH' as HttpMethod }
        : { path: options?.path || '', method: 'PATCH' as HttpMethod, middlewares: options?.middlewares, resolve: options?.resolve };
    return Route(opts) as MethodDecorator;
}

/**
 * Get route prefix from controller class
 * @param {Function} controller - Controller class
 * @returns {string} - Route prefix path
 */
export function getRoutePrefix(controller: Function): string {
    return Reflect.getMetadata(ROUTE_PREFIX_KEY, controller) || '';
}

/**
 * Get all routes from controller class
 * @param {Function} controller - Controller class
 * @returns {RouteMetadata[]} - Array of route metadata
 */
export function getRoutes(controller: Function): RouteMetadata[] {
    return Reflect.getMetadata(ROUTES_KEY, controller) || [];
}
