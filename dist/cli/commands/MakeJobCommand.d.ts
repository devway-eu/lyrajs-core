/**
 * MakeJobCommand class
 * Generates new Job classes for scheduler
 * Creates job classes that extend the base Job class
 */
export declare class MakeJobCommand {
    /**
     * Executes the make:job command
     * Prompts for job name and generates a new job file
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    execute(args?: string[]): Promise<void>;
    /**
     * Generates job file content
     * @param {string} className - Name of the job class
     * @returns {string} - Generated job file content
     */
    private generateJobFile;
}
