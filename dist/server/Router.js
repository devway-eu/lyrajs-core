import { getRoutePrefix, getRoutes } from '../server/index.js';
/** Modular router for organizing routes and middlewares */
export class Router {
    constructor() {
        this.routes = [];
    }
    /**
     * Register middleware or nested router
     * @param {string | Middleware | IRouter} pathOrHandler - Path string, middleware, or router
     * @param {Middleware | IRouter} [handler] - Optional middleware or router
     * @returns {this} - Router instance for chaining
     */
    use(pathOrHandler, handler) {
        if (typeof pathOrHandler === 'string') {
            if (handler) {
                this.routes.push({ method: 'USE', path: pathOrHandler, handlers: [handler] });
            }
        }
        else {
            this.routes.push({ method: 'USE', path: '', handlers: [pathOrHandler] });
        }
        return this;
    }
    /**
     * Register GET route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    get(path, ...handlers) {
        this.routes.push({ method: 'GET', path, handlers });
        return this;
    }
    /**
     * Register POST route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    post(path, ...handlers) {
        this.routes.push({ method: 'POST', path, handlers });
        return this;
    }
    /**
     * Register PUT route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    put(path, ...handlers) {
        this.routes.push({ method: 'PUT', path, handlers });
        return this;
    }
    /**
     * Register DELETE route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    delete(path, ...handlers) {
        this.routes.push({ method: 'DELETE', path, handlers });
        return this;
    }
    /**
     * Register PATCH route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Router instance for chaining
     */
    patch(path, ...handlers) {
        this.routes.push({ method: 'PATCH', path, handlers });
        return this;
    }
    /**
     * Get all routes from this router
     * @returns {RouterRoute[]} - Array of router routes
     */
    getRoutes() {
        return this.routes;
    }
    /**
     * Register a controller with decorators
     * @param {Function} controller - Controller class
     * @param {string} [basePath=''] - Base path prefix
     * @returns {this} - Router instance for chaining
     */
    registerController(controller, basePath = '') {
        const prefix = getRoutePrefix(controller);
        const routes = getRoutes(controller);
        routes.forEach(route => {
            const fullPath = basePath + prefix + route.path;
            const methodName = route.methodName;
            const handler = controller[methodName];
            if (!handler || typeof handler !== 'function') {
                throw new Error(`Method ${methodName} not found on controller ${controller.name}. ` +
                    `Make sure the method is static.`);
            }
            switch (route.method) {
                case 'GET':
                    this.get(fullPath, handler);
                    break;
                case 'POST':
                    this.post(fullPath, handler);
                    break;
                case 'PUT':
                    this.put(fullPath, handler);
                    break;
                case 'DELETE':
                    this.delete(fullPath, handler);
                    break;
                case 'PATCH':
                    this.patch(fullPath, handler);
                    break;
            }
        });
        return this;
    }
}
/**
 * Factory function to create a new Router instance
 * @returns {Router} - New router instance
 */
export function createRouter() {
    return new Router();
}
//# sourceMappingURL=Router.js.map