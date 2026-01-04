import 'reflect-metadata';
import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import { errorHandler, httpRequestMiddleware, accessMiddleware } from "@/core/middlewares"
import { Config } from "@/core/config"
import {
    Controller,
    DIContainer,
    getParamMetadata,
    ParamMetadata,
    getRoutePrefix,
    getRoutes,
    HttpMethod,
    logger,
    RouteHandler,
    Middleware,
    NextFunction,
    Routes,
    Request,
    Response,
    RouteParams,
    ParsedQuery,
    MatchedRoute,
    IRouter,
    MiddlewareRoute,
    CookieOptions
} from '@/core/server';
import { TemplateRenderer, SSRConfig } from '@/core/ssr';
import { parseXML, serializeToXML } from './xmlParser';

/** Main HTTP server class with routing, middleware, and dependency injection */
class LyraServer {

    private routes: Routes;
    private middlewares: MiddlewareRoute[];
    private diContainer: DIContainer;
    private basePath: string;
    private settings: Map<string, any>;

    private controllersLoaded: boolean = false;
    private servicesRegistered: boolean = false;

    constructor() {
        this.diContainer = new DIContainer();
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
            PATCH: {}
        };
        this.middlewares = [];
        this.settings = new Map();

        // Read base path from config
        try {
            this.basePath = new Config().get("router.base_path") || '';
        } catch (error) {
            this.basePath = '';
        }

        // Default settings
        this.settings.set('trust proxy', false);
        this.settings.set('request max size', '10mb');

