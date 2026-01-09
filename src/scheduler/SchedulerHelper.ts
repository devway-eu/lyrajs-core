import fs from 'fs';
import path from 'path';
import { isJob, getJobName } from './decorators/Job';
import { getAllSchedules } from './decorators/Schedule';
import { CronParser } from './CronParser';

/**
 * Helper class for scheduler-related utilities
 * Used by CLI commands to list and inspect scheduled jobs
 */
export class SchedulerHelper {
    /**
     * List all scheduled methods from jobs directory
     * @param {string} jobsPath - Path to jobs directory (default: 'src/jobs')
     * @returns {Promise<Array>} - Array of scheduled method information
     */
    static async listSchedulers(jobsPath: string = 'src/jobs'): Promise<Array<{
        scheduler: string;
        description: string;
        enabled: boolean;
    }>> {
        const absolutePath = path.resolve(process.cwd(), jobsPath);

        if (!fs.existsSync(absolutePath)) {
            return [];
        }

        const files = this.getAllFiles(absolutePath, ['.ts', '.js']);
        const schedulers: Array<{ scheduler: string; description: string; enabled: boolean }> = [];

        for (const file of files) {
            try {
                const fileUrl = `file:///${file.replace(/\\/g, '/')}`;
                const module = await import(fileUrl);

                for (const key of Object.keys(module)) {
                    const exportedItem = module[key];

                    if (typeof exportedItem === 'function' && isJob(exportedItem)) {
                        const jobName = getJobName(exportedItem) || exportedItem.name;
                        const instance = new exportedItem();
                        const schedules = getAllSchedules(Object.getPrototypeOf(instance));

                        for (const schedule of schedules) {
                            schedulers.push({
                                scheduler: `${jobName}.${String(schedule.methodName)}()`,
                                description: CronParser.describe(schedule.recurrency),
                                enabled: schedule.enabled
                            });
                        }
                    }
                }
            } catch (error) {
                // Skip files that can't be imported
            }
        }

        return schedulers;
    }

    /**
     * Recursively get all files with specific extensions from a directory
     */
    private static getAllFiles(dirPath: string, extensions: string[]): string[] {
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
