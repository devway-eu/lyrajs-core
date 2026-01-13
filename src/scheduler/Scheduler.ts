import * as fs from 'fs';
import * as path from 'path';
import { Job } from './Job';
import { isJob, getJobName } from './decorators/Job';
import { getAllSchedules } from './decorators/Schedule';
import { JobInstance, ScheduledMethod, SchedulerOptions } from './types/SchedulerTypes';
import { CronParser } from './CronParser';
import { DIContainer } from '@/core/server';
import { logger } from '@/core/logger';

/**
 * Scheduler class - Discovers and executes scheduled jobs
 * Integrates with LyraServer's DI container
 */
export class Scheduler {
    private jobs: Map<string, JobInstance> = new Map();
    private intervals: Map<string, NodeJS.Timeout> = new Map();
    private diContainer: DIContainer;
    private options: SchedulerOptions;
    private isRunning: boolean = false;

    constructor(diContainer: DIContainer, options?: SchedulerOptions) {
        this.diContainer = diContainer;
        this.options = {
            timezone: options?.timezone || 'UTC',
            enabled: options?.enabled ?? true
        };
    }

    /**
     * Discover and register job classes from a directory
     * @param {string} jobsPath - Path to jobs directory (default: 'src/jobs')
     */
    async discoverJobs(jobsPath: string = 'src/jobs'): Promise<void> {
        const absolutePath = path.resolve(process.cwd(), jobsPath);

        if (!fs.existsSync(absolutePath)) {
            logger.warn(`Jobs directory not found: ${jobsPath}`);
            return;
        }

        // Prioritize .ts files (development with tsx/ts-node), otherwise use .js (compiled)
        const tsFiles = this.getAllFiles(absolutePath, ['.ts']);
        const jsFiles = this.getAllFiles(absolutePath, ['.js']);

        // Use .ts files if they exist, otherwise fall back to .js
        const files = tsFiles.length > 0 ? tsFiles : jsFiles;

        for (const file of files) {
            try {
                // Import using file URL (same pattern as Controllers)
                const fileUrl = `file:///${file.replace(/\\/g, '/')}`;
                const module = await import(fileUrl);

                for (const key of Object.keys(module)) {
                    const exportedItem = module[key];

                    if (typeof exportedItem === 'function' && isJob(exportedItem)) {
                        await this.registerJob(exportedItem);
                    }
                }
            } catch (error) {
                logger.error(`Error loading job from ${file}: ${String(error)}`);
            }
        }
    }

    /**
     * Register a single job class
     * @param {Function} JobClass - Job class to register
     */
    async registerJob(JobClass: any): Promise<void> {
        const jobName = getJobName(JobClass) || JobClass.name;

        // Create instance using new operator (same pattern as Controllers, Services, Repositories)
        const instance = new JobClass() as Job;

        // Inject dependencies from DI container
        this.diContainer.injectIntoController(instance);

        // Call lifecycle hook if exists
        if (instance.onInit && typeof instance.onInit === 'function') {
            await instance.onInit();
        }

        // Get all scheduled methods
        const schedules = getAllSchedules(Object.getPrototypeOf(instance));
        const scheduledMethods: ScheduledMethod[] = schedules.map(s => ({
            jobName,
            methodName: s.methodName as string,
            cronExpression: s.recurrency,
            enabled: s.enabled,
            description: CronParser.describe(s.recurrency)
        }));

        // Store job instance
        this.jobs.set(jobName, {
            name: jobName,
            instance,
            scheduledMethods
        });

        // Job registered silently
    }

    /**
     * Start the scheduler - begins executing all enabled schedules
     */
    async start(): Promise<void> {
        if (!this.options.enabled) {
            logger.warn('Scheduler is disabled in options');
            return;
        }

        if (this.isRunning) {
            logger.warn('Scheduler is already running');
            return;
        }

        this.isRunning = true;

        for (const [jobName, jobInstance] of this.jobs) {
            for (const schedule of jobInstance.scheduledMethods) {
                if (schedule.enabled) {
                    this.scheduleMethod(jobInstance, schedule);
                } else {
                    logger.warn(`Skipping disabled schedule: ${schedule.jobName}.${schedule.methodName}`);
                }
            }
        }

        logger.success('✓ Scheduler started successfully');
    }

