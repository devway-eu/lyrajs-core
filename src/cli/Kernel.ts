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
  MakeFixturesCommand,
  MigrateMigrationCommand,
  RollbackMigrationCommand,
  ShowControllersCommand,
  ShowEntitiesCommand,
  ShowMigrationsCommand,
  ShowRepositoriesCommand
} from "./commands"

type CommandMap = Record<string, { new (): ICommand }>

/**
 * Interface for CLI command classes
 * All command classes must implement this interface
 */
export interface ICommand {
  execute(args: string[]): Promise<void>
}

/**
 * CLI Kernel class
 * Handles command parsing, routing, and execution
 * Manages the lifecycle of CLI commands and provides error handling
 */
export class Kernel {
  private static commands: CommandMap = {
    "create:database": CreateDatabaseCommand,
    "make:routes": CreateRoutesCommand,
    "make:entity": GenerateEntityCommand,
    "make:controller": GenerateControllerCommand,
    "make:migration": GenerateMigrationCommand,
    "make:fixtures": MakeFixturesCommand,
    "migration:migrate": MigrateMigrationCommand,
    "migration:rollback": RollbackMigrationCommand,
    "fixtures:load": LoadFixturesCommand,
    "show:controllers": ShowControllersCommand,
    "show:entities": ShowEntitiesCommand,
    "show:migrations": ShowMigrationsCommand,
    "show:repositories": ShowRepositoriesCommand,
    "show:routes": ShowRoutesCommand
  }

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
  static async run(argv: string[]) {
    try {
      const [, , commandName, ...args] = argv

      if (!commandName) {
        const helpCommand = new HelpCommand()
        await helpCommand.execute()
        process.exit(0)
      }

      const CommandClass = this.commands[commandName]
      if (!CommandClass) {
        throw new Error(`Unknown command: ${commandName}`)
      }

      const commandInstance = new CommandClass()
      await commandInstance.execute(args)
      process.exit(0)
    } catch (error: any) {
      LyraConsole.error(error.message)
      process.exit(1)
    }
  }
}
