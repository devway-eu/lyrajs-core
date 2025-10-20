export interface ControllerRouteType {
    ctrlMethod: string;
    routeHttpMethod: string;
    routePathEnd: string;
}
export declare class RoutesGeneratorHelper {
    generateRoutesFile(controllerName: string, controllerRoutes: ControllerRouteType[]): void;
    private getFullRoutesCode;
    private updateRouter;
}
