import { Request, Response, Container, NextFunction } from '../server/index.js';
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
export declare abstract class Controller extends Container {
    /**
     * HTTP Request object (automatically injected)
     */
    protected req: Request;
    /**
     * HTTP Response object (automatically injected)
     */
    protected res: Response;
    /**
     * Next function for middleware chain (automatically injected)
     */
    protected next: NextFunction;
    /**
     * Send 200 OK response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    protected ok(data: any): void;
    /**
     * Send 201 Created response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    protected created(data: any): void;
    /**
     * Send 204 No Content response
     * @returns {void}
     */
    protected noContent(): void;
    /**
     * Send 400 Bad Request response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected badRequest(message: string): void;
    /**
     * Send 401 Unauthorized response
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {void}
     */
    protected unauthorized(message?: string): void;
    /**
     * Send 403 Forbidden response
     * @param {string} [message='Forbidden'] - Error message
     * @returns {void}
     */
    protected forbidden(message?: string): void;
    /**
     * Send 404 Not Found response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected notFound(message: string): void;
    /**
     * Send 409 Conflict response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected conflict(message: string): void;
    /**
     * Send 422 Unprocessable Entity response
     * @param {any} errors - Validation errors
     * @returns {void}
     */
    protected unprocessableEntity(errors: any): void;
    /**
     * Send 500 Internal Server Error response
     * @param {any} error - Error object
     * @returns {void}
     */
    protected serverError(error: any): void;
    /**
     * Send custom status code with JSON data
     * @param {number} statusCode - HTTP status code
     * @param {any} data - Response data
     * @returns {void}
     */
    protected respond(statusCode: number, data: any): void;
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
    protected render(template: string, data?: object): Promise<void>;
    /**
     * Redirect to a URL
     * @param {string} url - The URL to redirect to
     * @param {number} [statusCode=302] - HTTP redirect status code (default: 302 Found)
     * @returns {void}
     * @example
     * this.redirect('https://example.com')
     * this.redirect('https://example.com/page', 301)
     */
    protected redirect(url: string, statusCode?: number): void;
    /**
     * Redirect to a route path
     * @param {string} path - The route path to redirect to
     * @param {number} [statusCode=302] - HTTP redirect status code (default: 302 Found)
     * @returns {void}
     * @example
     * this.redirectToPath('/users')
     * this.redirectToPath('/users/123', 301)
     */
    protected redirectToPath(path: string, statusCode?: number): void;
}
