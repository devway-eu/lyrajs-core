import 'reflect-metadata';
import * as http from "http";
import { HttpMethod, RouteHandler, Middleware, NextFunction, Request, Response, RouteParams, ParsedQuery, MatchedRoute, IRouter } from '../server/index.js';
/** Main HTTP server class with routing, middleware, and dependency injection */
declare class LyraServer {
    private routes;
    private middlewares;
    private diContainer;
    private basePath;
    private settings;
    private controllersLoaded;
    private servicesRegistered;
    constructor();
    /**
     * Set application setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {this} - Server instance for chaining
     * @example
     * app.setSetting('trust proxy', true)
     * app.setSetting('request max size', '50mb')
     * app.setSetting('ssr', { engine: 'ejs', templates: './templates' })
     */
    setSetting(key: string, value: any): this;
    /**
     * Get application setting
     * @param {string} key - Setting key
     * @returns {any} - Setting value
     */
    getSetting(key: string): any;
    /**
     * Load controllers asynchronously
     * @returns {Promise<void>}
     */
    private loadControllersAsync;
    /**
     * Register middleware or router
     * @param {string | Middleware | IRouter} pathOrHandler - Path, middleware, or router
     * @param {Middleware | IRouter} [handler] - Optional middleware or router
     * @returns {this} - Server instance for chaining
     */
    use(pathOrHandler: string | Middleware | IRouter, handler?: Middleware | IRouter): this;
    private isRouter;
    private mountRouter;
    /**
     * Register a controller class with decorators
     * @param {Function} controller - Controller class to register
     * @param {string} [basePath=''] - Base path prefix
     * @returns {this} - Server instance for chaining
     */
    registerController(controller: Function, basePath?: string): this;
    getControllersAsync(controllersPath?: string): Promise<void>;
    getControllers(controllersPath?: string): this;
    /**
     * Register a service or repository - Works with single items or arrays
     *
     * For a single class:
     * @example
     * app.register(UserService);
     *
     * For multiple classes (bulk registration):
     * @example
     * app.register([UserService, EmailService, OrderService]);
     * app.register([UserRepository, OrderRepository]);
     *
     * For instances (third-party services, auto-detects name from constructor):
     * @example
     * const stripe = new Stripe(process.env.STRIPE_KEY);
     * app.register(stripe);  // Auto-registered as 'stripe'
     *
     * // Or provide custom name:
     * app.register(stripe, 'stripeService');
     *
     * // Then access in controllers/services:
     * this.stripe.charges.create(...)
     */
    register<T>(classOrInstanceOrArray: (new (...args: any[]) => T) | T | Array<new (...args: any[]) => any>, name?: string, type?: 'service' | 'repository'): this;
    /**
     * Extract property name from instance constructor
     * Stripe instance -> 'stripe', Redis instance -> 'redis'
     */
    private getPropertyNameFromInstance;
    /**
     * Auto-discover and register services and repositories from directories
     * @param {object} [options] - Registration options
     * @param {string} [options.services] - Services directory path (default: 'src/services')
     * @param {string} [options.repositories] - Repositories directory path (default: 'src/repositories')
     * @returns {Promise<this>} - Server instance for chaining
     * @example
     * await app.autoRegister();
     * await app.autoRegister({ services: 'src/services', repositories: 'src/repositories' });
     */
    autoRegister(options?: {
        services?: string;
        repositories?: string;
    }): Promise<this>;
    /**
     * Internal method to discover and register injectables from a directory
     * Convention-based: All classes in src/services are services, all in src/repositories are repositories
     * Decorators are optional but can be used for explicit typing
     */
    private autoDiscoverInjectables;
    /**
     * Recursively get all files with specific extensions from a directory
     */
    private getAllFiles;
    /**
     * Register GET route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    get(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register POST route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    post(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register PUT route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    put(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register DELETE route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    delete(path: string, ...handlers: RouteHandler[]): this;
    /**
     * Register PATCH route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    patch(path: string, ...handlers: RouteHandler[]): this;
    addRoute(method: HttpMethod, path: string, handlers: RouteHandler[], parserType?: 'json' | 'xml' | 'urlencoded' | 'raw'): void;
    pathToRegex(path: string): RegExp;
    extractParamNames(path: string): string[];
    matchRoute(method: HttpMethod, pathname: string): MatchedRoute | null;
    private parseSizeToBytes;
    parseBody(req: Request, parserType?: 'json' | 'xml' | 'urlencoded' | 'raw'): Promise<any>;
    parseCookies(req: Request): {
        [key: string]: string;
    };
    createRequest(req: Request, params: RouteParams, query: ParsedQuery): Request;
    createResponse(res: Response): Response;
    private matchMiddlewarePath;
    /**
     * Wrap a handler with automatic parameter resolution
     * Returns a new handler that resolves parameters before calling the original
     */
    private wrapHandlerWithParameterResolution;
    /**
     * Extract parameter names from a function signature
     * Works with compiled TypeScript code
     */
    private getParameterNames;
    /**
     * Resolve route handler parameters automatically
     * Supports both @Param decorators and route-level resolve configuration
     *
     * @example Using route-level resolve (recommended for compiled code):
     * @Get({ path: '/:user', resolve: { user: User } })
     * async getUser(req, res, next, user) { ... }
     *
     * @example Using @Param decorator (legacy):
     * @Get({ path: '/:userId' })
     * async getUser(req, res, @Param('userId', User) user) { ... }
     */
    private resolveParameters;
    /**
     * Find repository for a given entity type
     * User type → looks for userRepository
     */
    private findRepositoryForEntity;
    executeMiddlewares(req: Request, res: Response, pathname: string): Promise<void>;
    private executeHandlers;
    handleRequest(req: Request, res: Response, next?: NextFunction): Promise<void>;
    /**
     * Start HTTP server on specified port
     * @param {number|string} port - Port number to listen on
     * @param {() => void} [callback] - Optional callback when server starts
     * @returns {Promise<http.Server>} - HTTP server instance
     */
    listen(port: number | string, callback?: () => void): Promise<http.Server>;
}
export declare function createServer(): LyraServer;
export {};
