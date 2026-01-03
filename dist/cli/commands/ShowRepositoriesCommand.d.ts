/**
 * ShowRepositoriesCommand class
 * Lists all repositories found in the project's repository folder
 * Displays repository names and their file paths
 */
export declare class ShowRepositoriesCommand {
    /**
     * Executes the show repositories command
     * Scans the repository folder and displays all repository files
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
}
