import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
export declare const accessMiddleware: (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => Promise<void>;
