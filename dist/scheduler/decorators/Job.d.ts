import 'reflect-metadata';
/**
 * Job class decorator - Marks a class as a schedulable job
 * @param {string} [name] - Optional custom job name (defaults to class name)
 * @example
 * import { Job, JobBase, Schedule } from '@lyra-js/core';
 *
 * @Job()
 * export class OrderReportJob extends JobBase {
 *     @Schedule({ recurrency: '0 9 * * *', enabled: true })
 *     async sendDailyReport() { ... }
 * }
 */
export declare function Job(name?: string): ClassDecorator;
/**
 * Check if a class is decorated with @Job
 */
export declare function isJob(target: Function): boolean;
/**
 * Get the job name from metadata
 */
export declare function getJobName(target: Function): string | undefined;
