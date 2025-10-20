import { ShowRoutesCommand } from "@/core/cli/commands/ShowRoutesCommand"
import { LyraConsole } from "@/core/console/LyraConsole"

import {
  CreateDatabaseCommand,
  CreateRoutesCommand,
  GenerateControllerCommand,
  GenerateEntityCommand,
  GenerateMigrationCommand,
  HelpCommand,
  LoadFixturesCommand,
  MigrateMigrationCommand,
  ShowControllersCommand,
  ShowEntitiesCommand,
  ShowMigrationsCommand,
  ShowRepositoriesCommand
} from "./commands"

type CommandMap = Record<string, { new (): ICommand }>

export interface ICommand {
  execute(args: string[]): Promise<void>
}

export class Kernel {
  private static commands: CommandMap = {
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
  }

  static async run(argv: string[]) {
    try {
      const [, , commandName, ...args] = argv

      if (!commandName) {
        const helpCommand = new HelpCommand()
        await helpCommand.execute()
        return
      }

      const CommandClass = this.commands[commandName]
      if (!CommandClass) {
        throw new Error(`Unknown command: ${commandName}`)
      }

      const commandInstance = new CommandClass()
      await commandInstance.execute(args)
    } catch (error: any) {
      LyraConsole.error(error.message, "")
      process.exit(1)
    }
  }
}
