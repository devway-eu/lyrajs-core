import { db, LyraConsole } from "@/core/orm"
import { MigrationExecutor } from "@/core/orm/migration"

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
      const executor = new MigrationExecutor(db)
      await executor.status()
    } catch (error: any) {
      LyraConsole.error(`Failed to get migration status: ${error.message}`)
      throw error
    }
  }
}