        // Register global middlewares (run before routing)
        this.middlewares.push({ path: '', middleware: logger });
        this.middlewares.push({ path: '', middleware: httpRequestMiddleware as Middleware });
        this.middlewares.push({ path: '', middleware: accessMiddleware as Middleware });
    }

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
    setSetting(key: string, value: any): this {
        this.settings.set(key, value);

        // Configure SSR if setting is 'ssr'
        if (key === 'ssr') {
            const renderer = TemplateRenderer.getInstance();
            renderer.configure(value as SSRConfig);
        }

        return this;
    }

    /**
     * Get application setting
     * @param {string} key - Setting key
     * @returns {any} - Setting value
     */
    getSetting(key: string): any {
        return this.settings.get(key);
    }

    /**
     * Load controllers asynchronously
     * @returns {Promise<void>}
     */
    private async loadControllersAsync(): Promise<void> {
        try {
            await this.getControllersAsync();
            this.controllersLoaded = true;
        } catch (error) {
            console.error('Error loading controllers:', error);
        }
    }

    /**
     * Register middleware or router
     * @param {string | Middleware | IRouter} pathOrHandler - Path, middleware, or router
     * @param {Middleware | IRouter} [handler] - Optional middleware or router
     * @returns {this} - Server instance for chaining
     */
    use(pathOrHandler: string | Middleware | IRouter, handler?: Middleware | IRouter): this {
        if (typeof pathOrHandler === 'string') {
            // Path with handler: use('/path', handler) or use('/path', router)
            if (handler) {
                if (this.isRouter(handler)) {
                    // Router with path - prepend basePath
                    this.mountRouter(this.basePath + pathOrHandler, handler);
                } else {
                    // Path-specific middleware - prepend basePath
                    this.middlewares.push({ path: this.basePath + pathOrHandler, middleware: handler as Middleware });
                }
            }
        } else {
            // No path, just middleware/router: use(middleware) or use(router)
            if (this.isRouter(pathOrHandler)) {
                // Router without explicit path - use basePath
                this.mountRouter(this.basePath, pathOrHandler);
            } else {
                // Global middleware - no basePath (matches all)
                this.middlewares.push({ path: '', middleware: pathOrHandler as Middleware });
            }
        }
        return this;
    }

    // Check if handler is a router
    private isRouter(handler: any): handler is IRouter {
        return handler && typeof handler.getRoutes === 'function';
    }

    // Mount a router with optional path prefix
    private mountRouter(basePath: string, router: IRouter): void {
        const routes = router.getRoutes();

        routes.forEach(route => {
            const fullPath = basePath + route.path;

            route.handlers.forEach(handler => {
                if (this.isRouter(handler)) {
                    // Nested router - recursively mount it
                    this.mountRouter(fullPath, handler);
                } else {
                    // Regular handler
                    if (route.method === 'USE') {
                        // Middleware - add with the correct path prefix
                        // If route.path is empty, use basePath, otherwise combine them
                        const middlewarePath = route.path ? fullPath : basePath;
                        this.middlewares.push({ path: middlewarePath, middleware: handler as Middleware });
                    } else {
                        // Route handler
                        this.addRoute(route.method as HttpMethod, fullPath, [handler as RouteHandler]);
                    }
                }
            });
        });
    }

    /**
     * Register a controller class with decorators
     * @param {Function} controller - Controller class to register
     * @param {string} [basePath=''] - Base path prefix
     * @returns {this} - Server instance for chaining
     */
    registerController(controller: Function, basePath: string = ''): this {
        const prefix = getRoutePrefix(controller);
        const routes = getRoutes(controller);


        // Get class-level middlewares if any
        const classMiddlewares: Middleware[] = Reflect.getMetadata('routeClassMiddlewares', controller) || [];

        // Check if controller extends Controller base class (for DI support)
        const extendsController = this.diContainer.extendsClass(controller, Controller);
        let controllerInstance: any = null;

        if (extendsController) {
            // Create controller instance with DI
            controllerInstance = new (controller as any)();

            // Inject services and repositories
            this.diContainer.injectIntoController(controllerInstance);
        }

        routes.forEach(route => {
            const fullPath = this.basePath + basePath + prefix + route.path;
            const methodName = route.methodName;

            let handler: RouteHandler;

            if (controllerInstance) {
                // Instance method (DI-enabled controller)
                const originalHandler = controllerInstance[methodName];

                if (!originalHandler || typeof originalHandler !== 'function') {
                    throw new Error(
                        `Method ${methodName} not found on controller ${controller.name}.`
                    );
                }

                // Wrap handler with parameter resolution
                handler = this.wrapHandlerWithParameterResolution(
                    originalHandler,
                    controllerInstance,
                    methodName
                );
            } else {
                // Static method (traditional controller)
                handler = (controller as any)[methodName];

                if (!handler || typeof handler !== 'function') {
                    throw new Error(
                        `Method ${methodName} not found on controller ${controller.name}. ` +
                        `Make sure the method is static.`
                    );
                }
            }

            // Combine class middlewares, route middlewares, and the handler
            const handlers: RouteHandler[] = [
                ...classMiddlewares as RouteHandler[],
                ...(route.middlewares || []) as RouteHandler[],
                handler as RouteHandler
            ];

            // Register the route based on HTTP method
            this.addRoute(route.method, fullPath, handlers, route.parserType);
        });

        return this;
    }

    // Async version - Automatically discover and register controllers from a directory
    async getControllersAsync(controllersPath: string = 'src/controller'): Promise<void> {
        // Resolve the absolute path
        const absolutePath = path.resolve(process.cwd(), controllersPath);

        if (!fs.existsSync(absolutePath)) {
            return;
        }

        // Read all files in the directory
        const files = fs.readdirSync(absolutePath);

        for (const file of files) {
            // Only process .ts and .js files
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                const filePath = path.join(absolutePath, file);

                try {
                    // Import the controller file using dynamic import for ES modules
                    const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
                    const module = await import(fileUrl);

                    // Find all exported classes in the module
                    for (const key of Object.keys(module)) {
                        const exportedItem = module[key];

                        // Check if it's a class/function (potential controller)
                        if (typeof exportedItem === 'function') {
                            // Check if it has route metadata (decorated controller)
                            const routes = getRoutes(exportedItem);

                            if (routes && routes.length > 0) {
                                this.registerController(exportedItem);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error loading controller from ${file}:`, error);
                }
            }
        }
    }

    // Synchronous version (kept for backward compatibility)
    getControllers(controllersPath: string = 'src/controller'): this {
        return this;
    }

    // ============================================
    // Dependency Injection Methods
    // ============================================

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
    register<T>(
        classOrInstanceOrArray: (new (...args: any[]) => T) | T | Array<new (...args: any[]) => any>,
        name?: string,
        type?: 'service' | 'repository'
    ): this {
        // Check if it's an array - bulk registration
        if (Array.isArray(classOrInstanceOrArray)) {
            for (const item of classOrInstanceOrArray) {
                if (typeof item === 'function' && item.prototype) {
                    // It's a class - register it
                    this.diContainer.register(item);
                } else {
                    throw new Error('Array registration only supports classes. Use individual registration for instances.');
                }
            }
            return this;
        }

        // Single item registration
        // Check if it's a class (constructor function) or an instance
        if (typeof classOrInstanceOrArray === 'function' && classOrInstanceOrArray.prototype) {
            // It's a class - register it normally
            this.diContainer.register(classOrInstanceOrArray as new (...args: any[]) => T);
        } else {
            // It's an instance - auto-detect name from constructor if not provided
            const propertyName = name || this.getPropertyNameFromInstance(classOrInstanceOrArray);
            this.diContainer.registerInstance(propertyName, classOrInstanceOrArray, type || 'service');
        }
        return this;
    }

    /**
     * Extract property name from instance constructor
     * Stripe instance -> 'stripe', Redis instance -> 'redis'
     */
    private getPropertyNameFromInstance(instance: any): string {
        const constructorName = instance.constructor?.name;
        if (!constructorName || constructorName === 'Object') {
            throw new Error(
                'Cannot auto-detect property name for instance. ' +
                'Please provide a name parameter: app.register(instance, "propertyName")'
            );
        }
        // Convert to camelCase: Stripe -> stripe, Redis -> redis
        return constructorName.charAt(0).toLowerCase() + constructorName.slice(1);
    }

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
    async autoRegister(options?: {
        services?: string;
        repositories?: string;
    }): Promise<this> {
        const servicesPath = options?.services || 'src/services';
        const repositoriesPath = options?.repositories || 'src/repository';

        // Auto-discover and register services
        await this.autoDiscoverInjectables(servicesPath, 'service');

        // Auto-discover and register repositories
        await this.autoDiscoverInjectables(repositoriesPath, 'repository');

        // Inject dependencies into all registered services and repositories
        this.diContainer.injectAll();

        return this;
    }

    /**
     * Internal method to discover and register injectables from a directory
     * Convention-based: All classes in src/services are services, all in src/repositories are repositories
     * Decorators are optional but can be used for explicit typing
     */
    private async autoDiscoverInjectables(dirPath: string, expectedType: 'service' | 'repository'): Promise<void> {
        const absolutePath = path.resolve(process.cwd(), dirPath);

        // Check if directory exists
        if (!fs.existsSync(absolutePath)) {
            return;
        }

        // Read all files in the directory recursively
        const files = this.getAllFiles(absolutePath, ['.ts', '.js']);

        for (const file of files) {
            try {
                // Import the file using dynamic import for ES modules
                const fileUrl = `file:///${file.replace(/\\/g, '/')}`;
                const module = await import(fileUrl);

                // Find all exported classes in the module
                for (const key of Object.keys(module)) {
                    const exportedItem = module[key];

                    // Check if it's a class/function (potential injectable)
                    if (typeof exportedItem === 'function') {
                        // Check if it has explicit injectable type metadata (from decorators)
                        const injectableType = Reflect.getMetadata('injectableType', exportedItem);

                        // Register if:
                        // 1. It has explicit decorator matching the expected type, OR
                        // 2. No decorator but it's a class (convention-based)
                        if (injectableType === expectedType || !injectableType) {
                            // For convention-based registration, set the metadata
                            if (!injectableType) {
                                Reflect.defineMetadata('injectable', true, exportedItem);
                                Reflect.defineMetadata('injectableType', expectedType, exportedItem);
                            }
                            this.diContainer.register(exportedItem);
                        }
                    }
                }
            } catch (error) {
                // Silently skip files that can't be imported
            }
        }
    }

    /**
     * Recursively get all files with specific extensions from a directory
     */
    private getAllFiles(dirPath: string, extensions: string[]): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dirPath)) {
            return files;
        }

        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Recursively get files from subdirectories
                files.push(...this.getAllFiles(fullPath, extensions));
            } else if (stat.isFile()) {
                // Check if file has one of the allowed extensions
                const hasValidExtension = extensions.some(ext => item.endsWith(ext));
                if (hasValidExtension) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }

    // ============================================
    // Route registration methods
    // ============================================
    /**
     * Register GET route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    get(path: string, ...handlers: RouteHandler[]): this {
        this.addRoute('GET', path, handlers);
        return this;
    }

    /**
     * Register POST route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    post(path: string, ...handlers: RouteHandler[]): this {
        this.addRoute('POST', path, handlers);
        return this;
    }

    /**
     * Register PUT route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    put(path: string, ...handlers: RouteHandler[]): this {
        this.addRoute('PUT', path, handlers);
        return this;
    }

    /**
     * Register DELETE route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    delete(path: string, ...handlers: RouteHandler[]): this {
        this.addRoute('DELETE', path, handlers);
        return this;
    }

    /**
     * Register PATCH route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    patch(path: string, ...handlers: RouteHandler[]): this {
        this.addRoute('PATCH', path, handlers);
        return this;
    }

    addRoute(method: HttpMethod, path: string, handlers: RouteHandler[], parserType?: 'json' | 'xml' | 'urlencoded' | 'raw'): void {
        const pattern = this.pathToRegex(path);
        const paramNames = this.extractParamNames(path);

        this.routes[method][path] = {
            pattern,
            paramNames,
            handlers,
            parserType
        };
    }

    // Convert route path to regex (e.g., /users/:id -> regex)
    pathToRegex(path: string): RegExp {
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    // Extract parameter names from path
    extractParamNames(path: string): string[] {
        const matches = path.match(/:(\w+)/g);
        return matches ? matches.map(m => m.slice(1)) : [];
    }

    // Match incoming request to route
    matchRoute(method: HttpMethod, pathname: string): MatchedRoute | null {
        const methodRoutes = this.routes[method];

        for (const [path, route] of Object.entries(methodRoutes)) {
            const match = pathname.match(route.pattern);

            if (match) {
                const params: RouteParams = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });

                return { handlers: route.handlers, params, parserType: route.parserType };
            }
        }

        return null;
    }

    // Parse size string (e.g., "10mb", "1kb") to bytes
    private parseSizeToBytes(size: string): number {
        const units: { [key: string]: number } = {
            b: 1,
            kb: 1024,
            mb: 1024 * 1024,
            gb: 1024 * 1024 * 1024
        };

        const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
        if (!match) return 10 * 1024 * 1024; // Default 10MB

        const value = parseFloat(match[1]);
        const unit = match[2];

        return value * (units[unit] || 1);
    }

    // Parse request body
    async parseBody(req: Request, parserType?: 'json' | 'xml' | 'urlencoded' | 'raw'): Promise<any> {
        return new Promise((resolve, reject) => {
            let body = '';
            let receivedBytes = 0;
            const maxSize = this.parseSizeToBytes(this.getSetting('request max size') || '10mb');

            req.on('data', chunk => {
                receivedBytes += chunk.length;

                // Check if size limit exceeded
                if (receivedBytes > maxSize) {
                    req.removeAllListeners();
                    reject(new Error(`Request body too large. Maximum size is ${this.getSetting('request max size')}`));
                    return;
                }

                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const contentType = req.headers['content-type'] || '';
                    const globalParserType = this.getSetting('parserType') || 'json';
                    const effectiveParserType = parserType || globalParserType;

                    // Determine parser type from content-type header if not explicitly set
                    let detectedType = effectiveParserType;
                    if (!parserType && !this.getSetting('parserType')) {
                        if (contentType.includes('application/json')) {
                            detectedType = 'json';
                        } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
                            detectedType = 'xml';
                        } else if (contentType.includes('application/x-www-form-urlencoded')) {
                            detectedType = 'urlencoded';
                        }
                    }

                    // Parse based on parser type
                    switch (detectedType) {
                        case 'json':
                            resolve(body ? JSON.parse(body) : {});
                            break;
                        case 'xml':
                            resolve(body ? parseXML(body) : {});
                            break;
                        case 'urlencoded':
                            const parsed: any = {};
                            if (body) {
                                body.split('&').forEach(pair => {
                                    const [key, value] = pair.split('=');
                                    parsed[decodeURIComponent(key)] = decodeURIComponent(value);
                                });
                            }
                            resolve(parsed);
                            break;
                        case 'raw':
                        default:
                            resolve(body);
                            break;
                    }
                } catch (error) {
                    reject(error);
                }
            });

            req.on('error', reject);
        });
    }

    // Parse cookies from request headers
    parseCookies(req: Request): { [key: string]: string } {
        const cookieHeader = req.headers.cookie;
        const cookies: { [key: string]: string } = {};

        if (!cookieHeader) {
            return cookies;
        }

        // Parse cookie header: "name1=value1; name2=value2"
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            if (parts.length === 2) {
                const name = decodeURIComponent(parts[0]);
                const value = decodeURIComponent(parts[1]);
                cookies[name] = value;
            }
        });

        return cookies;
    }

    // Enhanced request object
    createRequest(req: Request, params: RouteParams, query: ParsedQuery): Request {
        req.params = params;
        req.query = query;

        return req;
    }

    // Enhanced response object
    createResponse(res: Response): Response {
        // JSON response
        res.json = (data) => {
            if (res.headersSent) {
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        };

        // XML response
        res.xml = (data) => {
            if (res.headersSent) {
                return;
            }
            res.setHeader('Content-Type', 'application/xml');
            res.end(serializeToXML(data));
        };

        // HTML response
        res.html = (data) => {
            if (res.headersSent) {
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(String(data));
        };

        // Text response
        res.text = (data) => {
            if (res.headersSent) {
                return;
            }
            res.setHeader('Content-Type', 'text/plain');
            res.end(String(data));
        };

        // Send response
        res.send = (data) => {
            if (res.headersSent) {
                return;
            }
            if (typeof data === 'object') {
                res.json(data);
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.end(String(data));
            }
        };

        // Set status code
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        // Redirect
        res.redirect = (statusCodeOrUrl: number | string, url?: string) => {
            if (typeof statusCodeOrUrl === 'number') {
                // Called with statusCode and url
                res.statusCode = statusCodeOrUrl;
                res.setHeader('Location', url!);
            } else {
                // Called with only url
                res.statusCode = 302;
                res.setHeader('Location', statusCodeOrUrl);
            }
            res.end();
        };

        // Set cookie
        res.cookie = (name: string, value: string, options?: CookieOptions) => {
            let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

            if (options) {
                if (options.maxAge) {
                    // Convert milliseconds to seconds (Express uses ms, but Set-Cookie expects seconds)
                    const maxAgeInSeconds = Math.floor(options.maxAge / 1000);
                    cookieString += `; Max-Age=${maxAgeInSeconds}`;
                }
                if (options.expires) {
                    cookieString += `; Expires=${options.expires.toUTCString()}`;
                }
                // Default path to "/" if not specified
                cookieString += `; Path=${options.path || '/'}`;
                if (options.domain) {
                    cookieString += `; Domain=${options.domain}`;
                }
                if (options.secure) {
                    cookieString += `; Secure`;
                }
                if (options.httpOnly) {
                    cookieString += `; HttpOnly`;
                }
                if (options.sameSite) {
                    cookieString += `; SameSite=${options.sameSite}`;
                }
                if (options.partitioned) {
                    cookieString += `; Partitioned`;
                }
            } else {
                // No options provided, default path to "/"
                cookieString += `; Path=/`;
            }

            // Get existing Set-Cookie headers
            const existingCookies = res.getHeader('Set-Cookie');

            if (existingCookies) {
                // Append to existing cookies
                if (Array.isArray(existingCookies)) {
                    res.setHeader('Set-Cookie', [...existingCookies, cookieString]);
                } else {
                    res.setHeader('Set-Cookie', [existingCookies as string, cookieString]);
                }
            } else {
                res.setHeader('Set-Cookie', cookieString);
            }

            return res;
        };

        // Clear cookie
        res.clearCookie = (name: string, options?: CookieOptions) => {
            // To clear a cookie, set it with an expiration date in the past
            const clearOptions: CookieOptions = {
                path: '/', // Default to "/" to match cookie setting
                ...options,
                expires: new Date(0), // Set to epoch time (Jan 1, 1970)
                maxAge: 0
            };

            return res.cookie(name, '', clearOptions);
        };

        return res;
    }

    // Check if a pathname matches a middleware path
    private matchMiddlewarePath(middlewarePath: string, requestPath: string): boolean {
        // Empty path means global middleware - matches everything
        if (middlewarePath === '') {
            return true;
        }

        // Exact match
        if (middlewarePath === requestPath) {
            return true;
        }

        // Check if request path starts with middleware path
        // e.g., middleware path '/api' should match '/api', '/api/', '/api/users', etc.
        const normalizedMiddlewarePath = middlewarePath.endsWith('/') ? middlewarePath : middlewarePath + '/';
        const normalizedRequestPath = requestPath.endsWith('/') ? requestPath : requestPath + '/';

        return normalizedRequestPath.startsWith(normalizedMiddlewarePath) || requestPath === middlewarePath;
    }

    /**
     * Wrap a handler with automatic parameter resolution
     * Returns a new handler that resolves parameters before calling the original
     */
    private wrapHandlerWithParameterResolution(
        originalHandler: Function,
        controllerInstance: any,
        methodName: string
    ): RouteHandler {
        const self = this;

        return async function wrappedHandler(req: Request, res: Response, next: NextFunction) {
            try {
                // Inject req, res, and next into controller instance
                controllerInstance.req = req;
                controllerInstance.res = res;
                controllerInstance.next = next;

                // Resolve parameters using metadata
                const resolvedParams = await self.resolveParameters(
                    methodName,  // Use methodName instead of handler
                    controllerInstance,
                    req,
                    res,
                    next
                );

                // Call original handler with resolved parameters
                return await originalHandler.apply(controllerInstance, resolvedParams);
            } catch (error) {
                // Pass errors to next
                if (next) {
                    next(error);
                } else {
                    throw error;
                }
            }
        };
    }

    /**
     * Extract parameter names from a function signature
     * Works with compiled TypeScript code
     */
    private getParameterNames(method: Function): string[] {
        const fnStr = method.toString();
        const match = fnStr.match(/\(([^)]*)\)/);
        if (!match) return [];

        return match[1]
            .split(',')
            .map(param => {
                // Extract just the parameter name, ignoring type annotations and default values
                const trimmed = param.trim();
                if (!trimmed) return '';
                // Match the parameter name before : or = or whitespace
                const nameMatch = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                return nameMatch ? nameMatch[1] : '';
            })
            .filter(Boolean);
    }

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
    private async resolveParameters(
        methodName: string,
        target: any,
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any[]> {
        // Start with req, res, next
        const resolvedParams: any[] = [req, res, next];

        // Get route metadata for this method
        const constructor = target.constructor;
        const routes = getRoutes(constructor);
        const routeMetadata = routes.find(r => r.methodName === methodName);

        // Approach 1: Use route-level resolve configuration (new approach)
        if (routeMetadata?.resolve && Object.keys(routeMetadata.resolve).length > 0) {
            // Get parameter names from the method
            const method = target[methodName];
            const paramNames = this.getParameterNames(method);

            // Resolve each entity specified in the resolve config
            for (const [routeParamName, EntityType] of Object.entries(routeMetadata.resolve)) {
                // Find which parameter position this should go to
                const paramIndex = paramNames.indexOf(routeParamName);

                if (paramIndex >= 0) {
                    // Get the route parameter value
                    const paramValue = req.params?.[routeParamName];

                    if (paramValue) {
                        // Find repository for this entity type
                        const repository = this.findRepositoryForEntity(target, EntityType);

                        if (repository) {
                            // Resolve entity using repository.find()
                            const entity = await repository.find(paramValue);

                            // Ensure array is large enough
                            while (resolvedParams.length <= paramIndex) {
                                resolvedParams.push(undefined);
                            }

                            resolvedParams[paramIndex] = entity;
                        }
                    }
                }
            }

            return resolvedParams;
        }

        // Approach 2: Fall back to @Param decorator metadata (legacy)
        const proto = Object.getPrototypeOf(target);
        const paramMetadata: ParamMetadata[] = getParamMetadata(proto, methodName);

        if (paramMetadata.length === 0) {
            return resolvedParams;
        }

        // Sort by parameter index to maintain order
        paramMetadata.sort((a, b) => a.parameterIndex - b.parameterIndex);

        // Resolve each decorated parameter
        for (const metadata of paramMetadata) {
            const { routeParamName, entityType, parameterIndex } = metadata;

            // Fill in any gaps with undefined (for req, res, next, etc.)
            while (resolvedParams.length < parameterIndex) {
                resolvedParams.push(undefined);
            }

            // Get the route parameter value
            const paramValue = req.params?.[routeParamName];

            if (paramValue) {
                // Find repository for this entity type
                const repository = this.findRepositoryForEntity(target, entityType);

                if (repository) {
                    // Resolve entity using repository.find()
                    const entity = await repository.find(paramValue);
                    resolvedParams[parameterIndex] = entity;
                } else {
                    resolvedParams[parameterIndex] = undefined;
                }
            } else {
                resolvedParams[parameterIndex] = undefined;
            }
        }

        return resolvedParams;
    }

    /**
     * Find repository for a given entity type
     * User type → looks for userRepository
     */
    private findRepositoryForEntity(target: any, entityType: any): any {
        if (!entityType || !entityType.name) {
            return null;
        }

        const entityName = entityType.name;  // e.g., "User"
        const repositoryPropertyName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Repository';  // "userRepository"

        // Check if repository exists as a direct property on the controller
        const repository = (target as any)[repositoryPropertyName];

        return repository || null;
    }

    // Execute middleware chain with path matching
    async executeMiddlewares(req: Request, res: Response, pathname: string): Promise<void> {
        // Filter middlewares that match the current path
        const matchingMiddlewares = this.middlewares.filter(mw =>
            this.matchMiddlewarePath(mw.path, pathname)
        );

        // Execute each matching middleware in sequence
        for (const mw of matchingMiddlewares) {
            await new Promise<void>((resolve, reject) => {
                try {
                    let nextCalled = false;

                    const next: NextFunction = (err) => {
                        if (nextCalled) return;
                        nextCalled = true;
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    };

                    const result = mw.middleware(req, res, next);

                    // If middleware returns a promise, wait for it
                    if (result instanceof Promise) {
                        result
                            .then(() => {
                                // If next was already called, nothing to do (already resolved)
                                if (nextCalled) return;

                                // If response was sent, resolve
                                if (res.writableEnded || res.headersSent) {
                                    resolve();
                                } else {
                                    // Middleware didn't call next() or send response
                                    reject(new Error('Middleware completed without calling next() or sending a response'));
                                }
                            })
                            .catch(reject);
                    } else {
                        // For synchronous middlewares, check if response was sent
                        setImmediate(() => {
                            // If next was already called, nothing to do (already resolved)
                            if (nextCalled) return;

                            // If response was sent, resolve
                            if (res.writableEnded || res.headersSent) {
                                resolve();
                            } else {
                                // Middleware didn't call next() or send response
                                reject(new Error('Middleware completed without calling next() or sending a response'));
                            }
                        });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
    }

    // Main request handler
    async handleRequest(req: Request, res: Response, next?: NextFunction): Promise<void> {
        try {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname!;
            const query = parsedUrl.query;

            // Enhance request and response early
            req = this.createRequest(req, {}, query);
            res = this.createResponse(res);

            // Parse cookies
            req.cookies = this.parseCookies(req);

            // Match route early to get parser type
            const route = this.matchRoute(req.method as HttpMethod, pathname);

            if (!route) {
                // Avoid redirect loop - don't redirect if already on an error route
                if (pathname.includes('/error/')) {
                    res.statusCode = 404;
                    res.end('Not Found');
                    return;
                }
                // Redirect to ErrorController 404 route (with base path)
                const errorPath = `${this.basePath}/error/404`;
                res.redirect(errorPath);
                return;
            }

            // Update request with route params
            req.params = route.params;

            // Parse body for POST/PUT/PATCH with route-specific or global parser type
            req.body = {};
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                req.body = await this.parseBody(req, route.parserType);
            }

            // Execute matching middlewares (global and path-specific)
            await this.executeMiddlewares(req, res, pathname);

            // Execute route handlers
            for (const handler of route.handlers) {
                await new Promise<void>((resolve, reject) => {
                    try {
                        let nextCalled = false;

                        const next: NextFunction = (err) => {
                            if (nextCalled) return;
                            nextCalled = true;
                            if (err) reject(err);
                            else resolve();
                        };

                        const result = handler(req, res, next);

                        // If handler returns a promise, wait for it
                        if (result instanceof Promise) {
                            result
                                .then(() => {
                                    // If next was called, we already resolved, do nothing
                                    if (nextCalled) return;

                                    // If response was sent, resolve
                                    if (res.writableEnded || res.headersSent) {
                                        resolve();
                                    } else {
                                        // Handler didn't call next() or send response - this is an error
                                        reject(new Error('Handler completed without calling next() or sending a response'));
                                    }
                                })
                                .catch(reject);
                        } else {
                            // For synchronous handlers, check if response was sent
                            setImmediate(() => {
                                // If next was called, we already resolved, do nothing
                                if (nextCalled) return;

                                // If response was sent, resolve
                                if (res.writableEnded || res.headersSent) {
                                    resolve();
                                } else {
                                    // Handler didn't call next() or send response - this is an error
                                    reject(new Error('Handler completed without calling next() or sending a response'));
                                }
                            });
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }

        } catch (error: any) {
            errorHandler(error, req, res, next);
        }
    }

    // Start the server
    /**
     * Start HTTP server on specified port
     * @param {number|string} port - Port number to listen on
     * @param {() => void} [callback] - Optional callback when server starts
     * @returns {Promise<http.Server>} - HTTP server instance
     */
    async listen(port: number|string, callback?: () => void): Promise<http.Server> {
        // Step 1: Auto-register services and repositories
        if (!this.servicesRegistered) {
            await this.autoRegister();
            this.servicesRegistered = true;
        }

        // Step 2: Load controllers (AFTER services are registered)
        if (!this.controllersLoaded) {
            await this.loadControllersAsync();
            this.controllersLoaded = true;
        }

        // Step 3: Start the HTTP server
        const server = http.createServer((req, res) => {
            this.handleRequest(req as Request, res as Response);
        });

        return new Promise((resolve) => {
            server.listen(port, () => {
                if (callback) callback();
                resolve(server);
            });
        });
    }
}

export function createServer(): LyraServer {
    return new LyraServer();
}