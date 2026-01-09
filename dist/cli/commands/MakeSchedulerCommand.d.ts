/**
 * MakeSchedulerCommand class
 * Adds a new scheduled method to an existing Job class
 */
export declare class MakeSchedulerCommand {
    /**
     * Executes the make:scheduler command
     * Prompts for job selection, method name, and cron schedule
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    execute(args?: string[]): Promise<void>;
    /**
     * Generates a scheduled method code
     */
    private generateScheduledMethod;
}
