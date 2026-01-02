import { Container } from '../server/index.js';
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
export class Controller extends Container {
    /**
     * Send 200 OK response with JSON data
     * @param {Response} res - HTTP response object
     * @param {any} data - Response data
     * @returns {void}
     */
    ok(res, data) {
        res.status(200).json(data);
    }
    /**
     * Send 201 Created response with JSON data
     * @param {Response} res - HTTP response object
     * @param {any} data - Response data
     * @returns {void}
     */
    created(res, data) {
        res.status(201).json(data);
    }
    /**
     * Send 204 No Content response
     * @param {Response} res - HTTP response object
     * @returns {void}
     */
    noContent(res) {
        res.status(204).send('');
    }
    /**
     * Send 400 Bad Request response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    badRequest(res, message) {
        res.status(400).json({ error: message });
    }
    /**
     * Send 401 Unauthorized response
     * @param {Response} res - HTTP response object
     * @param {string} [message='Unauthorized'] - Error message
     * @returns {void}
     */
    unauthorized(res, message = 'Unauthorized') {
        res.status(401).json({ error: message });
    }
    /**
     * Send 403 Forbidden response
     * @param {Response} res - HTTP response object
     * @param {string} [message='Forbidden'] - Error message
     * @returns {void}
     */
    forbidden(res, message = 'Forbidden') {
        res.status(403).json({ error: message });
    }
    /**
     * Send 404 Not Found response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    notFound(res, message) {
        res.status(404).json({ error: message });
    }
    /**
     * Send 409 Conflict response
     * @param {Response} res - HTTP response object
     * @param {string} message - Error message
     * @returns {void}
     */
    conflict(res, message) {
        res.status(409).json({ error: message });
    }
    /**
     * Send 422 Unprocessable Entity response
     * @param {Response} res - HTTP response object
     * @param {any} errors - Validation errors
     * @returns {void}
     */
    unprocessableEntity(res, errors) {
        res.status(422).json({ errors });
    }
    /**
     * Send 500 Internal Server Error response
     * @param {Response} res - HTTP response object
     * @param {any} error - Error object
     * @returns {void}
     */
    serverError(res, error) {
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
    respond(res, statusCode, data) {
        res.status(statusCode).json(data);
    }
}
//# sourceMappingURL=Controller.js.map