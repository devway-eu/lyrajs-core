import { NextFunction, Request, Response } from "@/core/server"

import { Config } from "@/core/config"
import { LyraConsole } from "@/core/console/LyraConsole"
import { HttpException } from "@/core/errors"
import { ErrorResponse, HttpExceptionType } from "@/core/types/Errors"

/**
 * Checks if the application is running in production mode
 * @returns {boolean} - True if api_env is 'prod' or 'production'
 * @private
 */
const isProduction = (): boolean => {
  const apiEnv = new Config().getParam("api_env")
  return apiEnv === "prod" || apiEnv === "production"
}

/**
 * Gets the appropriate error message for the client
 * Hides internal server error details in production
 * @param {HttpException} error - The error object
 * @returns {string} - Sanitized error message
 * @private
 */
const getErrorMessage = (error: HttpException): string => {
  if (isProduction() && error.status === 500) {
    return "Internal Server Error"
  }
  return error.message || "An error occurred"
}

/**
 * Logs error details to the console
 * Includes request metadata and stack trace in non-production environments
 * @param {HttpException} error - The error object
 * @param {Request} req - Express request object
 * @private
 */
const logError = (error: HttpException, req: Request): void => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.url || "unknown"
  const userAgent = req.headers["user-agent"] || "unknown"
  const ip = req.socket.remoteAddress || "unknown"

  LyraConsole.error(
    "ERROR",
    `[${timestamp}] ${method} ${path} - ${error.status} - ${error.message}`,
    `User-Agent: ${userAgent}`,
    `IP: ${ip}`
  )

  if (!isProduction() && error.stack) {
    LyraConsole.error("ERROR", `Stack: ${error.stack}`)
  }
}

/**
 * Global error handler middleware
 * Catches all errors thrown in the application and formats them as JSON responses
 * Logs errors with request context and handles production/development differences
 * @param {HttpExceptionType} error - The error object (HttpException or generic error)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @example
 * import { errorHandler } from '@lyra-js/core'
 * app.use(errorHandler) // Must be last middleware
 */
export const errorHandler = (error: HttpExceptionType, req: Request, res: Response, _next?: NextFunction): void => {
  const httpError = error as HttpException
  const status = httpError.status || 500

  logError(httpError, req)

  // Don't send response if headers were already sent
  if (res.headersSent) {
    return
  }

  const errorResponse: ErrorResponse = {
    status,
    message: getErrorMessage(httpError),
    path: req.url || "unknown",
    timestamp: new Date().toISOString()
  }

  const requestId = req.headers["x-request-id"] as string
  if (requestId) {
    errorResponse.requestId = requestId
  }

  res.status(status).json(errorResponse)
}
