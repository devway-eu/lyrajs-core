import * as dotenv from "dotenv"

import { LyraConsole } from "@/core/console/LyraConsole"
import { MigrationExecutor } from "@/core/orm/migration/executor/MigrationExecutor"
import { db } from "@/core/orm"

dotenv.config()

/**
 * RefreshMigrationCommand class
 * Rolls back all migrations and re-runs them from scratch
 * Useful for testing migration reversibility and getting a clean state
 */
export class RefreshMigrationCommand {
  /**
   * Executes the refresh migration command
   * Rolls back all migrations and re-runs them
   * @param {string[]} args - Command arguments [--force]
   * @returns {Promise<void>}
   */
  async execute(args: string[]) {
    const force = args.includes('--force')

    const GREEN = '\x1b[32m'
    const YELLOW = '\x1b[33m'
    const RED = '\x1b[31m'
    const CYAN = '\x1b[36m'
    const RESET = '\x1b[0m'

    // Safety check - require --force flag
    if (!force) {
      console.log(`${YELLOW}⚠️  WARNING: Potentially Destructive Operation${RESET}`)
      console.log(`${YELLOW}This command will rollback ALL migrations and re-run them.${RESET}`)
      console.log(`${YELLOW}This tests migration reversibility but may cause data loss.${RESET}\n`)
      console.log(`To proceed, run: ${CYAN}npx maestro migration:refresh --force${RESET}\n`)
      return
    }

    try {
      const executor = new MigrationExecutor(db)

      console.log(`${YELLOW}⚠  Starting refresh migration process...${RESET}`)
      console.log(`${CYAN}Step 1/2: Rolling back all migrations${RESET}`)

      // Rollback all migrations
      await executor.rollbackAll()

      console.log(`\n${CYAN}Step 2/2: Re-running all migrations${RESET}`)

      // Re-run all migrations
      await executor.migrate()

      console.log(`\n${GREEN}✓ Refresh migration completed successfully${RESET}`)
      console.log(`${GREEN}All migrations have been rolled back and re-applied${RESET}`)
    } catch (error: any) {
      console.log(`\n${RED}❌ Refresh migration failed: ${error.message}${RESET}`)
      throw error
    }
  }
}
