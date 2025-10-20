import jwt from "jsonwebtoken";
import { ProtectedRouteType } from "../types/index.js";
import { User } from "../loader/index.js";
export declare class AccessControl {
    static getRoleMap(): Record<string, Set<string>>;
    static isRouteProtected(routePath: string): boolean;
    static canAccessRoute(user: typeof User, route: ProtectedRouteType): Promise<boolean>;
    static decodeToken(token: string): Promise<jwt.JwtPayload>;
    static isTokenValid(token: string): jwt.JwtPayload;
    static checkRefreshTokenValid(refreshToken: string): void;
    static getNewToken(user: typeof User): Promise<string>;
    static getNewRefreshToken(user: typeof User): Promise<string>;
}
