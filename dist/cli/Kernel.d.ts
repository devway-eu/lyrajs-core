/**
 * Interface for CLI command classes
 * All command classes must implement this interface
 */
export interface ICommand {
    execute(args: string[]): Promise<void>;
}
/**
 * CLI Kernel class
 * Handles command parsing, routing, and execution
 * Manages the lifecycle of CLI commands and provides error handling
 */
export declare class Kernel {
    private static commands;
    /**
     * Executes a CLI command based on command-line arguments
     * Parses the command name and delegates to the appropriate command class
     * Displays help if no command is provided
     * @param {string[]} argv - Command-line arguments from process.argv
     * @returns {Promise<void>}
     * @example
     * // Run the help command
     * await Kernel.run(['node', 'cli.js'])
     * @example
     * // Run the make:entity command
     * await Kernel.run(['node', 'cli.js', 'make:entity'])
     */
    static run(argv: string[]): Promise<void>;
}
