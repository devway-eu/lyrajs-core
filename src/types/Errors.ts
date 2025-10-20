import {
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ValidationException
} from "@/core/errors"

export type HttpExceptionType =
  | HttpException
  | UnauthorizedException
  | ForbiddenException
  | NotFoundException
  | ValidationException
  | InternalServerErrorException
  | Error

export interface ErrorResponse {
  status: number
  message: string
  path?: string
  timestamp?: string
  requestId?: string
}
