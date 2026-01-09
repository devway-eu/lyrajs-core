import { ShowRoutesCommand } from "../cli/commands/ShowRoutesCommand.js";
import { LyraConsole } from "../console/LyraConsole.js";
import { CleanupBackupsCommand, CreateDatabaseCommand, CreateRoutesCommand, FreshMigrationCommand, GenerateControllerCommand, GenerateEntityCommand, GenerateMigrationCommand, HelpCommand, ShowBackupsCommand, LoadFixturesCommand, MakeFixturesCommand, MakeJobCommand, MakeSchedulerCommand, MigrateMigrationCommand, RefreshMigrationCommand, RestoreBackupCommand, RollbackMigrationCommand, ShowControllersCommand, ShowEntitiesCommand, ShowMigrationsCommand, ShowRepositoriesCommand, ShowSchedulersCommand, SquashMigrationCommand } from "./commands/index.js";
/**
 * CLI Kernel class
 * Handles command parsing, routing, and execution
 * Manages the lifecycle of CLI commands and provides error handling
 */
export class Kernel {
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
    static async run(argv) {
        try {
            const [, , commandName, ...args] = argv;
            if (!commandName) {
                const helpCommand = new HelpCommand();
                await helpCommand.execute();
                process.exit(0);
            }
            const CommandClass = this.commands[commandName];
            if (!CommandClass) {
                throw new Error(`Unknown command: ${commandName}`);
            }
            const commandInstance = new CommandClass();
            await commandInstance.execute(args);
            process.exit(0);
        }
        catch (error) {
            LyraConsole.error(error.message);
            process.exit(1);
        }
    }
}
Kernel.commands = {
    "cleanup:backups": CleanupBackupsCommand,
    "create:database": CreateDatabaseCommand,
    "fixtures:load": LoadFixturesCommand,
    "show:backups": ShowBackupsCommand,
    "make:controller": GenerateControllerCommand,
    "make:entity": GenerateEntityCommand,
    "make:fixtures": MakeFixturesCommand,
    "make:job": MakeJobCommand,
    "make:migration": GenerateMigrationCommand,
    "make:routes": CreateRoutesCommand,
    "make:scheduler": MakeSchedulerCommand,
    "migration:fresh": FreshMigrationCommand,
    "migration:migrate": MigrateMigrationCommand,
    "migration:refresh": RefreshMigrationCommand,
    "migration:rollback": RollbackMigrationCommand,
    "migration:squash": SquashMigrationCommand,
    "restore:backup": RestoreBackupCommand,
    "show:controllers": ShowControllersCommand,
    "show:entities": ShowEntitiesCommand,
    "show:migrations": ShowMigrationsCommand,
    "show:repositories": ShowRepositoriesCommand,
    "show:routes": ShowRoutesCommand,
    "show:schedulers": ShowSchedulersCommand
};
//# sourceMappingURL=Kernel.js.map