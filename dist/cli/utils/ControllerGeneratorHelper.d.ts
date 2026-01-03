/**
 * Type definition for controller configuration object
 */
export interface ControllerObjType {
    name: string;
    type: "Entity based" | "Blank controller with methods" | "Totally blank controller" | null;
    baseEntity: string | null;
    useDecorators: boolean;
}
/**
 * ControllerGeneratorHelper class
 * Generates controller class code based on configuration
 * Supports multiple controller types with or without decorators
 */
export declare class ControllerGeneratorHelper {
    /**
     * Pluralizes a word using simple English rules
     * @param {string} word - Word to pluralize
     * @returns {string} - Pluralized word
     */
    private static pluralize;
    /**
     * Generates complete controller file code based on configuration
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Complete controller code
     * @example
     * // Generate entity-based controller
     * const code = ControllerGeneratorHelper.getFullControllerCode({
     *   name: 'UserController',
     *   type: 'Entity based',
     *   baseEntity: 'User',
     *   useDecorators: true
     * })
     */
    static getFullControllerCode(controller: ControllerObjType): string;
    /**
     * Generates entity-based controller code without decorators
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Controller code
     */
    private static getEntityBaseControllerCode;
    /**
     * Generates blank controller code with CRUD methods but without decorators
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Controller code
     */
    private static getBlankControllerCode;
    /**
     * Generates totally blank controller code with no methods
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Controller code
     */
    private static getTotallyBlankControllerCode;
    /**
     * Generates entity-based controller code with route decorators
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Controller code
     */
    private static getDecoratorEntityBaseControllerCode;
    /**
     * Generates blank controller code with CRUD methods and route decorators
     * @param {ControllerObjType} controller - Controller configuration
     * @returns {string} - Controller code
     */
    private static getDecoratorBlankControllerCode;
}
