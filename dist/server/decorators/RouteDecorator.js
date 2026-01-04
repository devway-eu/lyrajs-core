import 'reflect-metadata';
const ROUTE_PREFIX_KEY = Symbol('routePrefix');
const ROUTES_KEY = Symbol('routes');
export function Route(options) {
    if ('method' in options && options.method) {
        return function (target, propertyKey, descriptor) {
            const constructor = typeof target === 'function' ? target : target.constructor;
            const routes = Reflect.getMetadata(ROUTES_KEY, constructor) || [];
            routes.push({
                path: options.path || '',
                method: options.method,
                methodName: propertyKey.toString(),
                middlewares: options.middlewares,
                resolve: options.resolve,
                parserType: options.parserType
            });
            Reflect.defineMetadata(ROUTES_KEY, routes, constructor);
        };
    }
    else {
        return function (constructor) {
            Reflect.defineMetadata(ROUTE_PREFIX_KEY, options.path || '', constructor);
            if (options.middlewares) {
                Reflect.defineMetadata('routeClassMiddlewares', options.middlewares, constructor);
            }
        };
    }
}
/**
 * GET method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Get(options) {
    const opts = typeof options === 'string'
        ? { path: options, method: 'GET' }
        : { path: options?.path || '', method: 'GET', middlewares: options?.middlewares, resolve: options?.resolve, parserType: options?.parserType };
    return Route(opts);
}
/**
 * POST method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Post(options) {
    const opts = typeof options === 'string'
        ? { path: options, method: 'POST' }
        : { path: options?.path || '', method: 'POST', middlewares: options?.middlewares, resolve: options?.resolve, parserType: options?.parserType };
    return Route(opts);
}
/**
 * PUT method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Put(options) {
    const opts = typeof options === 'string'
        ? { path: options, method: 'PUT' }
        : { path: options?.path || '', method: 'PUT', middlewares: options?.middlewares, resolve: options?.resolve, parserType: options?.parserType };
    return Route(opts);
}
/**
 * DELETE method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Delete(options) {
    const opts = typeof options === 'string'
        ? { path: options, method: 'DELETE' }
        : { path: options?.path || '', method: 'DELETE', middlewares: options?.middlewares, resolve: options?.resolve, parserType: options?.parserType };
    return Route(opts);
}
/**
 * PATCH method decorator
 * @param {string | HttpMethodOptions} [options] - Path string or configuration object
 * @returns {MethodDecorator} - Method decorator
 */
export function Patch(options) {
    const opts = typeof options === 'string'
        ? { path: options, method: 'PATCH' }
        : { path: options?.path || '', method: 'PATCH', middlewares: options?.middlewares, resolve: options?.resolve, parserType: options?.parserType };
    return Route(opts);
}
/**
 * Get route prefix from controller class
 * @param {Function} controller - Controller class
 * @returns {string} - Route prefix path
 */
export function getRoutePrefix(controller) {
    return Reflect.getMetadata(ROUTE_PREFIX_KEY, controller) || '';
}
/**
 * Get all routes from controller class
 * @param {Function} controller - Controller class
 * @returns {RouteMetadata[]} - Array of route metadata
 */
export function getRoutes(controller) {
    return Reflect.getMetadata(ROUTES_KEY, controller) || [];
}
//# sourceMappingURL=RouteDecorator.js.map