/**
 * ConsoleInputValidator class
 * Validates user input for CLI commands
 * Ensures naming conventions and format requirements are met
 */
export declare class ConsoleInputValidator {
    static patterns: {
        entityName: RegExp;
        controllerName: RegExp;
        propertyName: RegExp;
        routePathEnd: RegExp;
    };
    /**
     * Validates entity name input
     * @param {string} input - Entity name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isEntityNameValid(input: string): boolean | string;
    /**
     * Validates property name input
     * @param {string} input - Property name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isPropertyNameValid(input: string): boolean | string;
    /**
     * Validates controller name input
     * @param {string} input - Controller name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isControllerNameValid(input: string): boolean | string;
    /**
     * Validates varchar length input
     * @param {string} input - Varchar length to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isVarcharLengthValid(input: string): boolean | string;
    /**
     * Validates route path end input
     * @param {string} input - Route path end to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isRoutePathEndValid(input: string): boolean | string;
}
