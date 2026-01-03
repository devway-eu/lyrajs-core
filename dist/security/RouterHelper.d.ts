import { RouteInfo } from "../types/index.js";
export declare class RouterHelper {
    static listRoutes(): Promise<RouteInfo[]>;
    private static listTraditionalRoutes;
    private static listDecoratorRoutes;
    private static extractDetailsFromRoutes;
    private static removeTrailingSlash;
}
