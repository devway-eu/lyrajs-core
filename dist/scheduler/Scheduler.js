import * as fs from 'fs';
import * as path from 'path';
import { isJob, getJobName } from './decorators/Job.js';
import { getAllSchedules } from './decorators/Schedule.js';
import { CronParser } from './CronParser.js';
import { LyraConsole } from '../console/LyraConsole.js';
/**
 * Writes a scheduler log message to the appropriate log file based on environment
 * Creates the logs directory and log file if they don't exist
 * @param {string} message - Log message to write
 * @returns {void}
 */
function writeSchedulerLogFile(message) {
    try {
        const env = process.env.NODE_ENV || 'dev';
        const logDir = path.join(process.cwd(), 'logs');
        const logFile = env === 'production' || env === 'prod' ? 'scheduler.prod.log' : 'scheduler.dev.log';
        const logPath = path.join(logDir, logFile);
        // Ensure logs directory exists
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        // Ensure log file exists
        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, '', 'utf8');
        }
        // Append log message with newline
        fs.appendFileSync(logPath, message + '\n', 'utf8');
    }
    catch (error) {
        // If file logging fails, log error to console but don't crash the app
        console.error('Failed to write to scheduler log file:', error);
    }
}
/**
 * Scheduler class - Discovers and executes scheduled jobs
 * Integrates with LyraServer's DI container
 */
export class Scheduler {
    constructor(diContainer, options) {
        var _a;
        this.jobs = new Map();
        this.intervals = new Map();
        this.isRunning = false;
        this.diContainer = diContainer;
        this.options = {
            timezone: (options === null || options === void 0 ? void 0 : options.timezone) || 'UTC',
            enabled: (_a = options === null || options === void 0 ? void 0 : options.enabled) !== null && _a !== void 0 ? _a : true
        };
    }
    /**
     * Discover and register job classes from a directory
     * @param {string} jobsPath - Path to jobs directory (default: 'src/jobs')
     */
    async discoverJobs(jobsPath = 'src/jobs') {
        const absolutePath = path.resolve(process.cwd(), jobsPath);
        if (!fs.existsSync(absolutePath)) {
            LyraConsole.warn(`Jobs directory not found: ${jobsPath}`);
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
            }
            catch (error) {
                LyraConsole.error(`Error loading job from ${file}:`, String(error));
            }
        }
    }
    /**
     * Register a single job class
     * @param {Function} JobClass - Job class to register
     */
    async registerJob(JobClass) {
        const jobName = getJobName(JobClass) || JobClass.name;
        // Create instance using new operator (same pattern as Controllers, Services, Repositories)
        const instance = new JobClass();
        // Inject dependencies from DI container
        this.diContainer.injectIntoController(instance);
        // Call lifecycle hook if exists
        if (instance.onInit && typeof instance.onInit === 'function') {
            await instance.onInit();
        }
        // Get all scheduled methods
        const schedules = getAllSchedules(Object.getPrototypeOf(instance));
        const scheduledMethods = schedules.map(s => ({
            jobName,
            methodName: s.methodName,
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
    async start() {
        if (!this.options.enabled) {
            LyraConsole.warn('Scheduler is disabled in options');
            return;
        }
        if (this.isRunning) {
            LyraConsole.warn('Scheduler is already running');
            return;
        }
        this.isRunning = true;
        for (const [jobName, jobInstance] of this.jobs) {
            for (const schedule of jobInstance.scheduledMethods) {
                if (schedule.enabled) {
                    this.scheduleMethod(jobInstance, schedule);
                }
                else {
                    LyraConsole.warn(`Skipping disabled schedule: ${schedule.jobName}.${schedule.methodName}`);
                }
            }
        }
        LyraConsole.print('blue', '', '✓ Scheduler started successfully');
    }
    /**
     * Schedule a single method using cron expression
     */
    scheduleMethod(jobInstance, schedule) {
        const key = `${schedule.jobName}.${schedule.methodName}`;
        try {
            // Validate cron expression
            if (!CronParser.validate(schedule.cronExpression)) {
                LyraConsole.error(`Invalid cron expression for ${key}: ${schedule.cronExpression}`);
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
            }
            else {
                // For complex cron expressions, we need a more sophisticated approach
                // This is a simplified version - in production, use node-cron or similar
                this.scheduleWithCron(jobInstance, schedule);
            }
        }
        catch (error) {
            LyraConsole.error(`Error scheduling ${key}:`, String(error));
        }
    }
    /**
     * Simple interval calculator for basic cron patterns
     * Returns null for complex patterns
     */
    calculateInterval(cronExpression) {
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
    scheduleWithCron(jobInstance, schedule) {
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
    async executeMethod(jobInstance, schedule) {
        const key = `${schedule.jobName}.${schedule.methodName}`;
        try {
            const method = jobInstance.instance[schedule.methodName];
            if (!method || typeof method !== 'function') {
                LyraConsole.error(`Method ${key} not found`);
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
            const logMessage = `[${timestamp}] ${key} completed successfully (${duration}ms)`;
            writeSchedulerLogFile(logMessage);
        }
        catch (error) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${key} failed: ${String(error)}`;
            writeSchedulerLogFile(logMessage);
            LyraConsole.error(`Error executing ${key}:`, String(error));
        }
    }
    /**
     * Stop the scheduler - clears all scheduled intervals
     */
    stop() {
        LyraConsole.info('Stopping scheduler...');
        for (const [key, interval] of this.intervals) {
            clearInterval(interval);
            LyraConsole.info(`Cleared schedule: ${key}`);
        }
        this.intervals.clear();
        this.isRunning = false;
        LyraConsole.success('Scheduler stopped');
    }
    /**
     * Get all registered jobs and their schedules
     */
    getAllSchedules() {
        const allSchedules = [];
        for (const jobInstance of this.jobs.values()) {
            allSchedules.push(...jobInstance.scheduledMethods);
        }
        return allSchedules;
    }
    /**
     * Get schedules for a specific job
     */
    getJobSchedules(jobName) {
        const jobInstance = this.jobs.get(jobName);
        return jobInstance ? jobInstance.scheduledMethods : [];
    }
    /**
     * Recursively get all files with specific extensions from a directory
     */
    getAllFiles(dirPath, extensions) {
        const files = [];
        if (!fs.existsSync(dirPath)) {
            return files;
        }
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath, extensions));
            }
            else if (stat.isFile()) {
                const hasValidExtension = extensions.some(ext => item.endsWith(ext));
                if (hasValidExtension) {
                    files.push(fullPath);
                }
            }
        }
        return files;
    }
}
//# sourceMappingURL=Scheduler.js.map