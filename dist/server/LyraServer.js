import 'reflect-metadata';
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { accessMiddleware, errorHandler, httpRequestMiddleware } from "../middlewares/index.js";
import { Config } from "../config/index.js";
import { Controller, DIContainer, getParamMetadata, getRoutePrefix, getRoutes, logger, multipartMiddleware, MultipartParser } from '../server/index.js';
import { TemplateRenderer } from '../ssr/index.js';
import { parseXML, serializeToXML } from './xmlParser.js';
import { Scheduler } from '../scheduler/index.js';
import { logger as loggerSingleton } from '../logger/index.js';
import { mailer } from '../mailer/index.js';
import { FileManager } from "../services/index.js";
/** Main HTTP server class with routing, middleware, and dependency injection */
class LyraServer {
    constructor() {
        this.controllersLoaded = false;
        this.servicesRegistered = false;
        this.schedulerEnabled = false;
        this.diContainer = new DIContainer();
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
            PATCH: {},
            OPTIONS: {}
        };
        this.middlewares = [];
        this.settings = new Map();
        // Read base path from config
        try {
            this.basePath = new Config().get("router.base_path") || '';
        }
        catch (error) {
            this.basePath = '';
        }
        // Default settings
        this.settings.set('trust proxy', false);
        this.settings.set('request max size', '10mb');
        // Register global middlewares (run before routing)
        this.middlewares.push({ path: '', middleware: logger });
        this.middlewares.push({ path: '', middleware: httpRequestMiddleware });
        this.middlewares.push({ path: '', middleware: accessMiddleware });
        this.middlewares.push({ path: '', middleware: multipartMiddleware });
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
    setSetting(key, value) {
        this.settings.set(key, value);
        // Configure SSR if setting is 'ssr'
        if (key === 'ssr') {
            const renderer = TemplateRenderer.getInstance();
            renderer.configure(value);
        }
        return this;
    }
    /**
     * Get application setting
     * @param {string} key - Setting key
     * @returns {any} - Setting value
     */
    getSetting(key) {
        return this.settings.get(key);
    }
    /**
     * Enable the scheduler system
     * Automatically discovers and runs jobs with @Schedule({ enabled: true })
     * @param {SchedulerOptions} [options] - Scheduler configuration options
     * @returns {this} - Server instance for chaining
     * @example
     * app.enableScheduler()
     * app.enableScheduler({ timezone: 'America/New_York' })
     */
    enableScheduler(options) {
        this.scheduler = new Scheduler(this.diContainer, options);
        this.schedulerEnabled = true;
        return this;
    }
    /**
     * Get the scheduler instance (if enabled)
     * @returns {Scheduler | undefined} - Scheduler instance
     */
    getScheduler() {
        return this.scheduler;
    }
    /**
     * Load controllers asynchronously
     * @returns {Promise<void>}
     */
    async loadControllersAsync() {
        try {
            await this.getControllersAsync();
            this.controllersLoaded = true;
        }
        catch (error) {
            console.error('Error loading controllers:', error);
        }
    }
    /**
     * Register middleware or router
     * @param {string | Middleware | IRouter} pathOrHandler - Path, middleware, or router
     * @param {Middleware | IRouter} [handler] - Optional middleware or router
     * @returns {this} - Server instance for chaining
     */
    use(pathOrHandler, handler) {
        if (typeof pathOrHandler === 'string') {
            // Path with handler: use('/path', handler) or use('/path', router)
            if (handler) {
                if (this.isRouter(handler)) {
                    // Router with path - prepend basePath
                    this.mountRouter(this.basePath + pathOrHandler, handler);
                }
                else {
                    // Path-specific middleware - prepend basePath
                    this.middlewares.push({ path: this.basePath + pathOrHandler, middleware: handler });
                }
            }
        }
        else {
            // No path, just middleware/router: use(middleware) or use(router)
            if (this.isRouter(pathOrHandler)) {
                // Router without explicit path - use basePath
                this.mountRouter(this.basePath, pathOrHandler);
            }
            else {
                // Global middleware - no basePath (matches all)
                this.middlewares.push({ path: '', middleware: pathOrHandler });
            }
        }
        return this;
    }
    /**
     * Serve static files from a directory with security protection against directory traversal
     * @param {string} urlPrefix - URL path prefix (e.g., '/public', '/static', '/assets')
     * @param {object} [options] - Static file serving options
     * @param {string} [options.root='public'] - Root directory to serve files from (relative to project root)
     * @param {number} [options.maxAge=0] - Cache-Control max-age in seconds
     * @param {string[]} [options.allowedExtensions] - Array of allowed file extensions (e.g., ['.css', '.js', '.png'])
     * @param {'allow'|'deny'|'ignore'} [options.dotfiles='deny'] - How to handle dotfiles
     * @returns {this} - Server instance for chaining
     * @example
     * // Basic usage (serves from 'public' folder by default)
     * app.serveStatic('/public')
     *
     * // Custom root directory
     * app.serveStatic('/assets', { root: 'public/assets' })
     *
     * // With caching
     * app.serveStatic('/public', { maxAge: 86400 })
     *
     * // Important: In HTML templates, always use absolute paths with leading slash
     * // Correct:   <link rel="stylesheet" href="/assets/style/app.css" />
     * // Wrong:     <link rel="stylesheet" href="assets/style/app.css" />
     * // Or use <base href="/"> in your HTML head to make relative paths work from root
     */
    serveStatic(urlPrefix, options = {}) {
        const { root = 'public', maxAge = 0, allowedExtensions, dotfiles = 'deny' } = options;
        // MIME type mapping
        const MIME_TYPES = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.webp': 'image/webp',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'font/otf',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.xml': 'application/xml',
            '.zip': 'application/zip'
        };
        // Normalize URL prefix
        const normalizedPrefix = urlPrefix.endsWith('/') ? urlPrefix.slice(0, -1) : urlPrefix;
        // Resolve root directory to absolute path
        const rootDir = path.resolve(process.cwd(), root);
        // Create middleware for static file serving
        const staticMiddleware = (req, res, next) => {
            var _a;
            // Only handle requests matching the prefix
            if (!((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith(normalizedPrefix))) {
                return next();
            }
            // Extract the file path after the prefix
            let requestedPath = req.url.slice(normalizedPrefix.length);
            // Remove query string
            const queryIndex = requestedPath.indexOf('?');
            if (queryIndex !== -1) {
                requestedPath = requestedPath.slice(0, queryIndex);
            }
            // Default to index.html for directory requests
            if (requestedPath === '' || requestedPath === '/') {
                requestedPath = '/index.html';
            }
            // SECURITY: Prevent directory traversal
            // Replace all occurrences of ../ and ..\
            const sanitizedPath = requestedPath
                .replace(/\.\./g, '') // Remove all ..
                .replace(/\/\//g, '/') // Remove double slashes
                .replace(/\\/g, '/'); // Normalize backslashes to forward slashes
            // Check for dotfiles
            const pathSegments = sanitizedPath.split('/').filter(Boolean);
            if (dotfiles === 'deny' || dotfiles === 'ignore') {
                for (const segment of pathSegments) {
                    if (segment.startsWith('.')) {
                        if (dotfiles === 'deny') {
                            res.statusCode = 403;
                            res.end('403 Forbidden');
                            return;
                        }
                        else {
                            // ignore: treat as not found
                            return next();
                        }
                    }
                }
            }
            // Build absolute file path
            const filePath = path.join(rootDir, sanitizedPath);
            // SECURITY: Ensure the resolved path is still within rootDir
            const normalizedFilePath = path.normalize(filePath);
            const normalizedRootDir = path.normalize(rootDir);
            if (!normalizedFilePath.startsWith(normalizedRootDir)) {
                res.statusCode = 403;
                res.end('403 Forbidden');
                return;
            }
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return next();
            }
            // Check if it's a file (not a directory)
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                return next();
            }
            // Get file extension
            const ext = path.extname(filePath).toLowerCase();
            // Check if extension is allowed
            if (allowedExtensions && !allowedExtensions.includes(ext)) {
                res.statusCode = 403;
                res.end('403 Forbidden');
                return;
            }
            // Get MIME type
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            // Set response headers
            res.setHeader('Content-Type', mimeType);
            if (maxAge > 0) {
                res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
            }
            else {
                res.setHeader('Cache-Control', 'no-cache');
            }
            // Set content length
            res.setHeader('Content-Length', stats.size);
            // Read and send file
            const fileStream = fs.createReadStream(filePath);
            fileStream.on('error', (error) => {
                console.error('Error reading file:', error);
                res.statusCode = 500;
                res.end('500 Internal Server Error');
            });
            fileStream.pipe(res);
        };
        // Register as a GET route with wildcard parameter
        // Use :filepath* notation for wildcard that matches all remaining path segments
        const wildcardPath = normalizedPrefix + '/:filepath*';
        // Create route handler wrapper that properly handles the static file logic
        const routeHandler = async (req, res) => {
            // Call the static middleware directly
            return new Promise((resolve, reject) => {
                staticMiddleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        // If next() was called (file not found), send 404
                        if (!res.writableEnded) {
                            res.statusCode = 404;
                            res.end('404 Not Found');
                        }
                        resolve();
                    }
                });
            });
        };
        // Add metadata for show:routes command
        routeHandler.__isStaticRoute__ = true;
        routeHandler.__staticRoot__ = root;
        // Use addRoute to properly register with pattern matching
        this.addRoute('GET', wildcardPath, [routeHandler]);
        return this;
    }
    // Check if handler is a router
    isRouter(handler) {
        return handler && typeof handler.getRoutes === 'function';
    }
    // Mount a router with optional path prefix
    mountRouter(basePath, router) {
        const routes = router.getRoutes();
        routes.forEach(route => {
            const fullPath = basePath + route.path;
            route.handlers.forEach(handler => {
                if (this.isRouter(handler)) {
                    // Nested router - recursively mount it
                    this.mountRouter(fullPath, handler);
                }
                else {
                    // Regular handler
                    if (route.method === 'USE') {
                        // Middleware - add with the correct path prefix
                        // If route.path is empty, use basePath, otherwise combine them
                        const middlewarePath = route.path ? fullPath : basePath;
                        this.middlewares.push({ path: middlewarePath, middleware: handler });
                    }
                    else {
                        // Route handler
                        this.addRoute(route.method, fullPath, [handler]);
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
    registerController(controller, basePath = '') {
        const prefix = getRoutePrefix(controller);
        const routes = getRoutes(controller);
        // Get class-level middlewares if any
        const classMiddlewares = Reflect.getMetadata('routeClassMiddlewares', controller) || [];
        // Check if controller extends Controller base class (for DI support)
        const extendsController = this.diContainer.extendsClass(controller, Controller);
        let controllerInstance = null;
        if (extendsController) {
            // Create controller instance with DI
            controllerInstance = new controller();
            // Inject services and repositories
            this.diContainer.injectIntoController(controllerInstance);
        }
        routes.forEach(route => {
            const fullPath = this.basePath + basePath + prefix + route.path;
            const methodName = route.methodName;
            let handler;
            // Check if the method is static (exists on the class) or instance (exists on prototype)
            const isStaticMethod = typeof controller[methodName] === 'function';
            const isInstanceMethod = controllerInstance && typeof controllerInstance[methodName] === 'function';
            if (isInstanceMethod && !isStaticMethod) {
                // Instance method (DI-enabled controller)
                const originalHandler = controllerInstance[methodName];
                if (!originalHandler || typeof originalHandler !== 'function') {
                    throw new Error(`Method ${methodName} not found on controller ${controller.name}.`);
                }
                // Check if parameter resolution is needed
                const needsParameterResolution = this.needsParameterResolution(route, controllerInstance, methodName);
                if (needsParameterResolution) {
                    // Wrap handler with parameter resolution
                    handler = this.wrapHandlerWithParameterResolution(originalHandler, controllerInstance, methodName);
                }
                else {
                    // No parameter resolution needed - create request-scoped context
                    handler = async (req, res, next) => {
                        // Create a request-scoped context that inherits from controller instance
                        // This prevents concurrent requests from overwriting each other's req/res/next
                        const requestContext = Object.create(controllerInstance);
                        requestContext.req = req;
                        requestContext.res = res;
                        requestContext.next = next;
                        // Call original handler with request-scoped context
                        return await originalHandler.call(requestContext);
                    };
                }
            }
            else if (isStaticMethod) {
                // Static method (traditional controller or static method on DI controller)
                handler = controller[methodName];
                if (!handler || typeof handler !== 'function') {
                    throw new Error(`Method ${methodName} not found on controller ${controller.name}. ` +
                        `Make sure the method is static.`);
                }
            }
            else {
                throw new Error(`Method ${methodName} not found on controller ${controller.name}.`);
            }
            // Combine class middlewares, route middlewares, and the handler
            const handlers = [
                ...classMiddlewares,
                ...(route.middlewares || []),
                handler
            ];
            // Register the route based on HTTP method
            this.addRoute(route.method, fullPath, handlers, route.parserType);
        });
        return this;
    }
    // Async version - Automatically discover and register controllers from a directory
    async getControllersAsync(controllersPath = 'src/controller') {
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
                }
                catch (error) {
                    console.error(`Error loading controller from ${file}:`, error);
                }
            }
        }
    }
    // Synchronous version (kept for backward compatibility)
    getControllers(controllersPath = 'src/controller') {
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
    register(classOrInstanceOrArray, name, type) {
        // Check if it's an array - bulk registration
        if (Array.isArray(classOrInstanceOrArray)) {
            for (const item of classOrInstanceOrArray) {
                if (typeof item === 'function' && item.prototype) {
                    // It's a class - register it
                    this.diContainer.register(item);
                }
                else {
                    throw new Error('Array registration only supports classes. Use individual registration for instances.');
                }
            }
            return this;
        }
        // Single item registration
        // Check if it's a class (constructor function) or an instance
        if (typeof classOrInstanceOrArray === 'function' && classOrInstanceOrArray.prototype) {
            // It's a class - register it normally
            this.diContainer.register(classOrInstanceOrArray);
        }
        else {
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
    getPropertyNameFromInstance(instance) {
        var _a;
        const constructorName = (_a = instance.constructor) === null || _a === void 0 ? void 0 : _a.name;
        if (!constructorName || constructorName === 'Object') {
            throw new Error('Cannot auto-detect property name for instance. ' +
                'Please provide a name parameter: app.register(instance, "propertyName")');
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
    async autoRegister(options) {
        const servicesPath = (options === null || options === void 0 ? void 0 : options.services) || 'src/services';
        const repositoriesPath = (options === null || options === void 0 ? void 0 : options.repositories) || 'src/repository';
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
    async autoDiscoverInjectables(dirPath, expectedType) {
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
            }
            catch (error) {
                // Silently skip files that can't be imported
            }
        }
    }
    /**
     * Recursively get all files with specific extensions from a directory
     */
    getAllFiles(dirPath, extensions) {
        const files = [];
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
            }
            else if (stat.isFile()) {
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
    get(path, ...handlers) {
        this.addRoute('GET', path, handlers);
        return this;
    }
    /**
     * Register POST route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    post(path, ...handlers) {
        this.addRoute('POST', path, handlers);
        return this;
    }
    /**
     * Register PUT route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    put(path, ...handlers) {
        this.addRoute('PUT', path, handlers);
        return this;
    }
    /**
     * Register DELETE route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    delete(path, ...handlers) {
        this.addRoute('DELETE', path, handlers);
        return this;
    }
    /**
     * Register PATCH route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    patch(path, ...handlers) {
        this.addRoute('PATCH', path, handlers);
        return this;
    }
    /**
     * Register OPTIONS route
     * @param {string} path - Route path
     * @param {...RouteHandler[]} handlers - Route handlers
     * @returns {this} - Server instance for chaining
     */
    options(path, ...handlers) {
        this.addRoute('OPTIONS', path, handlers);
        return this;
    }
    addRoute(method, path, handlers, parserType) {
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
    // Supports :param for single segment and :param* for wildcard (multiple segments)
    pathToRegex(path) {
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)\*/g, '(.+)') // :param* matches everything (including /)
            .replace(/:(\w+)/g, '([^/]+)'); // :param matches single segment
        return new RegExp(`^${pattern}$`);
    }
    // Extract parameter names from path
    // Handles both :param and :param* syntax
    extractParamNames(path) {
        const matches = path.match(/:(\w+)\*?/g);
        return matches ? matches.map(m => m.slice(1).replace('*', '')) : [];
    }
    // Match incoming request to route
    matchRoute(method, pathname) {
        const methodRoutes = this.routes[method];
        for (const [path, route] of Object.entries(methodRoutes)) {
            const match = pathname.match(route.pattern);
            if (match) {
                const params = {};
                route.paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return { handlers: route.handlers, params, parserType: route.parserType };
            }
        }
        return null;
    }
    // Parse size string (e.g., "10mb", "1kb") to bytes
    parseSizeToBytes(size) {
        const units = {
            b: 1,
            kb: 1024,
            mb: 1024 * 1024,
            gb: 1024 * 1024 * 1024
        };
        const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
        if (!match)
            return 10 * 1024 * 1024; // Default 10MB
        const value = parseFloat(match[1]);
        const unit = match[2];
        return value * (units[unit] || 1);
    }
    // Parse request body
    async parseBody(req, parserType) {
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
                        }
                        else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
                            detectedType = 'xml';
                        }
                        else if (contentType.includes('application/x-www-form-urlencoded')) {
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
                            const parsed = {};
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
                }
                catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        });
    }
    // Parse MultipartFormData
    // async parseMultipartFormData(req: Request): Promise<ParsedMultipartData> {
    //   const multipartParser = new MultipartParser();
    //   const { fields, files } = await multipartParser.parse(req)
    //   return {
    //     fields
    //   }
    // }
    // Parse cookies from request headers
    parseCookies(req) {
        const cookieHeader = req.headers.cookie;
        const cookies = {};
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
    createRequest(req, params, query) {
        req.params = params;
        req.query = query;
        return req;
    }
    // Enhanced response object
    createResponse(res) {
        // Add explicit tracking flag for response state
        res._responseSent = false;
        // Store original end method
        const originalEnd = res.end.bind(res);
        res.end = function (...args) {
            this._responseSent = true;
            return originalEnd(...args);
        };
        // JSON response
        res.json = (data) => {
            if (res.headersSent) {
                return;
            }
            res._responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        };
        // XML response
        res.xml = (data) => {
            if (res.headersSent) {
                return;
            }
            res._responseSent = true;
            res.setHeader('Content-Type', 'application/xml');
            res.end(serializeToXML(data));
        };
        // HTML response
        res.html = (data) => {
            if (res.headersSent) {
                return;
            }
            res._responseSent = true;
            res.setHeader('Content-Type', 'text/html');
            res.end(String(data));
        };
        // Text response
        res.text = (data) => {
            if (res.headersSent) {
                return;
            }
            res._responseSent = true;
            res.setHeader('Content-Type', 'text/plain');
            res.end(String(data));
        };
        // Send response
        res.send = (data) => {
            if (res.headersSent) {
                return;
            }
            res._responseSent = true;
            if (typeof data === 'object') {
                res.json(data);
            }
            else {
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
        res.redirect = (statusCodeOrUrl, url) => {
            res._responseSent = true;
            if (typeof statusCodeOrUrl === 'number') {
                // Called with statusCode and url
                res.statusCode = statusCodeOrUrl;
                res.setHeader('Location', url);
            }
            else {
                // Called with only url
                res.statusCode = 302;
                res.setHeader('Location', statusCodeOrUrl);
            }
            res.end();
        };
        // Set cookie
        res.cookie = (name, value, options) => {
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
            }
            else {
                // No options provided, default path to "/"
                cookieString += `; Path=/`;
            }
            // Get existing Set-Cookie headers
            const existingCookies = res.getHeader('Set-Cookie');
            if (existingCookies) {
                // Append to existing cookies
                if (Array.isArray(existingCookies)) {
                    res.setHeader('Set-Cookie', [...existingCookies, cookieString]);
                }
                else {
                    res.setHeader('Set-Cookie', [existingCookies, cookieString]);
                }
            }
            else {
                res.setHeader('Set-Cookie', cookieString);
            }
            return res;
        };
        // Clear cookie
        res.clearCookie = (name, options) => {
            // To clear a cookie, set it with an expiration date in the past
            const clearOptions = {
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
    matchMiddlewarePath(middlewarePath, requestPath) {
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
     * Check if a route handler needs parameter resolution
     * Returns true if the route has resolve config or @Param decorators
     */
    needsParameterResolution(route, controllerInstance, methodName) {
        // Check if route has resolve configuration
        if (route.resolve && Object.keys(route.resolve).length > 0) {
            return true;
        }
        // Check if method has @Param decorator metadata
        const proto = Object.getPrototypeOf(controllerInstance);
        const paramMetadata = getParamMetadata(proto, methodName);
        if (paramMetadata && paramMetadata.length > 0) {
            return true;
        }
        return false;
    }
    /**
     * Wrap a handler with automatic parameter resolution
     * Returns a new handler that resolves parameters before calling the original
     */
    wrapHandlerWithParameterResolution(originalHandler, controllerInstance, methodName) {
        const self = this;
        return async function wrappedHandler(req, res, next) {
            // Create a request-scoped context that inherits from controller instance
            // This prevents concurrent requests from overwriting each other's req/res/next
            const requestContext = Object.create(controllerInstance);
            requestContext.req = req;
            requestContext.res = res;
            requestContext.next = next;
            // Resolve parameters using metadata
            const resolvedParams = await self.resolveParameters(methodName, requestContext, req, res, next);
            // Call original handler with request-scoped context
            return originalHandler.apply(requestContext, resolvedParams);
        };
    }
    /**
     * Extract parameter names from a function signature
     * Works with compiled TypeScript code
     */
    getParameterNames(method) {
        const fnStr = method.toString();
        const match = fnStr.match(/\(([^)]*)\)/);
        if (!match)
            return [];
        return match[1]
            .split(',')
            .map(param => {
            // Extract just the parameter name, ignoring type annotations and default values
            const trimmed = param.trim();
            if (!trimmed)
                return '';
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
    async resolveParameters(methodName, target, req, res, next) {
        var _a, _b;
        // Start with req, res, next
        const resolvedParams = [req, res, next];
        // Get route metadata for this method
        const constructor = target.constructor;
        const routes = getRoutes(constructor);
        const routeMetadata = routes.find(r => r.methodName === methodName);
        // Approach 1: Use route-level resolve configuration (new approach)
        if ((routeMetadata === null || routeMetadata === void 0 ? void 0 : routeMetadata.resolve) && Object.keys(routeMetadata.resolve).length > 0) {
            // Get parameter names from the method
            const method = target[methodName];
            const paramNames = this.getParameterNames(method);
            // Resolve each entity specified in the resolve config
            for (const [routeParamName, EntityType] of Object.entries(routeMetadata.resolve)) {
                // Find which parameter position this should go to
                const paramIndex = paramNames.indexOf(routeParamName);
                if (paramIndex >= 0) {
                    // Get the route parameter value
                    const paramValue = (_a = req.params) === null || _a === void 0 ? void 0 : _a[routeParamName];
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
        const paramMetadata = getParamMetadata(proto, methodName);
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
            const paramValue = (_b = req.params) === null || _b === void 0 ? void 0 : _b[routeParamName];
            if (paramValue) {
                // Find repository for this entity type
                const repository = this.findRepositoryForEntity(target, entityType);
                if (repository) {
                    // Resolve entity using repository.find()
                    const entity = await repository.find(paramValue);
                    resolvedParams[parameterIndex] = entity;
                }
                else {
                    resolvedParams[parameterIndex] = undefined;
                }
            }
            else {
                resolvedParams[parameterIndex] = undefined;
            }
        }
        return resolvedParams;
    }
    /**
     * Find repository for a given entity type
     * User type → looks for userRepository
     */
    findRepositoryForEntity(target, entityType) {
        if (!entityType || !entityType.name) {
            return null;
        }
        const entityName = entityType.name; // e.g., "User"
        const repositoryPropertyName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Repository'; // "userRepository"
        // Check if repository exists as a direct property on the controller
        const repository = target[repositoryPropertyName];
        return repository || null;
    }
    // Execute middleware chain with path matching
    async executeMiddlewares(req, res, pathname) {
        // Filter middlewares that match the current path
        const matchingMiddlewares = this.middlewares.filter(mw => this.matchMiddlewarePath(mw.path, pathname));
        // Execute each matching middleware in sequence
        for (const mw of matchingMiddlewares) {
            await new Promise((resolve, reject) => {
                try {
                    let nextCalled = false;
                    const next = (err) => {
                        if (nextCalled)
                            return;
                        nextCalled = true;
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    };
                    const result = mw.middleware(req, res, next);
                    // Helper to check if response was sent
                    const isResponseSent = () => {
                        return res._responseSent || res.writableEnded || res.headersSent;
                    };
                    // If middleware returns a promise, wait for it
                    if (result instanceof Promise) {
                        result
                            .then(() => {
                            // If next was already called, nothing to do (already resolved)
                            if (nextCalled)
                                return;
                            // If response was sent, resolve
                            if (isResponseSent()) {
                                resolve();
                            }
                            else {
                                // Middleware didn't call next() or send response
                                reject(new Error('Middleware completed without calling next() or sending a response'));
                            }
                        })
                            .catch(reject);
                    }
                    else {
                        // For synchronous middlewares, check if response was sent
                        setImmediate(() => {
                            // If next was already called, nothing to do (already resolved)
                            if (nextCalled)
                                return;
                            // If response was sent, resolve
                            if (isResponseSent()) {
                                resolve();
                            }
                            else {
                                // Middleware didn't call next() or send response
                                reject(new Error('Middleware completed without calling next() or sending a response'));
                            }
                        });
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        }
    }
    // Execute route handlers with proper next() handling
    async executeHandlers(handlers, req, res) {
        for (const handler of handlers) {
            await new Promise((resolve, reject) => {
                try {
                    let nextCalled = false;
                    let resolved = false;
                    const next = (err) => {
                        if (nextCalled)
                            return;
                        nextCalled = true;
                        if (err)
                            reject(err);
                        else
                            resolve();
                    };
                    const result = handler(req, res, next);
                    // Helper to check if response was sent
                    const isResponseSent = () => {
                        return res._responseSent || res.writableEnded || res.headersSent;
                    };
                    // If handler returns a promise, wait for it
                    if (result instanceof Promise) {
                        result
                            .then(() => {
                            // If next was called, we already resolved, do nothing
                            if (nextCalled || resolved)
                                return;
                            // Check if response was sent (using our explicit flag)
                            if (isResponseSent()) {
                                resolved = true;
                                resolve();
                            }
                            else {
                                // Handler didn't call next() or send response - this is an error
                                reject(new Error('Handler completed without calling next() or sending a response'));
                            }
                        })
                            .catch(reject);
                    }
                    else {
                        // For synchronous handlers, check if response was sent
                        setImmediate(() => {
                            // If next was called, we already resolved, do nothing
                            if (nextCalled || resolved)
                                return;
                            // Check if response was sent
                            if (isResponseSent()) {
                                resolved = true;
                                resolve();
                            }
                            else {
                                // Handler didn't call next() or send response - this is an error
                                reject(new Error('Handler completed without calling next() or sending a response'));
                            }
                        });
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        }
    }
    // Main request handler
    async handleRequest(req, res, next) {
        try {
            // Capture original URL before any modifications
            if (!req.originalUrl) {
                req.originalUrl = req.url;
            }
            // Store server reference for internal error forwarding
            req._server = this;
            // Use WHATWG URL API instead of deprecated url.parse()
            // Use a dummy base URL since req.url is relative
            const parsedUrl = new URL(req.url || '/', 'http://localhost');
            const pathname = parsedUrl.pathname;
            // Convert URLSearchParams to plain object
            const query = {};
            parsedUrl.searchParams.forEach((value, key) => {
                query[key] = value;
            });
            // Enhance request and response early
            req = this.createRequest(req, {}, query);
            res = this.createResponse(res);
            // Parse cookies
            req.cookies = this.parseCookies(req);
            // parse multipart data
            // Execute middlewares early (including logger) so they run for all requests including 404s
            await this.executeMiddlewares(req, res, pathname);
            // Automatic OPTIONS request handling (CORS preflight)
            if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Content-Length', '0');
                res.end();
                return;
            }
            // Match route early to get parser type
            const route = this.matchRoute(req.method, pathname);
            if (!route) {
                // Avoid infinite loop - don't try to handle error if already on an error route
                if (pathname.includes('/error/')) {
                    res.statusCode = 404;
                    res.end('Not Found');
                    return;
                }
                // Instead of redirecting, internally forward to the error handler
                // This preserves the original URL for logging
                const errorPath = `${this.basePath}/error/404`;
                const errorRoute = this.matchRoute('GET', errorPath);
                if (errorRoute) {
                    // Update request with error route params but keep original URL
                    req.params = errorRoute.params;
                    res.statusCode = 404;
                    // Execute error route handlers
                    await this.executeHandlers(errorRoute.handlers, req, res);
                    return;
                }
                // Fallback if no error route exists
                res.statusCode = 404;
                res.end('Not Found');
                return;
            }
            // Update request with route params
            req.params = route.params;
            // Parse body for POST/PUT/PATCH with route-specific or global parser type
            req.body = {};
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                req.body = await this.parseBody(req, route.parserType);
            }
            // Execute route handlers (middlewares already executed above)
            await this.executeHandlers(route.handlers, req, res);
        }
        catch (error) {
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
    async listen(port, callback) {
        // Step 1: Auto-register services and repositories
        if (!this.servicesRegistered) {
            await this.autoRegister();
            // Auto-register logger singleton for DI
            this.diContainer.registerInstance('logger', loggerSingleton, 'service');
            // Auto-register mailer singleton for DI
            this.diContainer.registerInstance('mailer', mailer, 'service');
            // Auto-register multpartParser singleton for DI
            this.diContainer.registerInstance('multipartParser', new MultipartParser(), 'service');
            // Auto-register fileManager singleton for DI
            this.diContainer.registerInstance('fileManager', new FileManager(), 'service');
            this.servicesRegistered = true;
        }
        // Step 2: Load controllers (AFTER services are registered)
        if (!this.controllersLoaded) {
            await this.loadControllersAsync();
            this.controllersLoaded = true;
        }
        // Step 3: Discover and start scheduler jobs (if enabled)
        if (this.schedulerEnabled && this.scheduler) {
            await this.scheduler.discoverJobs('src/jobs');
            await this.scheduler.start();
        }
        // Step 4: Start the HTTP server
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        return new Promise((resolve) => {
            server.listen(port, () => {
                if (callback)
                    callback();
                resolve(server);
            });
        });
    }
}
export function createServer() {
    return new LyraServer();
}
//# sourceMappingURL=LyraServer.js.map