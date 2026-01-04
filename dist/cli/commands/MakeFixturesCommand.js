import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import { LyraConsole } from "../../orm/index.js";
/**
 * MakeFixturesCommand class
 * Generates new fixture files for database seeding
 * Creates fixture classes that extend the base Fixture class
 */
export class MakeFixturesCommand {
    /**
     * Executes the make:fixtures command
     * Prompts for fixture name and generates a new fixture file
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    async execute(args = []) {
        let fixtureName = args[0];
        if (!fixtureName) {
            const { name } = await inquirer.prompt([
                {
                    type: "input",
                    name: "name",
                    message: "Fixture name (e.g., User, Post, Category)?",
                    validate: (input) => {
                        if (!input || input.trim().length === 0) {
                            return "Fixture name is required";
                        }
                        if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
                            return "Fixture name must start with uppercase and contain only alphanumeric characters";
                        }
                        return true;
                    }
                }
            ]);
            fixtureName = name;
        }
        // Clean fixture name - remove "fixtures" or "fixture" suffix (case insensitive)
        const cleanName = fixtureName
            .replace(/[fF][iI][xX][tT][uU][rR][eE][sS]$/, "")
            .replace(/[fF][iI][xX][tT][uU][rR][eE]$/, "");
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const className = `${formattedName}Fixtures`;
        const fileName = `${className}.ts`;
        const fixturesFolder = path.join(process.cwd(), "src", "fixtures");
        const filePath = path.join(fixturesFolder, fileName);
        // Check if fixtures folder exists, create if not
        if (!fs.existsSync(fixturesFolder)) {
            fs.mkdirSync(fixturesFolder, { recursive: true });
        }
        // Check if file already exists (ignore backup files with ~)
        if (fs.existsSync(filePath) && !filePath.endsWith("~")) {
            LyraConsole.error(`Fixture file already exists at: ${filePath}`);
            process.exit(1);
        }
        const fileContent = this.generateFixtureFile(className);
        fs.writeFileSync(filePath, fileContent);
        LyraConsole.success(`Fixture created successfully!`, `File: ${filePath}`, "", "Implement the load() method to define your fixture data.", "Use 'fixtures:load' command to load all fixtures.");
    }
    /**
     * Generates fixture file content
     * @param {string} className - Name of the fixture class
     * @returns {string} - Generated fixture file content
     */
    generateFixtureFile(className) {
        let fixtureContent = ``;
        fixtureContent += `import { Fixture } from "@lyra-js/core"\n\n`;
        fixtureContent += `export class ${className} extends Fixture {\n`;
        fixtureContent += `  /**\n`;
        fixtureContent += `   * Optional dependencies - fixtures that must load before this one\n`;
        fixtureContent += `   * Uncomment and add your dependencies as needed\n`;
        fixtureContent += `   * @example\n`;
        fixtureContent += `   * dependencies = [UserFixtures]\n`;
        fixtureContent += `   */\n`;
        fixtureContent += `  // dependencies = []\n\n`;
        fixtureContent += `  /**\n`;
        fixtureContent += `   * Load fixture data into the database\n`;
        fixtureContent += `   * Implement your fixture loading logic here\n`;
        fixtureContent += `   * @example\n`;
        fixtureContent += `   * async load() {\n`;
        fixtureContent += `   *   const user = new User()\n`;
        fixtureContent += `   *   user.username = "testuser"\n`;
        fixtureContent += `   *   user.email = "test@example.com"\n`;
        fixtureContent += `   *   await this.userRepository.save(user)\n`;
        fixtureContent += `   * }\n`;
        fixtureContent += `   */\n`;
        fixtureContent += `  async load() {\n`;
        fixtureContent += `    // TODO: Implement your fixture loading logic here\n`;
        fixtureContent += `  }\n`;
        fixtureContent += `}\n`;
        return fixtureContent;
    }
}
//# sourceMappingURL=MakeFixturesCommand.js.map