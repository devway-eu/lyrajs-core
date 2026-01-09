import { LyraConsole } from "../../console/LyraConsole.js";
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
        LyraConsole.info("                       _             \n" +
            "  /\\/\\   __ _  ___  ___| |_ _ __ ___  \n" +
            " /    \\ / _` |/ _ \\/ __| __| '__/ _ \\ \n" +
            "/ /\\/\\ \\ (_| |  __/\\__ \\ |_| | | (_) |\n" +
            "\\/    \\/\\__,_|\\___||___/\\__|_|  \\___/\n" +
            " By Devway                             \n" +
            "                                       \n" +
            " HELP - COMMANDS                       \n", "cleanup:backups      \u279E Cleans up old backup files (use --days=N, default: 30 days)", "create:database      \u279E Creates new database named after the DB_NAME .env variable", "fixtures:load        \u279E Loads all fixtures with dependency resolution (use --only, --exclude, --append flags)", "make:controller      \u279E Creates new controller based on entity, blank controller with methods, or totally blank controller", "make:entity          \u279E Creates new entity and help you to set properties, and creates related repository", "make:fixtures        \u279E Creates new fixture file for database seeding", "make:job             \u279E Creates new scheduled job class in src/jobs", "make:migration       \u279E Generates incremental TypeScript migration from entity changes", "make:routes          \u279E Creates a routes file based on a controller's methods", "make:scheduler       \u279E Adds a new scheduled method to an existing job class", "migration:fresh      \u279E Drops all tables and re-runs migrations (requires --force)", "migration:migrate    \u279E Executes all pending migrations with tracking, transactions, and automated backups", "migration:refresh    \u279E Rolls back all migrations and re-runs them (requires --force)", "migration:rollback   \u279E Rolls back migrations (use --steps=N or --version=V)", "migration:squash     \u279E Combines multiple migrations into a single baseline migration (use --to=VERSION)", "restore:backup       \u279E Restores database from backup (use migration version)", "show:backups         \u279E Shows all available backup files in a formatted table", "show:controllers     \u279E Shows all controllers", "show:entities        \u279E Shows all entities", "show:migrations      \u279E Shows migration status (executed vs pending)", "show:repositories    \u279E Shows all repositories", "show:routes          \u279E Shows all API routes", "show:schedulers      \u279E Shows all scheduled jobs with their recurrency and status");
    }
}
//# sourceMappingURL=HelpCommand.js.map