import { NextFunction, Request, Response } from "express"

import { Config } from "@/core/config"
import { LyraConsole } from "@/core/console/LyraConsole"
import { HttpException } from "@/core/errors"
import { ErrorResponse, HttpExceptionType } from "@/core/types/Errors"

const isProduction = (): boolean => {
  const apiEnv = new Config().getParam("api_env")
  return apiEnv === "prod" || apiEnv === "production"
}

const getErrorMessage = (error: HttpException): string => {
  if (isProduction() && error.status === 500) {
    return "Internal Server Error"
  }
  return error.message || "An error occurred"
}

const logError = (error: HttpException, req: Request): void => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.path
  const userAgent = req.get("User-Agent") || "unknown"
  const ip = req.ip || req.socket.remoteAddress || "unknown"

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

export const errorHandler = (error: HttpExceptionType, req: Request, res: Response, _next: NextFunction): void => {
  const httpError = error as HttpException
  const status = httpError.status || 500

  logError(httpError, req)

  const errorResponse: ErrorResponse = {
    status,
    message: getErrorMessage(httpError),
    path: req.path,
    timestamp: new Date().toISOString()
  }

  const requestId = req.headers["x-request-id"] as string
  if (requestId) {
    errorResponse.requestId = requestId
  }

  res.status(status).json(errorResponse)
}