    /**
     * Schedule a single method using cron expression
     */
    private scheduleMethod(jobInstance: JobInstance, schedule: ScheduledMethod): void {
        const key = `${schedule.jobName}.${schedule.methodName}`;

        try {
            // Validate cron expression
            if (!CronParser.validate(schedule.cronExpression)) {
                logger.error(`Invalid cron expression for ${key}: ${schedule.cronExpression}`);
                return;
            }

            // Calculate interval in milliseconds based on cron
            // For a proper implementation, we should use a cron library
            // For now, we'll use a simple interval-based approach
            const intervalMs = this.calculateInterval(schedule.cronExpression);

            if (intervalMs) {
                const interval = setInterval(async () => {
                    await this.executeMethod(jobInstance, schedule);
                }, intervalMs);

                this.intervals.set(key, interval);
            } else {
                // For complex cron expressions, we need a more sophisticated approach
                // This is a simplified version - in production, use node-cron or similar
                this.scheduleWithCron(jobInstance, schedule);
            }
        } catch (error) {
            logger.error(`Error scheduling ${key}: ${String(error)}`);
        }
    }

    /**
     * Simple interval calculator for basic cron patterns
     * Returns null for complex patterns
     */
    private calculateInterval(cronExpression: string): number | null {
        const parts = cronExpression.trim().split(/\s+/);
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // Every minute: "* * * * *"
        if (parts.every(p => p === '*')) {
            return 60 * 1000; // 1 minute
        }

        // Every N minutes: "*/N * * * *"
        if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            const interval = parseInt(minute.split('/')[1], 10);
            return interval * 60 * 1000;
        }

        // Every hour: "0 * * * *" (at minute 0)
        if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return 60 * 60 * 1000; // 1 hour
        }

        // Complex pattern - needs proper cron scheduling
        return null;
    }

    /**
     * Schedule with proper cron timing (checks every minute)
     * For production, consider using 'node-cron' package
     */
    private scheduleWithCron(jobInstance: JobInstance, schedule: ScheduledMethod): void {
        const key = `${schedule.jobName}.${schedule.methodName}`;

        // Check every minute if it's time to run
        const interval = setInterval(async () => {
            const now = new Date();
            const next = CronParser.getNextExecution(schedule.cronExpression, new Date(now.getTime() - 60000));

            // If next execution is within the current minute, execute
            if (next.getTime() <= now.getTime() && next.getTime() > now.getTime() - 60000) {
                await this.executeMethod(jobInstance, schedule);
            }
        }, 60 * 1000); // Check every minute

        this.intervals.set(key, interval);
    }

    /**
     * Execute a scheduled method
     */
    private async executeMethod(jobInstance: JobInstance, schedule: ScheduledMethod): Promise<void> {
        const key = `${schedule.jobName}.${schedule.methodName}`;

        try {
            const method = jobInstance.instance[schedule.methodName];

            if (!method || typeof method !== 'function') {
                logger.error(`Method ${key} not found`);
                return;
            }

            const startTime = Date.now();
            const timestamp = new Date().toISOString();

            // Call beforeExecute lifecycle hook if exists
            if (jobInstance.instance.beforeExecute && typeof jobInstance.instance.beforeExecute === 'function') {
                await jobInstance.instance.beforeExecute();
            }

            // Execute the scheduled method
            await method.call(jobInstance.instance);

            // Call afterExecute lifecycle hook if exists
            if (jobInstance.instance.afterExecute && typeof jobInstance.instance.afterExecute === 'function') {
                await jobInstance.instance.afterExecute();
            }

            const duration = Date.now() - startTime;
            logger.info(`[SCHEDULER] ${key} completed successfully (${duration}ms)`);
        } catch (error) {
            logger.error(`[SCHEDULER] ${key} failed: ${String(error)}`);
        }
    }

    /**
     * Stop the scheduler - clears all scheduled intervals
     */
    stop(): void {
        logger.info('Stopping scheduler...');

        for (const [key, interval] of this.intervals) {
            clearInterval(interval);
            logger.info(`Cleared schedule: ${key}`);
        }

        this.intervals.clear();
        this.isRunning = false;

        logger.success('Scheduler stopped');
    }

    /**
     * Get all registered jobs and their schedules
     */
    getAllSchedules(): ScheduledMethod[] {
        const allSchedules: ScheduledMethod[] = [];

        for (const jobInstance of this.jobs.values()) {
            allSchedules.push(...jobInstance.scheduledMethods);
        }

        return allSchedules;
    }

    /**
     * Get schedules for a specific job
     */
    getJobSchedules(jobName: string): ScheduledMethod[] {
        const jobInstance = this.jobs.get(jobName);
        return jobInstance ? jobInstance.scheduledMethods : [];
    }

    /**
     * Recursively get all files with specific extensions from a directory
     */
    private getAllFiles(dirPath: string, extensions: string[]): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dirPath)) {
            return files;
        }

        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath, extensions));
            } else if (stat.isFile()) {
                const hasValidExtension = extensions.some(ext => item.endsWith(ext));
                if (hasValidExtension) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }
}
