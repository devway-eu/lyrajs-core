/**
 * Helper class for scheduler-related utilities
 * Used by CLI commands to list and inspect scheduled jobs
 */
export declare class SchedulerHelper {
    /**
     * List all scheduled methods from jobs directory
     * @param {string} jobsPath - Path to jobs directory (default: 'src/jobs')
     * @returns {Promise<Array>} - Array of scheduled method information
     */
    static listSchedulers(jobsPath?: string): Promise<Array<{
        scheduler: string;
        description: string;
        enabled: boolean;
    }>>;
    /**
     * Recursively get all files with specific extensions from a directory
     */
    private static getAllFiles;
}
