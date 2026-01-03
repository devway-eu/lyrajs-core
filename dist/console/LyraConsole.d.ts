/**
 * LyraConsoleClass
 * Enhanced console utility for styled terminal output
 * Provides colored, icon-enhanced logging methods for different message types
 * Supports grouping multiple messages and customizable styling
 */
declare class LyraConsoleClass {
    closeByNewLine: boolean;
    useIcons: boolean;
    logsTitle: string;
    warningsTitle: string;
    errorsTitle: string;
    informationsTitle: string;
    successesTitle: string;
    debugsTitle: string;
    assertsTitle: string;
    /**
     * Creates a new LyraConsoleClass instance
     * Initializes default settings for console output styling
     * @example
     * const console = new LyraConsoleClass()
     * console.success('Operation completed!')
     */
    constructor();
    /**
     * Generates ANSI color codes for terminal styling
     * Converts color names to ANSI escape sequences for foreground and background
     * @param {string} foregroundColor - Foreground color name (black, red, green, yellow, blue, magenta, cyan, white)
     * @param {string} backgroundColor - Background color name (black, red, green, yellow, blue, magenta, cyan, white)
     * @returns {string} - ANSI escape sequence for the specified colors
     * @private
     */
    private getColor;
    /**
     * Returns ANSI reset code to clear all styling
     * @returns {string} - ANSI reset escape sequence
     * @private
     */
    private getColorReset;
    /**
     * Prints colored text to the console
     * Converts objects to JSON strings and applies specified colors
     * @param {string} foregroundColor - Foreground color name (default: 'white')
     * @param {string} backgroundColor - Background color name (default: 'black')
     * @param {...unknown[]} strings - Content to print (strings or objects)
     * @example
     * LyraConsole.print('green', 'black', 'Success message')
     * LyraConsole.print('red', '', { error: 'Something failed' })
     */
    print(foregroundColor?: string, backgroundColor?: string, ...strings: unknown[]): void;
    /**
     * Clears the console screen
     * @example
     * LyraConsole.clear()
     */
    clear(): void;
    /**
     * Logs general informational messages in white
     * Groups multiple strings together with optional icon prefix
     * @param {...string[]} strings - Messages to log
     * @example
     * LyraConsole.log('Application started')
     * LyraConsole.log('Header', 'Detail 1', 'Detail 2')
     */
    log(...strings: string[]): void;
    /**
     * Logs warning messages in yellow with warning icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Warning messages to display
     * @example
     * LyraConsole.warn('Deprecated method used')
     * LyraConsole.warn('Warning', 'Configuration missing', 'Using defaults')
     */
    warn(...strings: string[]): void;
    /**
     * Logs error messages in red with error icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Error messages to display
     * @example
     * LyraConsole.error('Database connection failed')
     * LyraConsole.error('Error', 'Invalid credentials', 'Please check your settings')
     */
    error(...strings: string[]): void;
    /**
     * Logs informational messages in blue with info icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Informational messages to display
     * @example
     * LyraConsole.info('Server running on port 3000')
     * LyraConsole.info('Info', 'Connected to database', 'Migrations applied')
     */
    info(...strings: string[]): void;
    /**
     * Logs success messages in green with checkmark icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Success messages to display
     * @example
     * LyraConsole.success('Migration completed successfully')
     * LyraConsole.success('Success', 'All tests passed', 'Build completed')
     */
    success(...strings: string[]): void;
    /**
     * Logs debug messages in magenta with gear icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Debug messages to display
     * @example
     * LyraConsole.debug('Query executed: SELECT * FROM users')
     * LyraConsole.debug('Debug', 'Variable value:', 'x = 42')
     */
    debug(...strings: string[]): void;
    /**
     * Logs assertion messages in cyan with exclamation icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Assertion messages to display
     * @example
     * LyraConsole.assert('Value should not be null')
     * LyraConsole.assert('Assertion', 'Expected: 10', 'Actual: 5')
     */
    assert(...strings: string[]): void;
}
/**
 * Singleton instance of LyraConsoleClass
 * Provides styled console logging throughout LyraJS applications
 * @example
 * import { LyraConsole } from '@lyra-js/core'
 * LyraConsole.success('Operation completed!')
 * LyraConsole.error('Something went wrong')
 */
export declare const LyraConsole: LyraConsoleClass;
export {};
