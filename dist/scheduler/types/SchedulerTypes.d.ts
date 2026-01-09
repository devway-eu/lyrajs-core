/**
 * Represents a scheduled method within a job class
 */
export interface ScheduledMethod {
    jobName: string;
    methodName: string;
    cronExpression: string;
    enabled: boolean;
    description?: string;
}
/**
 * Represents a job instance with its scheduled methods
 */
export interface JobInstance {
    name: string;
    instance: any;
    scheduledMethods: ScheduledMethod[];
}
/**
 * Scheduler configuration options
 */
export interface SchedulerOptions {
    timezone?: string;
    enabled?: boolean;
}
/**
 * Metadata stored by @Schedule decorator
 */
export interface ScheduleMetadata {
    recurrency: string;
    enabled: boolean;
}
