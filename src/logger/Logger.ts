import * as fs from "node:fs"
import * as path from "node:path"
import * as process from "node:process"
import { LyraConsole } from "@/core/console/LyraConsole"

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug' | 'log'

/**
 * Logger class
 * Provides methods for logging to files and console
 * Supports different log levels with colored console output
 */
class Logger {
  /**
   * Writes a log message to the appropriate log file based on environment
   * Creates the logs directory and log file if they don't exist
   * @param {string} message - Log message to write
   * @param {LogLevel} [level='info'] - Log level for categorization
   * @returns {void}
   * @example
   * logger.toFile('Database connected successfully', 'success')
   */
  toFile(message: string, level: LogLevel = 'info'): void {
    try {
      const env = process.env.NODE_ENV || "dev"
      const logDir = path.join(process.cwd(), "logs")
      const logFile = env === "production" || env === "prod" ? "prod.log" : "dev.log"
      const logPath = path.join(logDir, logFile)

      // Ensure logs directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      // Ensure log file exists
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, "", "utf8")
      }

      // Format log message with timestamp and level
      const timestamp = new Date().toISOString()
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

      // Append log message with newline
      fs.appendFileSync(logPath, formattedMessage + "\n", "utf8")
    } catch (error) {
      // If file logging fails, log error to console but don't crash the app
      console.error("Failed to write to log file:", error)
    }
  }

  /**
   * Logs a message to console using LyraConsole with colored output
   * @param {string} message - Message to display in console
   * @param {LogLevel} [level='log'] - Log level determines color and icon
   * @returns {void}
   * @example
   * logger.toConsole('User logged in', 'success')
   */
  toConsole(message: string, level: LogLevel = 'log'): void {
    switch (level) {
      case 'info':
        LyraConsole.info(message)
        break
      case 'warn':
        LyraConsole.warn(message)
        break
      case 'error':
        LyraConsole.error(message)
        break
      case 'success':
        LyraConsole.success(message)
        break
      case 'debug':
        LyraConsole.debug(message)
        break
      case 'log':
      default:
        LyraConsole.log(message)
        break
    }
  }

  /**
   * Logs a message to both file and console
   * @param {string} message - Message to log
   * @param {LogLevel} [level='info'] - Log level for both outputs
   * @returns {void}
   * @example
   * logger.log('Application started on port 3000', 'info')
   */
  log(message: string, level: LogLevel = 'info'): void {
    this.toFile(message, level)
    this.toConsole(message, level)
  }

  /**
   * Logs an informational message (blue color)
   * @param {string} message - Info message
   * @example
   * logger.info('Server running on port 3000')
   */
  info(message: string): void {
    this.log(message, 'info')
  }

  /**
   * Logs a warning message (yellow color)
   * @param {string} message - Warning message
   * @example
   * logger.warn('Deprecated method used')
   */
  warn(message: string): void {
    this.log(message, 'warn')
  }

  /**
   * Logs an error message (red color)
   * @param {string} message - Error message
   * @example
   * logger.error('Database connection failed')
   */
  error(message: string): void {
    this.log(message, 'error')
  }

  /**
   * Logs a success message (green color)
   * @param {string} message - Success message
   * @example
   * logger.success('Migration completed successfully')
   */
  success(message: string): void {
    this.log(message, 'success')
  }

  /**
   * Logs a debug message (magenta color)
   * @param {string} message - Debug message
   * @example
   * logger.debug('Query executed: SELECT * FROM users')
   */
  debug(message: string): void {
    this.log(message, 'debug')
  }
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
export const logger = new Logger()
