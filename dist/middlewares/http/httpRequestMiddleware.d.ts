import { NextFunction, Request, Response } from "express";
export declare const httpRequestMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
