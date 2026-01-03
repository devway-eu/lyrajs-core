/**
 * LyraConsoleClass
 * Enhanced console utility for styled terminal output
 * Provides colored, icon-enhanced logging methods for different message types
 * Supports grouping multiple messages and customizable styling
 */
class LyraConsoleClass {
    closeByNewLine;
    useIcons;
    logsTitle;
    warningsTitle;
    errorsTitle;
    informationsTitle;
    successesTitle;
    debugsTitle;
    assertsTitle;
    /**
     * Creates a new LyraConsoleClass instance
     * Initializes default settings for console output styling
     * @example
     * const console = new LyraConsoleClass()
     * console.success('Operation completed!')
     */
    constructor() {
        this.closeByNewLine = true;
        this.useIcons = true;
        this.logsTitle = "LOGS";
        this.warningsTitle = "WARNINGS";
        this.errorsTitle = "ERRORS";
        this.informationsTitle = "INFORMATIONS";
        this.successesTitle = "SUCCESS";
        this.debugsTitle = "DEBUG";
        this.assertsTitle = "ASSERT";
    }
    /**
     * Generates ANSI color codes for terminal styling
     * Converts color names to ANSI escape sequences for foreground and background
     * @param {string} foregroundColor - Foreground color name (black, red, green, yellow, blue, magenta, cyan, white)
     * @param {string} backgroundColor - Background color name (black, red, green, yellow, blue, magenta, cyan, white)
     * @returns {string} - ANSI escape sequence for the specified colors
     * @private
     */
    getColor(foregroundColor = "", backgroundColor = "") {
        let fgc = "\x1b[37m";
        switch (foregroundColor.trim().toLowerCase()) {
            case "black":
                fgc = "\x1b[30m";
                break;
            case "red":
                fgc = "\x1b[31m";
                break;
            case "green":
                fgc = "\x1b[32m";
                break;
            case "yellow":
                fgc = "\x1b[33m";
                break;
            case "blue":
                fgc = "\x1b[34m";
                break;
            case "magenta":
                fgc = "\x1b[35m";
                break;
            case "cyan":
                fgc = "\x1b[36m";
                break;
            case "white":
                fgc = "\x1b[37m";
                break;
        }
        let bgc = "";
        switch (backgroundColor.trim().toLowerCase()) {
            case "black":
                bgc = "\x1b[40m";
                break;
            case "red":
                bgc = "\x1b[44m";
                break;
            case "green":
                bgc = "\x1b[44m";
                break;
            case "yellow":
                bgc = "\x1b[43m";
                break;
            case "blue":
                bgc = "\x1b[44m";
                break;
            case "magenta":
                bgc = "\x1b[45m";
                break;
            case "cyan":
                bgc = "\x1b[46m";
                break;
            case "white":
                bgc = "\x1b[47m";
                break;
        }
        return `${fgc}${bgc}`;
    }
    /**
     * Returns ANSI reset code to clear all styling
     * @returns {string} - ANSI reset escape sequence
     * @private
     */
    getColorReset() {
        return "\x1b[0m";
    }
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
    print(foregroundColor = "white", backgroundColor = "black", ...strings) {
        const c = this.getColor(foregroundColor, backgroundColor);
        // turns objects into printable strings
        strings.push("");
        strings = strings.map((item) => {
            if (typeof item === "object")
                item = JSON.stringify(item);
            return item;
        });
        console.log(c, strings.join(""), this.getColorReset());
        if (this.closeByNewLine) {
            console.log("");
        }
    }
    /**
     * Clears the console screen
     * @example
     * LyraConsole.clear()
     */
    clear() {
        console.clear();
    }
    /**
     * Logs general informational messages in white
     * Groups multiple strings together with optional icon prefix
     * @param {...string[]} strings - Messages to log
     * @example
     * LyraConsole.log('Application started')
     * LyraConsole.log('Header', 'Detail 1', 'Detail 2')
     */
    log(...strings) {
        const fg = "white";
        const bg = "";
        const icon = "\u25ce";
        const groupTile = ` ${this.logsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            // console.group(c, (this.useIcons ? icon : "") + groupTile)
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item, this.getColorReset());
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs warning messages in yellow with warning icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Warning messages to display
     * @example
     * LyraConsole.warn('Deprecated method used')
     * LyraConsole.warn('Warning', 'Configuration missing', 'Using defaults')
     */
    warn(...strings) {
        const fg = "yellow";
        const bg = "";
        const icon = "\u26a0";
        const groupTile = ` ${this.warningsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            // console.group(c, (this.useIcons ? icon : "") + groupTile)
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item, this.getColorReset());
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs error messages in red with error icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Error messages to display
     * @example
     * LyraConsole.error('Database connection failed')
     * LyraConsole.error('Error', 'Invalid credentials', 'Please check your settings')
     */
    error(...strings) {
        const fg = "red";
        const bg = "";
        const icon = "\u2717";
        const groupTile = ` ${this.errorsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs informational messages in blue with info icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Informational messages to display
     * @example
     * LyraConsole.info('Server running on port 3000')
     * LyraConsole.info('Info', 'Connected to database', 'Migrations applied')
     */
    info(...strings) {
        const fg = "blue";
        const bg = "";
        const icon = "\u2139";
        const groupTile = ` ${this.informationsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item) => {
                this.print(fg, bg, item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs success messages in green with checkmark icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Success messages to display
     * @example
     * LyraConsole.success('Migration completed successfully')
     * LyraConsole.success('Success', 'All tests passed', 'Build completed')
     */
    success(...strings) {
        const fg = "green";
        const bg = "";
        const icon = "\u2713";
        const groupTile = ` ${this.successesTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs debug messages in magenta with gear icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Debug messages to display
     * @example
     * LyraConsole.debug('Query executed: SELECT * FROM users')
     * LyraConsole.debug('Debug', 'Variable value:', 'x = 42')
     */
    debug(...strings) {
        const fg = "magenta";
        const bg = "";
        const icon = "\u2699";
        const groupTile = ` ${this.debugsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            // console.group(c, (this.useIcons ? icon : "") + groupTile)
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
    /**
     * Logs assertion messages in cyan with exclamation icon
     * Groups multiple strings together when provided
     * @param {...string[]} strings - Assertion messages to display
     * @example
     * LyraConsole.assert('Value should not be null')
     * LyraConsole.assert('Assertion', 'Expected: 10', 'Actual: 5')
     */
    assert(...strings) {
        const fg = "cyan";
        const bg = "";
        const icon = "\u0021";
        const groupTile = ` ${this.assertsTitle}`;
        if (strings.length > 1) {
            const c = this.getColor(fg, bg);
            console.group(c);
            // console.group(c, (this.useIcons ? icon : "") + groupTile)
            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item, i) => {
                this.print(fg, bg, i === 0 ? `${this.useIcons ? `${icon} ` : ""}${item}` : item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) {
                console.log();
            }
        }
        else {
            this.print(fg, bg, ...strings.map((item) => {
                return `${this.useIcons ? `${icon} ` : ""}${item}`;
            }));
        }
    }
}
/**
 * Singleton instance of LyraConsoleClass
 * Provides styled console logging throughout LyraJS applications
 * @example
 * import { LyraConsole } from '@lyra-js/core'
 * LyraConsole.success('Operation completed!')
 * LyraConsole.error('Something went wrong')
 */
export const LyraConsole = new LyraConsoleClass();
//# sourceMappingURL=LyraConsole.js.map