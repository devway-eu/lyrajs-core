import { LyraConsole } from "../../console/LyraConsole"

/**
 * HelpCommand class
 * Displays available CLI commands and their descriptions
 * Shows the LyraJS ASCII art banner and command list
 */
export class HelpCommand {
  /**
   * Executes the help command
   * Prints all available commands with their descriptions
   * @returns {Promise<void>}
   */
  async execute() {
    LyraConsole.info(
      "                       _             \n" +
        "  /\\/\\   __ _  ___  ___| |_ _ __ ___  \n" +
        " /    \\ / _` |/ _ \\/ __| __| '__/ _ \\ \n" +
        "/ /\\/\\ \\ (_| |  __/\\__ \\ |_| | | (_) |\n" +
        "\\/    \\/\\__,_|\\___||___/\\__|_|  \\___/\n" +
        " By Devway                             \n" +
        "                                       \n" +
        " HELP - COMMANDS                       \n",
      "create:database      \u279E Creates new database named after the DB_NAME .env variable",
      "make:entity          \u279E Creates new entity and help you to set properties, and creates related repository",
      "make:controller      \u279E Creates new controller based on entity, blank controller with methods, or totally blank controller",
      "make:routes          \u279E Creates a routes file based on a controller's methods",
      "make:migration       \u279E Generates incremental TypeScript migration from entity changes",
      "make:fixtures        \u279E Creates new fixture file for database seeding",
      "migration:migrate    \u279E Executes all pending migrations with tracking and transactions",
      "migration:rollback   \u279E Rolls back migrations (use --steps=N or --version=V)",
      "fixtures:load        \u279E Loads all fixtures with dependency resolution (use --only, --exclude, --append flags)",
      "show:controllers     \u279E Shows all controllers",
      "show:entities        \u279E Shows all entities",
      "show:migrations      \u279E Shows migration status (executed vs pending)",
      "show:repositories    \u279E Shows all repositories",
      "show:routes          \u279E Shows all API routes"
    )
  }
}
