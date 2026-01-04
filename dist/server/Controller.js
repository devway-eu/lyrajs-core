import { Container } from '../server/index.js';
import { TemplateRenderer } from '../ssr/index.js';
import { HTTP_STATUS } from '../errors/index.js';
/**
 * Abstract base Controller class with dependency injection and HTTP response helpers
 * Request and response objects are automatically injected and available as this.req and this.res
 * @example
 * @Route({ path: '/users' })
 * class UserController extends Controller {
 *     @Get('/all')
 *     async getAllUsers() {
 *         const users = await this.userService.getUsers();
 *         this.ok(users);
 *     }
 * }
 */
export class Controller extends Container {
    /**
     * HTTP Request object (automatically injected)
     */
    req;
    /**
     * HTTP Response object (automatically injected)
     */
    res;
    /**
     * Next function for middleware chain (automatically injected)
     */
    next;
    /**
     * Send 200 OK response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    ok(data) {
        this.res.status(HTTP_STATUS.OK).json(data);
    }
    /**
     * Send 201 Created response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    created(data) {
        this.res.status(HTTP_STATUS.CREATED).json(data);
    }
    /**
     * Send 204 No Content response
     * @returns {void}
     */
    noContent() {
        this.res.status(HTTP_STATUS.NO_CONTENT).send('');
    }
    /**
     * Send 400 Bad Request response
     * @param {string} message - Error message
     * @returns {void}
     */
    badRequest(message) {
        this.res.status(HTTP_STATUS.BAD_REQUEST).json({ error: message });
    }
    /**
     * Send 401 Unauthorized response
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {void}
     */
    unauthorized(message = 'Unauthorized') {
        this.res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: message });
    }
    /**
     * Send 403 Forbidden response
     * @param {string} [message='Forbidden'] - Error message
     * @returns {void}
     */
    forbidden(message = 'Forbidden') {
        this.res.status(HTTP_STATUS.FORBIDDEN).json({ error: message });
    }
    /**
     * Send 404 Not Found response
     * @param {string} message - Error message
     * @returns {void}
     */
    notFound(message) {
        this.res.status(HTTP_STATUS.NOT_FOUND).json({ error: message });
    }
    /**
     * Send 409 Conflict response
     * @param {string} message - Error message
     * @returns {void}
     */
    conflict(message) {
        this.res.status(HTTP_STATUS.CONFLICT).json({ error: message });
    }
    /**
     * Send 422 Unprocessable Entity response
     * @param {any} errors - Validation errors
     * @returns {void}
     */
    unprocessableEntity(errors) {
        this.res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors });
    }
    /**
     * Send 500 Internal Server Error response
     * @param {any} error - Error object
     * @returns {void}
     */
    serverError(error) {
        const message = error?.message || 'Internal Server Error';
        this.res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
    }
    /**
     * Send custom status code with JSON data
     * @param {number} statusCode - HTTP status code
     * @param {any} data - Response data
     * @returns {void}
     */
    respond(statusCode, data) {
        this.res.status(statusCode).json(data);
    }
    /**
     * Render a template with server-side rendering (SSR)
     * Requires SSR to be configured in LyraServer settings
     * @param {string} template - Template path (relative to templates directory)
     * @param {object} data - Data to pass to the template
     * @returns {Promise<void>}
     * @throws {Error} - If SSR is not configured or template engine is not installed
     * @example
     * // Configure SSR in server setup:
     * app.setSetting('ssr', { engine: 'ejs', templates: './templates' })
     *
     * // Use in controller:
     * await this.render('pages/home.ejs', { title: 'Welcome', user: this.req.user })
     */
    async render(template, data = {}) {
        const renderer = TemplateRenderer.getInstance();
        if (!renderer.isConfigured()) {
            throw new Error('SSR is not configured. Please configure SSR using app.setSetting("ssr", { engine: "ejs", templates: "./templates" })');
        }
        try {
            const html = await renderer.render(template, data);
            this.res.setHeader('Content-Type', 'text/html');
            this.res.status(HTTP_STATUS.OK).send(html);
        }
        catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }
    /**
     * Redirect to a URL
     * @param {string} url - The URL to redirect to
     * @param {number} [statusCode=302] - HTTP redirect status code (default: 302 Found)
     * @returns {void}
     * @example
     * this.redirect('https://example.com')
     * this.redirect('https://example.com/page', 301)
     */
    redirect(url, statusCode = 302) {
        this.res.redirect(statusCode, url);
    }
    /**
     * Redirect to a route path
     * @param {string} path - The route path to redirect to
     * @param {number} [statusCode=302] - HTTP redirect status code (default: 302 Found)
     * @returns {void}
     * @example
     * this.redirectToPath('/users')
     * this.redirectToPath('/users/123', 301)
     */
    redirectToPath(path, statusCode = 302) {
        this.res.redirect(statusCode, path);
    }
}
//# sourceMappingURL=Controller.js.map