/**
 * Type definition for controller route configuration
 */
export interface ControllerRouteType {
    ctrlMethod: string;
    routeHttpMethod: string;
    routePathEnd: string;
}
/**
 * RoutesGeneratorHelper class
 * Generates route files for controllers
 * Creates route configuration files and updates the main routes index
 */
export declare class RoutesGeneratorHelper {
    /**
     * Generates a routes file for a controller
     * @param {string} controllerName - Name of the controller
     * @param {ControllerRouteType[]} controllerRoutes - Array of route configurations
     * @returns {void}
     */
    generateRoutesFile(controllerName: string, controllerRoutes: ControllerRouteType[]): void;
    /**
     * Generates complete routes file code
     * @param {string} controllerName - Name of the controller
     * @param {ControllerRouteType[]} controllerRoutes - Array of route configurations
     * @returns {string} - Complete routes file content
     */
    private getFullRoutesCode;
    /**
     * Updates the main routes index file with all route files
     * Scans route files and regenerates the index file
     * @returns {void}
     */
    private updatecreateRouter;
}
