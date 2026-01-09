import 'reflect-metadata';
import { ScheduleMetadata } from '../types/SchedulerTypes';

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
export function Schedule(options: {
    recurrency: string;
    enabled?: boolean;
}): MethodDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const metadata: ScheduleMetadata = {
            recurrency: options.recurrency,
            enabled: options.enabled ?? true
        };

        // Store schedule metadata for this method
        Reflect.defineMetadata('scheduler:schedule', metadata, target, propertyKey);

        // Also store in a list on the class prototype for easy discovery
        const existingSchedules = Reflect.getMetadata('scheduler:schedules', target) || [];
        existingSchedules.push({
            methodName: propertyKey,
            ...metadata
        });
        Reflect.defineMetadata('scheduler:schedules', existingSchedules, target);
    };
}

/**
 * Get schedule metadata for a specific method
 */
export function getScheduleMetadata(target: any, methodName: string): ScheduleMetadata | undefined {
    return Reflect.getMetadata('scheduler:schedule', target, methodName);
}

/**
 * Get all scheduled methods from a class prototype
 */
export function getAllSchedules(target: any): Array<{ methodName: string | symbol } & ScheduleMetadata> {
    return Reflect.getMetadata('scheduler:schedules', target) || [];
}
