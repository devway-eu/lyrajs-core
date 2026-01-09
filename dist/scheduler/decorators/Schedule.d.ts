import 'reflect-metadata';
import { ScheduleMetadata } from '../types/SchedulerTypes.js';
/**
 * Method decorator - Marks a method to be executed on a schedule
 * @param {object} options - Schedule configuration
 * @param {string} options.recurrency - Cron expression (e.g., "0 9 * * *" for daily at 9 AM)
 * @param {boolean} [options.enabled=true] - Whether this schedule is enabled
 * @example
 * import { Job, JobBase, Schedule } from '@lyra-js/core';
 *
 * @Job()
 * export class OrderReportJob extends JobBase {
 *     @Schedule({ recurrency: '0 9 * * *', enabled: true })  // Every day at 9 AM
 *     async sendDailyReport() { ... }
 *
 *     @Schedule({ recurrency: '0 0 1 * *', enabled: true })  // First day of each month at midnight
 *     async sendMonthlyReport() { ... }
 *
 *     @Schedule({ recurrency: '0 * * * *', enabled: false })  // Disabled
 *     async sendHourlyReport() { ... }
 * }
 */
export declare function Schedule(options: {
    recurrency: string;
    enabled?: boolean;
}): MethodDecorator;
/**
 * Get schedule metadata for a specific method
 */
export declare function getScheduleMetadata(target: any, methodName: string): ScheduleMetadata | undefined;
/**
 * Get all scheduled methods from a class prototype
 */
export declare function getAllSchedules(target: any): Array<{
    methodName: string | symbol;
} & ScheduleMetadata>;
