import * as dotenv from "dotenv"
import mysql from "mysql2/promise"

import { LyraConsole } from "@/core/console/LyraConsole"
import { MigrationExecutor } from "@/core/orm/migration/executor/MigrationExecutor"
import { db } from "@/core/orm"

dotenv.config()

/**
 * FreshMigrationCommand class
 * Drops all tables and re-runs all migrations from scratch
 * Useful for development to get a clean database state
 */
export class FreshMigrationCommand {
  /**
   * Executes the fresh migration command
   * Drops all database tables and re-runs all migrations
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
      console.log(`${RED}⚠️  WARNING: Destructive Operation${RESET}`)
      console.log(`${YELLOW}This command will DROP ALL TABLES in your database!${RESET}`)
      console.log(`${YELLOW}All data will be permanently lost.${RESET}\n`)
      console.log(`To proceed, run: ${CYAN}npx maestro migration:fresh --force${RESET}\n`)
      return
    }

    const connection = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    try {
      console.log(`${YELLOW}⚠  Starting fresh migration process...${RESET}`)
      console.log(`${CYAN}Step 1/3: Dropping all tables${RESET}`)

      // Get all tables
      const [tables] = await connection.query(`
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
      `)

      const tableList = (tables as any[]).map(t => t.TABLE_NAME)

      if (tableList.length === 0) {
        console.log(`${GREEN}✓ No tables to drop${RESET}`)
      } else {
        // Disable foreign key checks temporarily
        await connection.query('SET FOREIGN_KEY_CHECKS = 0')

        // Drop all tables
        for (const tableName of tableList) {
          await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``)
          console.log(`  ${YELLOW}Dropped table: ${tableName}${RESET}`)
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1')

        console.log(`${GREEN}✓ Dropped ${tableList.length} table(s)${RESET}\n`)
      }

      // Step 2: Initialize migration tables
      console.log(`${CYAN}Step 2/3: Initializing migration tables${RESET}`)

      await connection.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          version VARCHAR(255) PRIMARY KEY,
          executed_at DATETIME NOT NULL,
          execution_time INT,
          batch INT NOT NULL,
          squashed BOOLEAN DEFAULT FALSE,
          backup_path VARCHAR(500) NULL,
          INDEX idx_batch (batch),
          INDEX idx_squashed (squashed)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)

      await connection.query(`
        CREATE TABLE IF NOT EXISTS migration_lock (
          id INT PRIMARY KEY AUTO_INCREMENT,
          locked_at DATETIME NOT NULL,
          hostname VARCHAR(255) NOT NULL,
          process_id INT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)

      console.log(`${GREEN}✓ Migration tables initialized${RESET}\n`)

      // Step 3: Re-run all migrations
      console.log(`${CYAN}Step 3/3: Running all migrations${RESET}`)

      const executor = new MigrationExecutor(db)
      await executor.migrate()

      console.log(`\n${GREEN}✓ Fresh migration completed successfully${RESET}`)
      console.log(`${GREEN}Database has been reset and all migrations applied${RESET}`)
    } catch (error: any) {
      console.log(`\n${RED}❌ Fresh migration failed: ${error.message}${RESET}`)
      throw error
    } finally {
      await connection.end()
    }
  }
}
