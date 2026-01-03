import {
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ValidationException
} from "@/core/errors"

/**
 * Union type of all HTTP exception types
 * Includes all custom HTTP exceptions plus generic Error
 */
export type HttpExceptionType =
  | HttpException
  | UnauthorizedException
  | ForbiddenException
  | NotFoundException
  | ValidationException
  | InternalServerErrorException
  | Error

/**
 * Error response structure for HTTP error responses
 * Standardized format returned by error handler middleware
 */
export interface ErrorResponse {
  /** HTTP status code */
  status: number
  /** Error message */
  message: string
  /** Request path where error occurred */
  path?: string
  /** ISO timestamp of error */
  timestamp?: string
  /** Unique request identifier for tracking */
  requestId?: string
}
