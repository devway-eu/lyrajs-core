import { NextFunction, Request, Response } from "../../server/index.js";
import { HttpExceptionType } from "../../types/Errors.js";
export declare const errorHandler: (error: HttpExceptionType, req: Request, res: Response, _next?: NextFunction) => void;
