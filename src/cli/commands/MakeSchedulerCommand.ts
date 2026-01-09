import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { LyraConsole } from '@/core/console/LyraConsole';

/**
 * MakeSchedulerCommand class
 * Adds a new scheduled method to an existing Job class
 */
export class MakeSchedulerCommand {
    /**
     * Executes the make:scheduler command
     * Prompts for job selection, method name, and cron schedule
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    async execute(args: string[] = []) {
        const jobsFolder = path.join(process.cwd(), 'src', 'jobs');

        // Check if jobs folder exists
        if (!fs.existsSync(jobsFolder)) {
            LyraConsole.error(
                'No jobs directory found.',
                'Please create a job first using \'make:job\' command.'
            );
            process.exit(1);
        }

        // Get all job files
        const jobFiles = fs.readdirSync(jobsFolder).filter(f => f.endsWith('.ts'));

        if (jobFiles.length === 0) {
            LyraConsole.error(
                'No job files found.',
                'Please create a job first using \'make:job\' command.'
            );
            process.exit(1);
        }

        // Prompt for job selection
        const { jobFile } = await inquirer.prompt([
            {
                type: 'list',
                name: 'jobFile',
                message: 'Select the job class to add a scheduler to:',
                choices: jobFiles.map(f => ({
                    name: f.replace('.ts', ''),
                    value: f
                }))
            }
        ]);

        // Prompt for method name
        const { methodName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'methodName',
                message: 'Method name (e.g., sendDailyReport, cleanupOldData)?',
                validate: (input) => {
                    if (!input || input.trim().length === 0) {
                        return 'Method name is required';
                    }
                    if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
                        return 'Method name must start with lowercase and contain only alphanumeric characters';
                    }
                    return true;
                }
            }
        ]);

        // Prompt for schedule pattern
        const { scheduleType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'scheduleType',
                message: 'Select schedule pattern:',
                choices: [
                    { name: 'Every day at specific time', value: 'daily' },
                    { name: 'Every week on specific day', value: 'weekly' },
                    { name: 'Every month on specific day', value: 'monthly' },
                    { name: 'Every N minutes', value: 'minutes' },
                    { name: 'Custom cron expression', value: 'custom' }
                ]
            }
        ]);

        let cronExpression = '';

        if (scheduleType === 'daily') {
            const { hour, minute } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'hour',
                    message: 'Hour (0-23)?',
                    default: '9',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 23 ? true : 'Hour must be between 0 and 23';
                    }
                },
                {
                    type: 'input',
                    name: 'minute',
                    message: 'Minute (0-59)?',
                    default: '0',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 59 ? true : 'Minute must be between 0 and 59';
                    }
                }
            ]);
            cronExpression = `${minute} ${hour} * * *`;
        } else if (scheduleType === 'weekly') {
            const { dayOfWeek, hour, minute } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'dayOfWeek',
                    message: 'Day of week?',
                    choices: [
                        { name: 'Sunday', value: '0' },
                        { name: 'Monday', value: '1' },
                        { name: 'Tuesday', value: '2' },
                        { name: 'Wednesday', value: '3' },
                        { name: 'Thursday', value: '4' },
                        { name: 'Friday', value: '5' },
                        { name: 'Saturday', value: '6' }
                    ]
                },
                {
                    type: 'input',
                    name: 'hour',
                    message: 'Hour (0-23)?',
                    default: '9',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 23 ? true : 'Hour must be between 0 and 23';
                    }
                },
                {
                    type: 'input',
                    name: 'minute',
                    message: 'Minute (0-59)?',
                    default: '0',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 59 ? true : 'Minute must be between 0 and 59';
                    }
                }
            ]);
            cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
        } else if (scheduleType === 'monthly') {
            const { dayOfMonth, hour, minute } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'dayOfMonth',
                    message: 'Day of month (1-31)?',
                    default: '1',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 1 && num <= 31 ? true : 'Day must be between 1 and 31';
                    }
                },
                {
                    type: 'input',
                    name: 'hour',
                    message: 'Hour (0-23)?',
                    default: '0',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 23 ? true : 'Hour must be between 0 and 23';
                    }
                },
                {
                    type: 'input',
                    name: 'minute',
                    message: 'Minute (0-59)?',
                    default: '0',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num >= 0 && num <= 59 ? true : 'Minute must be between 0 and 59';
                    }
                }
            ]);
            cronExpression = `${minute} ${hour} ${dayOfMonth} * *`;
        } else if (scheduleType === 'minutes') {
            const { interval } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'interval',
                    message: 'Interval in minutes (e.g., 15, 30)?',
                    default: '15',
                    validate: (input) => {
                        const num = parseInt(input);
                        return num > 0 && num <= 59 ? true : 'Interval must be between 1 and 59';
                    }
                }
            ]);
            cronExpression = `*/${interval} * * * *`;
        } else {
            const { custom } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'custom',
                    message: 'Enter cron expression (e.g., "0 9 * * *")?',
                    validate: (input) => {
                        if (!input || input.trim().length === 0) {
                            return 'Cron expression is required';
                        }
                        const parts = input.trim().split(/\s+/);
                        if (parts.length !== 5) {
                            return 'Cron expression must have exactly 5 parts: minute hour dayOfMonth month dayOfWeek';
                        }
                        return true;
                    }
                }
            ]);
            cronExpression = custom;
        }

        // Prompt for enabled status
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Enable this scheduler immediately?',
                default: true
            }
        ]);

        // Read the job file
        const filePath = path.join(jobsFolder, jobFile);
        let fileContent = fs.readFileSync(filePath, 'utf-8');

        // Generate the new method
        const methodCode = this.generateScheduledMethod(methodName, cronExpression, enabled);

        // Find the last closing brace of the class
        const lastBraceIndex = fileContent.lastIndexOf('}');

        if (lastBraceIndex === -1) {
            LyraConsole.error('Invalid job file structure');
            process.exit(1);
        }

        // Insert the new method before the last closing brace
        const updatedContent =
            fileContent.slice(0, lastBraceIndex) +
            methodCode +
            fileContent.slice(lastBraceIndex);

        // Write the updated content
        fs.writeFileSync(filePath, updatedContent);

        LyraConsole.success(
            `Scheduler method added successfully!`,
            `File: ${filePath}`,
            `Method: ${methodName}`,
            `Schedule: ${cronExpression}`,
            `Enabled: ${enabled}`,
            '',
            'Implement your scheduled task logic in the method.'
        );
    }

    /**
     * Generates a scheduled method code
     */
    private generateScheduledMethod(methodName: string, cronExpression: string, enabled: boolean): string {
        let code = '\n';
        code += `  /**\n`;
        code += `   * Scheduled method: ${methodName}\n`;
        code += `   * Schedule: ${cronExpression}\n`;
        code += `   */\n`;
        code += `  @Schedule({ recurrency: '${cronExpression}', enabled: ${enabled} })\n`;
        code += `  async ${methodName}() {\n`;
        code += `    // TODO: Implement your scheduled task logic here\n`;
        code += `    // Access injected dependencies: this.userRepository, this.emailService, etc.\n`;
        code += `  }\n\n`;
        return code;
    }
}
