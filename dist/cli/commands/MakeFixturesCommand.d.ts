/**
 * MakeFixturesCommand class
 * Generates new fixture files for database seeding
 * Creates fixture classes that extend the base Fixture class
 */
export declare class MakeFixturesCommand {
    /**
     * Executes the make:fixtures command
     * Prompts for fixture name and generates a new fixture file
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    execute(args?: string[]): Promise<void>;
    /**
     * Generates fixture file content
     * @param {string} className - Name of the fixture class
     * @returns {string} - Generated fixture file content
     */
    private generateFixtureFile;
}
