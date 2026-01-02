import { RouteHandler, RouterRoute, IRouter, Middleware } from '../server/index.js';
/** Modular router for organizing routes and middlewares */
export declare class Router implements IRouter {
    private routes;
    mountPath?: string;
    constructor();
    /**
     * Register middleware or nested router
     * @param {string | Middleware | IRouter} pathOrHandler - Path string, middleware, or router
     * @param {Middleware | IRouter} [handler] - Optional middleware or router
     * @returns {this} - Router instance for chaining
     */
    use(pathOrHandler: string | Middleware | IRouter, handler?: Middleware | IRouter): this;
    /**
     * Register GET route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    get(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register POST route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    post(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register PUT route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    put(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register DELETE route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    delete(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register PATCH route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    patch(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Get all routes from this router
     * @returns {RouterRoute[]} - Array of router routes
     */
    getRoutes(): RouterRoute[];
    /**
     * Register a controller with decorators
     * @param {Function} controller - Controller class
     * @param {string} [basePath=''] - Base path prefix
     * @returns {this} - Router instance for chaining
     */
    registerController(controller: Function, basePath?: string): this;
}
/**
 * Factory function to create a new Router instance
 * @returns {Router} - New router instance
 */
export declare function createRouter(): Router;
