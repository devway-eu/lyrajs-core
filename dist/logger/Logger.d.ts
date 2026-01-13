type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug' | 'log';
/**
 * Logger class
 * Provides methods for logging to files and console
 * Supports different log levels with colored console output
 */
declare class Logger {
    /**
     * Writes a log message to the appropriate log file based on environment
     * Creates the logs directory and log file if they don't exist
     * @param {string} message - Log message to write
     * @param {LogLevel} [level='info'] - Log level for categorization
     * @returns {void}
     * @example
     * logger.toFile('Database connected successfully', 'success')
     */
    toFile(message: string, level?: LogLevel): void;
    /**
     * Logs a message to console using LyraConsole with colored output
     * @param {string} message - Message to display in console
     * @param {LogLevel} [level='log'] - Log level determines color and icon
     * @returns {void}
     * @example
     * logger.toConsole('User logged in', 'success')
     */
    toConsole(message: string, level?: LogLevel): void;
    /**
     * Logs a message to both file and console
     * @param {string} message - Message to log
     * @param {LogLevel} [level='info'] - Log level for both outputs
     * @returns {void}
     * @example
     * logger.log('Application started on port 3000', 'info')
     */
    log(message: string, level?: LogLevel): void;
    /**
     * Logs an informational message (blue color)
     * @param {string} message - Info message
     * @example
     * logger.info('Server running on port 3000')
     */
    info(message: string): void;
    /**
     * Logs a warning message (yellow color)
     * @param {string} message - Warning message
     * @example
     * logger.warn('Deprecated method used')
     */
    warn(message: string): void;
    /**
     * Logs an error message (red color)
     * @param {string} message - Error message
     * @example
     * logger.error('Database connection failed')
     */
    error(message: string): void;
    /**
     * Logs a success message (green color)
     * @param {string} message - Success message
     * @example
     * logger.success('Migration completed successfully')
     */
    success(message: string): void;
    /**
     * Logs a debug message (magenta color)
     * @param {string} message - Debug message
     * @example
     * logger.debug('Query executed: SELECT * FROM users')
     */
    debug(message: string): void;
}
/**
 * Singleton logger instance
 * Provides centralized logging functionality throughout the application
 * Automatically injected into controllers, services, repositories, and jobs
 * @example
 * // In controllers, services, repositories, jobs
 * this.logger.info('User created successfully')
 * this.logger.error('Failed to connect to database')
 * this.logger.success('Email sent')
 */
export declare const logger: Logger;
export {};
