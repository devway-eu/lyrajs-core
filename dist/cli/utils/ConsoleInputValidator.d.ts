export declare class ConsoleInputValidator {
    static patterns: {
        entityName: RegExp;
        controllerName: RegExp;
        propertyName: RegExp;
        routePathEnd: RegExp;
    };
    static isEntityNameValid(input: string): boolean | string;
    static isPropertyNameValid(input: string): boolean | string;
    static isControllerNameValid(input: string): boolean | string;
    static isVarcharLengthValid(input: string): boolean | string;
    static isRoutePathEndValid(input: string): boolean | string;
}
