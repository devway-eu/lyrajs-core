import { RouteInfo } from "../types/index.js";
/**
 * RouterHelper class
 * Utilities for route discovery and management
 * Supports both traditional router folder routes and decorator-based controller routes
 */
export declare class RouterHelper {
    /**
     * Lists all application routes from both traditional and decorator sources
     * Combines routes from router/routes folder and @Route decorated controllers
     * @returns {Promise<RouteInfo[]>} - Array of route information objects
     * @example
     * const routes = await RouterHelper.listRoutes()
     * routes.forEach(route => {
     *   console.log(`${route.httpMethod} ${route.path} -> ${route.controller}`)
     * })
     */
    static listRoutes(): Promise<RouteInfo[]>;
    /**
     * Lists routes from traditional router/routes folder
     * Parses TypeScript route files using regex to extract route definitions
     * @returns {RouteInfo[]} - Array of traditional route information
     * @private
     */
    private static listTraditionalRoutes;
    /**
     * Lists routes from decorator-based controllers
     * Scans controller folder and extracts @Route decorator metadata
     * Uses dynamic import to avoid circular dependencies
     * @returns {Promise<RouteInfo[]>} - Array of decorator route information
     * @private
     */
    private static listDecoratorRoutes;
    /**
     * Extracts route details from route file content using regex
     * Parses Express-style route definitions (.get(), .post(), etc.)
     * @param {string} routesFileContent - Content of route file
     * @returns {Array<string[]>} - Array of [method, path, controller] tuples
     * @private
     */
    private static extractDetailsFromRoutes;
    /**
     * Removes trailing slash from a string
     * @param {string} str - String to process
     * @returns {string} - String without trailing slash
     * @private
     */
    private static removeTrailingSlash;
}
