import { NextFunction, Request, Response } from "../../server/index.js";
export declare const accessMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
