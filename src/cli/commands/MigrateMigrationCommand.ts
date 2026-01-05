import { db, LyraConsole } from "@/core/orm"
import { MigrationExecutor } from "@/core/orm/migration"

/**
 * MigrateMigrationCommand class
 * Executes all pending database migrations
 * Uses the new TypeScript-based migration system
 */
export class MigrateMigrationCommand {
  /**
   * Executes the migrate migration command
   * Runs all pending migrations with proper tracking and transactions
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      const executor = new MigrationExecutor(db)
      await executor.migrate()

      LyraConsole.success("Migrations executed successfully")
    } catch (error: any) {
      LyraConsole.error(`Migration execution failed: ${error.message}`)
      throw error
    }
  }
}
