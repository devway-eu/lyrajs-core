import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/index.js";
export declare const isAdmin: (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
