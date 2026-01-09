/**
 * Cron expression parser and human-readable description generator
 * Supports standard cron format: "minute hour dayOfMonth month dayOfWeek"
 */
export class CronParser {
    /**
     * Parse cron expression and return human-readable description
     * @param {string} cronExpression - Cron expression (e.g., "0 9 * * *")
     * @returns {string} - Human-readable description (e.g., "every day at 09:00am")
     */
    static describe(cronExpression: string): string {
        const parts = cronExpression.trim().split(/\s+/);

        if (parts.length !== 5) {
            return cronExpression; // Invalid format, return as-is
        }

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // Check for common patterns
        if (this.isEveryMinute(parts)) {
            return 'every minute';
        }

        if (this.isHourly(parts)) {
            return `every hour at :${this.padZero(minute)}`;
        }

        if (this.isDaily(parts)) {
            return `every day at ${this.formatTime(hour, minute)}`;
        }

        if (this.isWeekly(parts)) {
            const day = this.getDayName(dayOfWeek);
            return `every week on ${day} at ${this.formatTime(hour, minute)}`;
        }

        if (this.isMonthly(parts)) {
            const day = this.getOrdinalDay(dayOfMonth);
            return `every month on the ${day} at ${this.formatTime(hour, minute)}`;
        }

        if (this.isYearly(parts)) {
            const monthName = this.getMonthName(month);
            const day = this.getOrdinalDay(dayOfMonth);
            return `every year on ${monthName} ${day} at ${this.formatTime(hour, minute)}`;
        }

        // Complex pattern - provide basic description
        return this.describeComplex(parts);
    }

    // Check if runs every minute: "* * * * *"
    private static isEveryMinute(parts: string[]): boolean {
        return parts.every(p => p === '*');
    }

    // Check if runs every hour: "X * * * *" where X is specific minute
    private static isHourly(parts: string[]): boolean {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        return minute !== '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*';
    }

    // Check if runs daily: "X Y * * *" where X and Y are specific
    private static isDaily(parts: string[]): boolean {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        return minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*';
    }

    // Check if runs weekly: "X Y * * Z" where Z is specific day
    private static isWeekly(parts: string[]): boolean {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        return minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek !== '*';
    }

    // Check if runs monthly: "X Y Z * *" where Z is specific day of month
    private static isMonthly(parts: string[]): boolean {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        return minute !== '*' && hour !== '*' && dayOfMonth !== '*' && month === '*' && dayOfWeek === '*';
    }

    // Check if runs yearly: "X Y Z M *" where Z is day and M is month
    private static isYearly(parts: string[]): boolean {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        return minute !== '*' && hour !== '*' && dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*';
    }

