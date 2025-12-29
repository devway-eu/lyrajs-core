import { HTTP_STATUS, HttpStatus } from "@/core/errors/HttpStatus"

export class HttpException extends Error {
  public status: HttpStatus
  public message: string
  public errors?: Error

  constructor(message: string, status: HttpStatus, errors?: Error) {
    super(message)
    this.status = status
    this.message = message
    this.errors = errors
  }
}

export class ValidationException extends HttpException {
  constructor(message: string = "Validation Error", errors?: Error) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors)
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized", errors?: Error) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errors)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden", errors?: Error) {
    super(message, HTTP_STATUS.FORBIDDEN, errors)
  }
}

export class NotFoundException extends HttpException {
  constructor(resource?: string) {
    super(resource ? `${resource} not found` : `Resource not found`, HTTP_STATUS.NOT_FOUND)
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message: string = "Method Not Allowed", errors?: Error) {
    super(message, HTTP_STATUS.METHOD_NOT_ALLOWED, errors)
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal Server Error", errors?: Error) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errors)
  }
}
