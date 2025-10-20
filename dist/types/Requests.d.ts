import { Request } from "express";
import { Entity } from "../orm/index.js";
import { StdObject } from "../types/StandardTypes.js";
import { User } from "../loader/index.js";
export interface AuthenticatedRequest<T extends object> extends Request {
    originalUrl: string;
    cookies: {
        [key: string]: string;
    };
    user?: typeof User | Entity<T> | StdObject;
}
