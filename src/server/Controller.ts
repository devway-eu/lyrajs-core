import { Response, Container } from '@/core/server';

/**
 * Abstract base Controller class with dependency injection and HTTP response helpers
 * @example
 * @Route({ path: '/users' })
 * class UserController extends Controller {
 *     @Get('/all')
 *     async getAllUsers(req, res, next) {
 *         const users = await this.services.userService.getUsers();
 *         this.ok(res, users);
 *     }
 * }
 */
export abstract class Controller extends Container {

    /**
     * Send 200 OK response with JSON data
     * @param {Response} res - HTTP response object
     * @param {any} data - Response data
     * @returns {void}
     */
    protected ok(res: Response, data: any): void {
        res.status(200).json(data);
    }

    /**
     * Send 201 Created response with JSON data
     * @param {Response} res - HTTP response object
     * @param {any} data - Response data
     * @returns {void}
     */
    protected created(res: Response, data: any): void {
        res.status(201).json(data);
    }

    /**
     * Send 204 No Content response
     * @param {Response} res - HTTP response object
     * @returns {void}
     */
    protected noContent(res: Response): void {
        res.status(204).send('');
    }

    /**
     * Send 400 Bad Request response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    protected badRequest(res: Response, message: string): void {
        res.status(400).json({ error: message });
    }

    /**
     * Send 401 Unauthorized response
     * @param {Response} res - HTTP response object
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {void}
     */
    protected unauthorized(res: Response, message: string = 'Unauthorized'): void {
        res.status(401).json({ error: message });
    }

    /**
     * Send 403 Forbidden response
     * @param {Response} res - HTTP response object
     * @param {string} [message='Forbidden'] - Error message
     * @returns {void}
     */
    protected forbidden(res: Response, message: string = 'Forbidden'): void {
        res.status(403).json({ error: message });
    }

    /**
     * Send 404 Not Found response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    protected notFound(res: Response, message: string): void {
        res.status(404).json({ error: message });
    }

    /**
     * Send 409 Conflict response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    protected conflict(res: Response, message: string): void {
        res.status(409).json({ error: message });
    }

    /**
     * Send 422 Unprocessable Entity response
     * @param {Response} res - HTTP response object
     * @param {any} errors - Validation errors
     * @returns {void}
     */
    protected unprocessableEntity(res: Response, errors: any): void {
        res.status(422).json({ errors });
    }

    /**
     * Send 500 Internal Server Error response
     * @param {Response} res - HTTP response object
     * @param {any} error - Error object
     * @returns {void}
     */
    protected serverError(res: Response, error: any): void {
        const message = error?.message || 'Internal Server Error';
        res.status(500).json({ error: message });
    }

    /**
     * Send custom status code with JSON data
     * @param {Response} res - HTTP response object
     * @param {number} statusCode - HTTP status code
     * @param {any} data - Response data
     * @returns {void}
     */
    protected respond(res: Response, statusCode: number, data: any): void {
        res.status(statusCode).json(data);
    }
}
