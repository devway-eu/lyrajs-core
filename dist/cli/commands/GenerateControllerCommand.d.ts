/**
 * GenerateControllerCommand class
 * Generates controller files based on user preferences
 * Supports entity-based controllers, blank controllers with methods, or totally blank controllers
 * Can generate controllers with or without route decorators
 */
export declare class GenerateControllerCommand {
    /**
     * Executes the generate controller command
     * Prompts for controller type and configuration, then generates the controller file
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
