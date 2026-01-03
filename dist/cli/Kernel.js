import { ShowRoutesCommand } from "../cli/commands/ShowRoutesCommand.js";
import { LyraConsole } from "../console/LyraConsole.js";
import { CreateDatabaseCommand, CreateRoutesCommand, GenerateControllerCommand, GenerateEntityCommand, GenerateMigrationCommand, HelpCommand, LoadFixturesCommand, MigrateMigrationCommand, ShowControllersCommand, ShowEntitiesCommand, ShowMigrationsCommand, ShowRepositoriesCommand } from "./commands/index.js";
export class Kernel {
    static commands = {
        "create:database": CreateDatabaseCommand,
        "make:routes": CreateRoutesCommand,
        "make:entity": GenerateEntityCommand,
        "make:controller": GenerateControllerCommand,
        "make:migration": GenerateMigrationCommand,
        "migration:migrate": MigrateMigrationCommand,
        "fixtures:load": LoadFixturesCommand,
        "show:controllers": ShowControllersCommand,
        "show:entities": ShowEntitiesCommand,
        "show:migrations": ShowMigrationsCommand,
        "show:repositories": ShowRepositoriesCommand,
        "show:routes": ShowRoutesCommand
    };
    static async run(argv) {
        try {
            const [, , commandName, ...args] = argv;
            if (!commandName) {
                const helpCommand = new HelpCommand();
                await helpCommand.execute();
                return;
            }
            const CommandClass = this.commands[commandName];
            if (!CommandClass) {
                throw new Error(`Unknown command: ${commandName}`);
            }
            const commandInstance = new CommandClass();
            await commandInstance.execute(args);
        }
        catch (error) {
            LyraConsole.error(error.message);
            process.exit(1);
        }
    }
}
//# sourceMappingURL=Kernel.js.map