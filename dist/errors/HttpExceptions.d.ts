import { HttpStatus } from "../errors/HttpStatus.js";
export declare class HttpException extends Error {
    status: HttpStatus;
    message: string;
    errors?: Error;
    constructor(message: string, status: HttpStatus, errors?: Error);
}
export declare class ValidationException extends HttpException {
    constructor(message?: string, errors?: Error);
}
export declare class UnauthorizedException extends HttpException {
    constructor(message?: string, errors?: Error);
}
export declare class ForbiddenException extends HttpException {
    constructor(message?: string, errors?: Error);
}
export declare class NotFoundException extends HttpException {
    constructor(resource?: string);
}
export declare class MethodNotAllowedException extends HttpException {
    constructor(message?: string, errors?: Error);
}
export declare class InternalServerErrorException extends HttpException {
    constructor(message?: string, errors?: Error);
}
