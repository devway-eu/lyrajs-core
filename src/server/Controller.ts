import { Request, Response, Container, NextFunction } from '@/core/server';
import { TemplateRenderer } from '@/core/ssr';
import { HTTP_STATUS } from '@/core/errors';

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
export abstract class Controller extends Container {
    /**
     * HTTP Request object (automatically injected)
     */
    protected req!: Request

    /**
     * HTTP Response object (automatically injected)
     */
    protected res!: Response

    /**
     * Next function for middleware chain (automatically injected)
     */
    protected next!: NextFunction

    /**
     * Send 200 OK response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    protected ok(data: any): void {
        this.res.status(HTTP_STATUS.OK).json(data);
    }

    /**
     * Send 201 Created response with JSON data
     * @param {any} data - Response data
     * @returns {void}
     */
    protected created(data: any): void {
        this.res.status(HTTP_STATUS.CREATED).json(data);
    }

    /**
     * Send 204 No Content response
     * @returns {void}
     */
    protected noContent(): void {
        this.res.status(HTTP_STATUS.NO_CONTENT).send('');
    }

    /**
     * Send 400 Bad Request response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected badRequest(message: string): void {
        this.res.status(HTTP_STATUS.BAD_REQUEST).json({ error: message });
    }

    /**
     * Send 401 Unauthorized response
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {void}
     */
    protected unauthorized(message: string = 'Unauthorized'): void {
        this.res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: message });
    }

    /**
     * Send 403 Forbidden response
     * @param {string} [message='Forbidden'] - Error message
     * @returns {void}
     */
    protected forbidden(message: string = 'Forbidden'): void {
        this.res.status(HTTP_STATUS.FORBIDDEN).json({ error: message });
    }

    /**
     * Send 404 Not Found response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected notFound(message: string): void {
        this.res.status(HTTP_STATUS.NOT_FOUND).json({ error: message });
    }

    /**
     * Send 409 Conflict response
     * @param {string} message - Error message
     * @returns {void}
     */
    protected conflict(message: string): void {
        this.res.status(HTTP_STATUS.CONFLICT).json({ error: message });
    }

    /**
     * Send 422 Unprocessable Entity response
     * @param {any} errors - Validation errors
     * @returns {void}
     */
    protected unprocessableEntity(errors: any): void {
        this.res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors });
    }

    /**
     * Send 500 Internal Server Error response
     * @param {any} error - Error object
     * @returns {void}
     */
    protected serverError(error: any): void {
        const message = error?.message || 'Internal Server Error';
        this.res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
    }

    /**
     * Send custom status code with JSON data
     * @param {number} statusCode - HTTP status code
     * @param {any} data - Response data
     * @returns {void}
     */
    protected respond(statusCode: number, data: any): void {
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
    protected async render(template: string, data: object = {}): Promise<void> {
        const renderer = TemplateRenderer.getInstance();

        if (!renderer.isConfigured()) {
            throw new Error(
                'SSR is not configured. Please configure SSR using app.setSetting("ssr", { engine: "ejs", templates: "./templates" })'
            );
        }

        try {
            const html = await renderer.render(template, data);
            this.res.setHeader('Content-Type', 'text/html');
            this.res.status(HTTP_STATUS.OK).send(html);
        } catch (error: any) {
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
    protected redirect(url: string, statusCode: number = 302): void {
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
    protected redirectToPath(path: string, statusCode: number = 302): void {
        this.res.redirect(statusCode, path);
    }
}
