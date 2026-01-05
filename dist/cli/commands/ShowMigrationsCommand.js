import { db, LyraConsole } from "../../orm/index.js";
import { MigrationExecutor } from "../../orm/migration/index.js";
/**
 * ShowMigrationsCommand class
 * Shows the status of all migrations (executed and pending)
 * Uses the new TypeScript-based migration system
 */
export class ShowMigrationsCommand {
    /**
     * Executes the show migrations command
     * Displays all migrations with their execution status
     * @returns {Promise<void>}
     */
    async execute() {
        try {
            const executor = new MigrationExecutor(db);
            await executor.status();
        }
        catch (error) {
            LyraConsole.error(`Failed to get migration status: ${error.message}`);
            throw error;
        }
    }
}
//# sourceMappingURL=ShowMigrationsCommand.js.map