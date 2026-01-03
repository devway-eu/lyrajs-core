import { HttpStatus } from "../errors/HttpStatus.js";
/**
 * HttpException class
 * Base exception class for HTTP-related errors
 * Extends native Error with HTTP status code and optional error details
 */
export declare class HttpException extends Error {
    status: HttpStatus;
    message: string;
    errors?: Error;
    /**
     * Creates a new HttpException
     * @param {string} message - Error message
     * @param {HttpStatus} status - HTTP status code
     * @param {Error} errors - Optional nested error for additional context
     * @example
     * throw new HttpException('Custom error', HTTP_STATUS.BAD_REQUEST)
     */
    constructor(message: string, status: HttpStatus, errors?: Error);
}
/**
 * ValidationException class
 * Thrown when request validation fails (400 Bad Request)
 */
export declare class ValidationException extends HttpException {
    /**
     * Creates a new ValidationException
     * @param {string} message - Validation error message (default: 'Validation Error')
     * @param {Error} errors - Optional nested error with validation details
     * @example
     * throw new ValidationException('Email format is invalid')
     */
    constructor(message?: string, errors?: Error);
}
/**
 * UnauthorizedException class
 * Thrown when authentication is required but not provided (401 Unauthorized)
 */
export declare class UnauthorizedException extends HttpException {
    /**
     * Creates a new UnauthorizedException
     * @param {string} message - Authorization error message (default: 'Unauthorized')
     * @param {Error} errors - Optional nested error
     * @example
     * throw new UnauthorizedException('Missing authentication token')
     */
    constructor(message?: string, errors?: Error);
}
/**
 * ForbiddenException class
 * Thrown when authenticated user lacks permissions (403 Forbidden)
 */
export declare class ForbiddenException extends HttpException {
    /**
     * Creates a new ForbiddenException
     * @param {string} message - Forbidden error message (default: 'Forbidden')
     * @param {Error} errors - Optional nested error
     * @example
     * throw new ForbiddenException('Insufficient permissions to access this resource')
     */
    constructor(message?: string, errors?: Error);
}
/**
 * NotFoundException class
 * Thrown when a requested resource cannot be found (404 Not Found)
 */
export declare class NotFoundException extends HttpException {
    /**
     * Creates a new NotFoundException
     * @param {string} resource - Optional resource name to include in error message
     * @example
     * throw new NotFoundException('User')
     * throw new NotFoundException() // Generic "Resource not found"
     */
    constructor(resource?: string);
}
/**
 * MethodNotAllowedException class
 * Thrown when HTTP method is not supported for the endpoint (405 Method Not Allowed)
 */
export declare class MethodNotAllowedException extends HttpException {
    /**
     * Creates a new MethodNotAllowedException
     * @param {string} message - Error message (default: 'Method Not Allowed')
     * @param {Error} errors - Optional nested error
     * @example
     * throw new MethodNotAllowedException('POST method not allowed on this endpoint')
     */
    constructor(message?: string, errors?: Error);
}
/**
 * InternalServerErrorException class
 * Thrown when an unexpected server error occurs (500 Internal Server Error)
 */
export declare class InternalServerErrorException extends HttpException {
    /**
     * Creates a new InternalServerErrorException
     * @param {string} message - Error message (default: 'Internal Server Error')
     * @param {Error} errors - Optional nested error with details
     * @example
     * throw new InternalServerErrorException('Database connection failed')
     */
    constructor(message?: string, errors?: Error);
}