    // Format time as "09:00am" or "2:30pm"
    private static formatTime(hour: string, minute: string): string {
        const h = parseInt(hour, 10);
        const m = this.padZero(minute);
        const period = h >= 12 ? 'pm' : 'am';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHour}:${m}${period}`;
    }

    // Pad zero for single digit minutes
    private static padZero(value: string): string {
        const num = parseInt(value, 10);
        return num < 10 ? `0${num}` : `${num}`;
    }

    // Get day name from day of week number
    private static getDayName(dayOfWeek: string): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = parseInt(dayOfWeek, 10);
        return days[day] || dayOfWeek;
    }

    // Get ordinal day (1st, 2nd, 3rd, etc.)
    private static getOrdinalDay(day: string): string {
        const num = parseInt(day, 10);
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }

    // Get month name from month number
    private static getMonthName(month: string): string {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const m = parseInt(month, 10);
        return months[m - 1] || month;
    }

    // Describe complex cron patterns
    private static describeComplex(parts: string[]): string {
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        const descriptions: string[] = [];

        // Minute
        if (minute === '*') {
            descriptions.push('every minute');
        } else if (minute.includes('/')) {
            const interval = minute.split('/')[1];
            descriptions.push(`every ${interval} minutes`);
        } else if (minute.includes(',')) {
            descriptions.push(`at minutes ${minute}`);
        } else {
            descriptions.push(`at minute ${minute}`);
        }

        // Hour
        if (hour !== '*') {
            if (hour.includes('/')) {
                const interval = hour.split('/')[1];
                descriptions.push(`every ${interval} hours`);
            } else if (hour.includes(',')) {
                descriptions.push(`at hours ${hour}`);
            } else {
                descriptions.push(`at hour ${hour}`);
            }
        }

        // Day of month
        if (dayOfMonth !== '*') {
            descriptions.push(`on day ${dayOfMonth} of the month`);
        }

        // Month
        if (month !== '*') {
            descriptions.push(`in month ${month}`);
        }

        // Day of week
        if (dayOfWeek !== '*') {
            const day = this.getDayName(dayOfWeek);
            descriptions.push(`on ${day}`);
        }

        return descriptions.join(', ');
    }

    /**
     * Validate cron expression format
     * @param {string} cronExpression - Cron expression to validate
     * @returns {boolean} - True if valid
     */
    static validate(cronExpression: string): boolean {
        const parts = cronExpression.trim().split(/\s+/);

        if (parts.length !== 5) {
            return false;
        }

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // Validate each part
        return (
            this.validateField(minute, 0, 59) &&
            this.validateField(hour, 0, 23) &&
            this.validateField(dayOfMonth, 1, 31) &&
            this.validateField(month, 1, 12) &&
            this.validateField(dayOfWeek, 0, 6)
        );
    }

    // Validate a single cron field
    private static validateField(field: string, min: number, max: number): boolean {
        // Wildcard
        if (field === '*') return true;

        // Range (e.g., "1-5")
        if (field.includes('-')) {
            const [start, end] = field.split('-').map(n => parseInt(n, 10));
            return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
        }

        // Step (e.g., "*/5")
        if (field.includes('/')) {
            const [range, step] = field.split('/');
            const stepNum = parseInt(step, 10);
            if (isNaN(stepNum) || stepNum <= 0) return false;
            if (range === '*') return true;
            return this.validateField(range, min, max);
        }

        // List (e.g., "1,2,3")
        if (field.includes(',')) {
            return field.split(',').every(v => {
                const num = parseInt(v.trim(), 10);
                return !isNaN(num) && num >= min && num <= max;
            });
        }

        // Single value
        const num = parseInt(field, 10);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Calculate next execution time from a cron expression
     * @param {string} cronExpression - Cron expression
     * @param {Date} [from] - Starting date (default: now)
     * @returns {Date} - Next execution time
     */
    static getNextExecution(cronExpression: string, from: Date = new Date()): Date {
        const parts = cronExpression.trim().split(/\s+/);

        if (parts.length !== 5) {
            throw new Error('Invalid cron expression format');
        }

        const [minutePart, hourPart, dayOfMonthPart, monthPart, dayOfWeekPart] = parts;

        const current = new Date(from);
        current.setSeconds(0);
        current.setMilliseconds(0);

        // Simple implementation for common patterns
        // For production, consider using a library like 'cron-parser'

        // Start from next minute
        current.setMinutes(current.getMinutes() + 1);

        // Find next matching time (max 4 years ahead to prevent infinite loop)
        const maxIterations = 4 * 365 * 24 * 60; // 4 years in minutes
        let iterations = 0;

        while (iterations < maxIterations) {
            if (
                this.matchesField(current.getMinutes(), minutePart, 0, 59) &&
                this.matchesField(current.getHours(), hourPart, 0, 23) &&
                this.matchesField(current.getDate(), dayOfMonthPart, 1, 31) &&
                this.matchesField(current.getMonth() + 1, monthPart, 1, 12) &&
                this.matchesField(current.getDay(), dayOfWeekPart, 0, 6)
            ) {
                return current;
            }

            current.setMinutes(current.getMinutes() + 1);
            iterations++;
        }

        throw new Error('Could not calculate next execution time');
    }

    // Check if a value matches a cron field
    private static matchesField(value: number, field: string, min: number, max: number): boolean {
        if (field === '*') return true;

        if (field.includes(',')) {
            return field.split(',').some(v => parseInt(v.trim(), 10) === value);
        }

        if (field.includes('/')) {
            const [range, step] = field.split('/');
            const stepNum = parseInt(step, 10);
            if (range === '*') {
                return value % stepNum === 0;
            }
        }

        if (field.includes('-')) {
            const [start, end] = field.split('-').map(n => parseInt(n, 10));
            return value >= start && value <= end;
        }

        return parseInt(field, 10) === value;
    }
}
