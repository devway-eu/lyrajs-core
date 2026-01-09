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
export function Job(name?: string): ClassDecorator {
    return function (target: Function) {
        // Store job metadata
        const jobName = name || target.name;
        Reflect.defineMetadata('scheduler:job', true, target);
        Reflect.defineMetadata('scheduler:jobName', jobName, target);
    };
}

/**
 * Check if a class is decorated with @Job
 */
export function isJob(target: Function): boolean {
    return Reflect.getMetadata('scheduler:job', target) === true;
}

/**
 * Get the job name from metadata
 */
export function getJobName(target: Function): string | undefined {
    return Reflect.getMetadata('scheduler:jobName', target);
}
