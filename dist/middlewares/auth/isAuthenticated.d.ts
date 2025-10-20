import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
export declare const isAuthenticated: (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
