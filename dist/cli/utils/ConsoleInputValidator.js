/**
 * ConsoleInputValidator class
 * Validates user input for CLI commands
 * Ensures naming conventions and format requirements are met
 */
export class ConsoleInputValidator {
    /**
     * Validates entity name input
     * @param {string} input - Entity name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isEntityNameValid(input) {
        if (!input)
            return "Entity name is required";
        if (!this.patterns.entityName.test(input)) {
            return "Invalid entity name. Entity name must be PascalCase and accept alphabetical characters only.";
        }
        return true;
    }
    /**
     * Validates property name input
     * @param {string} input - Property name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isPropertyNameValid(input) {
        if (!input)
            return "Property name is required";
        if (!this.patterns.propertyName.test(input)) {
            return "Invalid property name. Property name must be snake_case and accept alphabetical characters and underscores only.";
        }
        return true;
    }
    /**
     * Validates controller name input
     * @param {string} input - Controller name to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isControllerNameValid(input) {
        if (!input)
            return "Controller name is required";
        if (!this.patterns.controllerName.test(input)) {
            return "Invalid controller name. Controller name must be PascalCase and accept alphabetical characters only.";
        }
        return true;
    }
    /**
     * Validates varchar length input
     * @param {string} input - Varchar length to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isVarcharLengthValid(input) {
        if (!input)
            return "Varchar length is required";
        if (Number(input) % 1 !== 0)
            return "Varchar length must be an integer";
        if (Number(input) < 1 || Number(input) > 255)
            return "Varchar length must be between 1 and 255";
        return true;
    }
    /**
     * Validates route path end input
     * @param {string} input - Route path end to validate
     * @returns {boolean | string} - True if valid, error message if invalid
     */
    static isRoutePathEndValid(input) {
        if (!input)
            return "Route path is required";
        if (!this.patterns.routePathEnd.test(input)) {
            return "Invalid route path. Route path must start with / and accept alphanumeric characters and special characters (/-_:?=&) only.";
        }
        return true;
    }
}
ConsoleInputValidator.patterns = {
    entityName: /^[A-Z][a-z]*(?:[A-Z][a-z]*)*$/,
    controllerName: /^[A-Z][a-z]*(?:[A-Z][a-z]*)*$/,
    propertyName: /^[a-z]+(_[a-z]+)*$/,
    routePathEnd: /^\/[a-zA-Z0-9\/_:-]*$/
};
//# sourceMappingURL=ConsoleInputValidator.js.map