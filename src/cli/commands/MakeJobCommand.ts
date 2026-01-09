import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { LyraConsole } from '@/core/console/LyraConsole';

/**
 * MakeJobCommand class
 * Generates new Job classes for scheduler
 * Creates job classes that extend the base Job class
 */
export class MakeJobCommand {
    /**
     * Executes the make:job command
     * Prompts for job name and generates a new job file
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    async execute(args: string[] = []) {
        let jobName = args[0];

        if (!jobName) {
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Job name (e.g., OrderReport, EmailNotification)?',
                    validate: (input) => {
                        if (!input || input.trim().length === 0) {
                            return 'Job name is required';
                        }
                        if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
                            return 'Job name must start with uppercase and contain only alphanumeric characters';
                        }
                        return true;
                    }
                }
            ]);
            jobName = name;
        }

        // Clean job name - remove "job" suffix (case insensitive)
        const cleanName = jobName
            .replace(/[jJ][oO][bB]$/, '');

        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const className = `${formattedName}Job`;
        const fileName = `${className}.ts`;

        const jobsFolder = path.join(process.cwd(), 'src', 'jobs');
        const filePath = path.join(jobsFolder, fileName);

        // Check if jobs folder exists, create if not
        if (!fs.existsSync(jobsFolder)) {
            fs.mkdirSync(jobsFolder, { recursive: true });
        }

        // Check if file already exists
        if (fs.existsSync(filePath)) {
            LyraConsole.error(`Job file already exists at: ${filePath}`);
            process.exit(1);
        }

        const fileContent = this.generateJobFile(className);
        fs.writeFileSync(filePath, fileContent);

        LyraConsole.success(
            `Job created successfully!`,
            `File: ${filePath}`,
            '',
            'Add scheduled methods using @Schedule decorator:',
            '  @Schedule({ recurrency: \'0 9 * * *\', enabled: true })',
            '',
            'Or use \'make:scheduler\' command to add scheduled methods interactively.'
        );
    }

    /**
     * Generates job file content
     * @param {string} className - Name of the job class
     * @returns {string} - Generated job file content
     */
    private generateJobFile(className: string): string {
        let content = '';
        content += `import { Job, JobBase, Schedule } from '@lyra-js/core';\n\n`;
        content += `/**\n`;
        content += ` * ${className} - Scheduled job handler\n`;
        content += ` * Use @Schedule decorator to define when methods should run\n`;
        content += ` */\n`;
        content += `@Job()\n`;
        content += `export class ${className} extends JobBase {\n`;
        content += `  /**\n`;
        content += `   * Example scheduled method\n`;
        content += `   * Uncomment and modify the schedule as needed\n`;
        content += `   * \n`;
        content += `   * Cron format: "minute hour dayOfMonth month dayOfWeek"\n`;
        content += `   * Examples:\n`;
        content += `   *   "0 9 * * *"    - Every day at 9:00 AM\n`;
        content += `   *   "*/15 * * * *" - Every 15 minutes\n`;
        content += `   *   "0 0 1 * *"    - First day of each month at midnight\n`;
        content += `   *   "0 0 * * 1"    - Every Monday at midnight\n`;
        content += `   */\n`;
        content += `  // @Schedule({ recurrency: '0 9 * * *', enabled: true })\n`;
        content += `  // async execute() {\n`;
        content += `  //   // Your scheduled task logic here\n`;
        content += `  //   // Access injected dependencies: this.userRepository, this.emailService, etc.\n`;
        content += `  // }\n`;
        content += `}\n`;
        return content;
    }
}
