import { HTTP_STATUS, HttpStatus } from "@/core/errors/HttpStatus"

/**
 * HttpException class
 * Base exception class for HTTP-related errors
 * Extends native Error with HTTP status code and optional error details
 */
export class HttpException extends Error {
  public status: HttpStatus
  public message: string
  public errors?: Error

  /**
   * Creates a new HttpException
   * @param {string} message - Error message
   * @param {HttpStatus} status - HTTP status code
   * @param {Error} errors - Optional nested error for additional context
   * @example
   * throw new HttpException('Custom error', HTTP_STATUS.BAD_REQUEST)
   */
  constructor(message: string, status: HttpStatus, errors?: Error) {
    super(message)
    this.status = status
    this.message = message
    this.errors = errors
  }
}

/**
 * ValidationException class
 * Thrown when request validation fails (400 Bad Request)
 */
export class ValidationException extends HttpException {
  /**
   * Creates a new ValidationException
   * @param {string} message - Validation error message (default: 'Validation Error')
   * @param {Error} errors - Optional nested error with validation details
   * @example
   * throw new ValidationException('Email format is invalid')
   */
  constructor(message: string = "Validation Error", errors?: Error) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors)
  }
}

/**
 * UnauthorizedException class
 * Thrown when authentication is required but not provided (401 Unauthorized)
 */
export class UnauthorizedException extends HttpException {
  /**
   * Creates a new UnauthorizedException
   * @param {string} message - Authorization error message (default: 'Unauthorized')
   * @param {Error} errors - Optional nested error
   * @example
   * throw new UnauthorizedException('Missing authentication token')
   */
  constructor(message: string = "Unauthorized", errors?: Error) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errors)
  }
}

/**
 * ForbiddenException class
 * Thrown when authenticated user lacks permissions (403 Forbidden)
 */
export class ForbiddenException extends HttpException {
  /**
   * Creates a new ForbiddenException
   * @param {string} message - Forbidden error message (default: 'Forbidden')
   * @param {Error} errors - Optional nested error
   * @example
   * throw new ForbiddenException('Insufficient permissions to access this resource')
   */
  constructor(message: string = "Forbidden", errors?: Error) {
    super(message, HTTP_STATUS.FORBIDDEN, errors)
  }
}

/**
 * NotFoundException class
 * Thrown when a requested resource cannot be found (404 Not Found)
 */
export class NotFoundException extends HttpException {
  /**
   * Creates a new NotFoundException
   * @param {string} resource - Optional resource name to include in error message
   * @example
   * throw new NotFoundException('User')
   * throw new NotFoundException() // Generic "Resource not found"
   */
  constructor(resource?: string) {
    super(resource ? `${resource} not found` : `Resource not found`, HTTP_STATUS.NOT_FOUND)
  }
}

/**
 * MethodNotAllowedException class
 * Thrown when HTTP method is not supported for the endpoint (405 Method Not Allowed)
 */
export class MethodNotAllowedException extends HttpException {
  /**
   * Creates a new MethodNotAllowedException
   * @param {string} message - Error message (default: 'Method Not Allowed')
   * @param {Error} errors - Optional nested error
   * @example
   * throw new MethodNotAllowedException('POST method not allowed on this endpoint')
   */
  constructor(message: string = "Method Not Allowed", errors?: Error) {
    super(message, HTTP_STATUS.METHOD_NOT_ALLOWED, errors)
  }
}

/**
 * InternalServerErrorException class
 * Thrown when an unexpected server error occurs (500 Internal Server Error)
 */
export class InternalServerErrorException extends HttpException {
  /**
   * Creates a new InternalServerErrorException
   * @param {string} message - Error message (default: 'Internal Server Error')
   * @param {Error} errors - Optional nested error with details
   * @example
   * throw new InternalServerErrorException('Database connection failed')
   */
  constructor(message: string = "Internal Server Error", errors?: Error) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errors)
  }
}
