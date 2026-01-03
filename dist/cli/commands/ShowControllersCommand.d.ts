/**
 * ShowControllersCommand class
 * Lists all controllers found in the project's controller folder
 * Displays controller names and their file paths
 */
export declare class ShowControllersCommand {
    /**
     * Executes the show controllers command
     * Scans the controller folder and displays all controller files
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
