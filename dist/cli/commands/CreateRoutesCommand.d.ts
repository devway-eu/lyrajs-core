/**
 * CreateRoutesCommand class
 * Generates route files based on controller methods
 * Prompts user to select a controller and configure HTTP methods and paths for each method
 */
export declare class CreateRoutesCommand {
    /**
     * Executes the create routes command
     * Scans controllers, prompts for route configuration, and generates a routes file
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
