/**
 * Represents a scheduled method within a job class
 */
export interface ScheduledMethod {
    jobName: string;           // Job class name (e.g., "OrderReportJob")
    methodName: string;        // Method name (e.g., "sendDailyReport")
    cronExpression: string;    // Cron expression (e.g., "0 9 * * *")
    enabled: boolean;          // Whether this schedule is enabled
    description?: string;      // Human-readable description
}

/**
 * Represents a job instance with its scheduled methods
 */
export interface JobInstance {
    name: string;              // Job class name
    instance: any;             // Job instance (with DI injected)
    scheduledMethods: ScheduledMethod[];
}

/**
 * Scheduler configuration options
 */
export interface SchedulerOptions {
    timezone?: string;         // Timezone for cron execution (default: UTC)
    enabled?: boolean;         // Global scheduler enable/disable (default: true)
}

/**
 * Metadata stored by @Schedule decorator
 */
export interface ScheduleMetadata {
    recurrency: string;        // Cron expression
    enabled: boolean;          // Whether this schedule is enabled (default: true)
}
