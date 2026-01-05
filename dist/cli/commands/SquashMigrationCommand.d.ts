/**
 * SquashMigrationCommand class
 * Combines multiple migrations into a single squashed migration
 * Useful for reducing migration count in mature projects
 */
export declare class SquashMigrationCommand {
    /**
     * Executes the squash migration command
     * Combines all migrations up to a target version into one baseline migration
     * @param {string[]} args - Command arguments [--to=<version>]
     * @returns {Promise<void>}
     */
    execute(args: string[]): Promise<void>;
}
