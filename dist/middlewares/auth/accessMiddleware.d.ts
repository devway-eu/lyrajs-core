import { NextFunction, Request, Response } from "../../server/index.js";
import { AuthenticatedRequest } from "../../types/index.js";
export declare const accessMiddleware: (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => Promise<void>;
