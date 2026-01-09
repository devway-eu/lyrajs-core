/**
 * Cron expression parser and human-readable description generator
 * Supports standard cron format: "minute hour dayOfMonth month dayOfWeek"
 */
export declare class CronParser {
    /**
     * Parse cron expression and return human-readable description
     * @param {string} cronExpression - Cron expression (e.g., "0 9 * * *")
     * @returns {string} - Human-readable description (e.g., "every day at 09:00am")
     */
    static describe(cronExpression: string): string;
    private static isEveryMinute;
    private static isHourly;
    private static isDaily;
    private static isWeekly;
    private static isMonthly;
    private static isYearly;
    private static formatTime;
    private static padZero;
    private static getDayName;
    private static getOrdinalDay;
    private static getMonthName;
    private static describeComplex;
    /**
     * Validate cron expression format
     * @param {string} cronExpression - Cron expression to validate
     * @returns {boolean} - True if valid
     */
    static validate(cronExpression: string): boolean;
    private static validateField;
    /**
     * Calculate next execution time from a cron expression
     * @param {string} cronExpression - Cron expression
     * @param {Date} [from] - Starting date (default: now)
     * @returns {Date} - Next execution time
     */
    static getNextExecution(cronExpression: string, from?: Date): Date;
    private static matchesField;
}
