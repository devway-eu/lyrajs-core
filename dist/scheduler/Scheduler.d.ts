import { ScheduledMethod, SchedulerOptions } from './types/SchedulerTypes.js';
import { DIContainer } from '../server/index.js';
/**
 * Scheduler class - Discovers and executes scheduled jobs
 * Integrates with LyraServer's DI container
 */
export declare class Scheduler {
    private jobs;
    private intervals;
    private diContainer;
    private options;
    private isRunning;
    constructor(diContainer: DIContainer, options?: SchedulerOptions);
    /**
     * Discover and register job classes from a directory
     * @param {string} jobsPath - Path to jobs directory (default: 'src/jobs')
     */
    discoverJobs(jobsPath?: string): Promise<void>;
    /**
     * Register a single job class
     * @param {Function} JobClass - Job class to register
     */
    registerJob(JobClass: any): Promise<void>;
    /**
     * Start the scheduler - begins executing all enabled schedules
     */
    start(): Promise<void>;
    /**
     * Schedule a single method using cron expression
     */
    private scheduleMethod;
    /**
     * Simple interval calculator for basic cron patterns
     * Returns null for complex patterns
     */
    private calculateInterval;
    /**
     * Schedule with proper cron timing (checks every minute)
     * For production, consider using 'node-cron' package
     */
    private scheduleWithCron;
    /**
     * Execute a scheduled method
     */
    private executeMethod;
    /**
     * Stop the scheduler - clears all scheduled intervals
     */
    stop(): void;
    /**
     * Get all registered jobs and their schedules
     */
    getAllSchedules(): ScheduledMethod[];
    /**
     * Get schedules for a specific job
     */
    getJobSchedules(jobName: string): ScheduledMethod[];
    /**
     * Recursively get all files with specific extensions from a directory
     */
    private getAllFiles;
}
