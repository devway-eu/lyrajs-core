import * as fs from 'fs'
import * as path from 'path'
import * as process from 'process'

import { LyraConsole } from '../../../console/LyraConsole'
import { MigrationInterface } from '../interfaces/MigrationInterface'
import { MigrationLockManager } from '../lock/MigrationLockManager'
import { MigrationValidator } from '../validator/MigrationValidator'
import { SchemaIntrospector } from '../introspector/SchemaIntrospector'
import { BackupManager } from '../backup/BackupManager'
import { MigrateOptions, MigrationRecord, Checkpoint } from '../interfaces/types'

/**
 * MigrationExecutor
 * Executes and tracks migrations with transaction support
 */
export class MigrationExecutor {
  constructor(private connection: any) {}

  /**
   * Execute all pending migrations
   */
  async migrate(options: MigrateOptions = {}): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
      const GREEN = '\x1b[32m'
      const CYAN = '\x1b[36m'
      const RESET = '\x1b[0m'

      // 1. Load all migrations
      const allMigrations = await this.loadAllMigrations()

      // 2. Get executed migrations
      const executed = await this.getExecutedMigrations()

      // 3. Find pending migrations
      const pending = allMigrations.filter(m =>
        !executed.some(e => e.version === m.version)
      )

      if (pending.length === 0) {
        console.log(`${GREEN}✓ No pending migrations - database is up to date${RESET}`)
        return
      }

      console.log(`${CYAN}Found ${pending.length} pending migration(s) to execute${RESET}`)

      // 4. Validate each migration
      if (!options.force) {
        console.log(`${CYAN}Validating migrations...${RESET}`)
        await this.validateMigrations(pending)
      }

      // 5. Get next batch number
      const nextBatch = await this.getNextBatchNumber()

      // 6. Execute migrations sequentially (parallel support can be added in Phase 2)
      for (const migration of pending) {
        await this.executeMigration(migration, nextBatch, options)
      }

      console.log(`\n${GREEN}✓ Successfully executed ${pending.length} migration(s) in batch ${nextBatch}${RESET}`)
    })
  }

  /**
   * Rollback the last batch of migrations
   */
  async rollback(steps: number = 1): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
      const GREEN = '\x1b[32m'
      const YELLOW = '\x1b[33m'
      const CYAN = '\x1b[36m'
      const RESET = '\x1b[0m'

      // Get last N batches
      const result = await this.connection.query(`
        SELECT DISTINCT batch
        FROM migrations
        ORDER BY batch DESC
        LIMIT ?
      `, [steps])

      // mysql2 returns [rows, fields], we only need rows
      const batches = Array.isArray(result[0]) ? result[0] : result

      if (batches.length === 0) {
        console.log(`${GREEN}✓ No migrations to rollback - database is clean${RESET}`)
        return
      }

      const batchNumbers = batches.map((b: any) => b.batch).filter((b: any) => b !== null && b !== undefined)

      if (batchNumbers.length === 0) {
        console.log(`${GREEN}✓ No valid batches to rollback${RESET}`)
        return
      }

      // Get migrations to rollback
      const rollbackResult = await this.connection.query(`
        SELECT version
        FROM migrations
        WHERE batch IN (${batchNumbers.join(',')})
        ORDER BY version DESC
      `)
      const toRollback = Array.isArray(rollbackResult[0]) ? rollbackResult[0] : rollbackResult

      console.log(`${YELLOW}⚠ Rolling back ${toRollback.length} migration(s) from batch(es): ${batchNumbers.join(', ')}${RESET}`)

      for (const record of toRollback) {
        const migration = await this.loadMigration(record.version)
        if (migration) {
          await this.rollbackMigration(migration)
        }
      }

      console.log(`\n${GREEN}✓ Successfully rolled back ${toRollback.length} migration(s)${RESET}`)
    })
  }

  /**
   * Rollback to a specific migration version
   * Rolls back all migrations after (and including) the specified version
   */
  async rollbackToVersion(targetVersion: string): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
      const GREEN = '\x1b[32m'
      const YELLOW = '\x1b[33m'
      const RED = '\x1b[31m'
      const RESET = '\x1b[0m'

      // Get all executed migrations
      const executed = await this.getExecutedMigrations()

      // Check if target version exists
      const targetExists = executed.some(m => m.version === targetVersion)
      if (!targetExists) {
        throw new Error(`${RED}Migration version ${targetVersion} not found in executed migrations${RESET}`)
      }

      // Get migrations to rollback (all migrations >= target version)
      const toRollback = executed
        .filter(m => m.version >= targetVersion)
        .sort((a, b) => b.version.localeCompare(a.version)) // Descending order

      if (toRollback.length === 0) {
        console.log(`${GREEN}✓ No migrations to rollback - already at target version${RESET}`)
        return
      }

      console.log(`${YELLOW}⚠ Rolling back ${toRollback.length} migration(s) to version ${targetVersion}...${RESET}`)

      for (const record of toRollback) {
        const migration = await this.loadMigration(record.version)
        if (migration) {
          await this.rollbackMigration(migration)
        }
      }

      console.log(`\n${GREEN}✓ Successfully rolled back to version ${targetVersion}${RESET}`)
    })
  }

  /**
   * Rollback all executed migrations
   * Rolls back every migration in reverse order (most recent first)
   */
  async rollbackAll(): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
      const GREEN = '\x1b[32m'
      const YELLOW = '\x1b[33m'
      const RESET = '\x1b[0m'

      // Get all executed migrations
      const executed = await this.getExecutedMigrations()

      if (executed.length === 0) {
        console.log(`${GREEN}✓ No migrations to rollback - database is clean${RESET}`)
        return
      }

      // Sort in descending order (rollback most recent first)
      const toRollback = executed.sort((a, b) => b.version.localeCompare(a.version))

      console.log(`${YELLOW}⚠ Rolling back all ${toRollback.length} migration(s)...${RESET}`)

      for (const record of toRollback) {
        const migration = await this.loadMigration(record.version)
        if (migration) {
          await this.rollbackMigration(migration)
        }
      }

      console.log(`\n${GREEN}✓ Successfully rolled back all ${toRollback.length} migration(s)${RESET}`)
    })
  }

  /**
   * Show migration status with enhanced details
   */
  async status(): Promise<void> {
    const allMigrations = await this.loadAllMigrations()
    const executed = await this.getExecutedMigrations()
    const pending = allMigrations.filter(m => !executed.some(e => e.version === m.version))

    const output: string[] = ["MIGRATIONS"]

    // Build table data with all migrations
    interface MigrationRow {
      version: string
      status: string
      batch: string
      time: string
      date: string
      flags: string
    }

    const rows: MigrationRow[] = []

    // Add executed migrations
    for (const m of executed) {
      const migration = await this.loadMigration(m.version)
      const flags: string[] = []

      if (migration?.isDestructive) {
        flags.push("\u26A0")  // ⚠ Warning sign
      }
      if (m.backup_path) {
        flags.push("\u2713")  // ✓ Check mark
      }

      rows.push({
        version: m.version,
        status: "\u2713 Executed",  // ✓ Check mark
        batch: m.batch.toString(),
        time: m.execution_time ? `${m.execution_time}ms` : "-",
        date: m.executed_at ? new Date(m.executed_at).toLocaleDateString() : "-",
        flags: flags.join(" ")
      })
    }

    // Add pending migrations
    for (const m of pending) {
      const flags: string[] = []
      if (m.isDestructive) {
        flags.push("\u26A0")  // ⚠ Warning sign
      }

      rows.push({
        version: m.version,
        status: "\u25CB Pending",  // ○ White circle
        batch: "-",
        time: "-",
        date: "-",
        flags: flags.join(" ")
      })
    }

    // Calculate column widths
    const versionWidth = Math.max(15, ...rows.map(r => r.version.length))
    const statusWidth = Math.max(10, ...rows.map(r => r.status.length))
    const batchWidth = 6
    const timeWidth = 8
    const dateWidth = 12
    const flagsWidth = 6

    // Build table
    output.push(
      `┌${"─".repeat(versionWidth + 2)}┬${"─".repeat(statusWidth + 2)}┬${"─".repeat(batchWidth + 2)}┬${"─".repeat(timeWidth + 2)}┬${"─".repeat(dateWidth + 2)}┬${"─".repeat(flagsWidth + 2)}┐`
    )
    output.push(
      `│ ${"VERSION".padEnd(versionWidth)} │ ${"STATUS".padEnd(statusWidth)} │ ${"BATCH".padEnd(batchWidth)} │ ${"TIME".padEnd(timeWidth)} │ ${"DATE".padEnd(dateWidth)} │ ${"FLAGS".padEnd(flagsWidth)} │`
    )
    output.push(
      `├${"─".repeat(versionWidth + 2)}┼${"─".repeat(statusWidth + 2)}┼${"─".repeat(batchWidth + 2)}┼${"─".repeat(timeWidth + 2)}┼${"─".repeat(dateWidth + 2)}┼${"─".repeat(flagsWidth + 2)}┤`
    )

    for (const row of rows) {
      output.push(
        `│ ${row.version.padEnd(versionWidth)} │ ${row.status.padEnd(statusWidth)} │ ${row.batch.padEnd(batchWidth)} │ ${row.time.padEnd(timeWidth)} │ ${row.date.padEnd(dateWidth)} │ ${row.flags.padEnd(flagsWidth)} │`
      )
    }

    output.push(
      `└${"─".repeat(versionWidth + 2)}┴${"─".repeat(statusWidth + 2)}┴${"─".repeat(batchWidth + 2)}┴${"─".repeat(timeWidth + 2)}┴${"─".repeat(dateWidth + 2)}┴${"─".repeat(flagsWidth + 2)}┘`
    )

    // Add summary
    output.push("")
    output.push(`Total: ${allMigrations.length} \u2502 Executed: ${executed.length} \u2502 Pending: ${pending.length}`)

    if (executed.length > 0) {
      const latestBatch = Math.max(...executed.map(m => m.batch))
      const withBackups = executed.filter(m => m.backup_path).length
      const totalTime = executed.reduce((sum, m) => sum + (m.execution_time || 0), 0)
      output.push(`Latest batch: ${latestBatch} \u2502 With backups: ${withBackups} \u2502 Total time: ${totalTime}ms`)
    }

    output.push("")
    output.push("Legend: \u2713=Executed \u25CB=Pending \u26A0=Destructive")

    LyraConsole.success(...output)
  }

  /**
   * Validate pending migrations
   */
  private async validateMigrations(migrations: MigrationInterface[]): Promise<void> {
    const validator = new MigrationValidator(this.connection)
    const introspector = new SchemaIntrospector(this.connection)
    const currentSchema = await introspector.getCurrentSchema()

    for (const migration of migrations) {
      const validation = await validator.validate(migration, currentSchema)

      if (!validation.valid) {
        console.error(`❌ Migration ${migration.version} validation failed:`)
        validation.errors.forEach(err => console.error(`  - ${err}`))
        throw new Error('Migration validation failed')
      }

      if (validation.warnings && validation.warnings.length > 0) {
        console.warn(`⚠️  Migration ${migration.version} has warnings:`)
        validation.warnings.forEach(warn => console.warn(`  - ${warn}`))
      }

      if (validation.suggestions && validation.suggestions.length > 0) {
        validation.suggestions.forEach(suggestion => console.log(`  💡 ${suggestion}`))
      }
    }
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(
    migration: MigrationInterface,
    batch: number,
    options: MigrateOptions
  ): Promise<void> {
    const startTime = Date.now()
    let backupPath: string | null = null

    const GREEN = '\x1b[32m'
    const CYAN = '\x1b[36m'
    const YELLOW = '\x1b[33m'
    const RED = '\x1b[31m'
    const RESET = '\x1b[0m'

    try {
      console.log(`${CYAN}▶ Running migration: ${migration.version}${RESET}`)

      // Create backup if migration is destructive or requires backup
      if (migration.isDestructive || migration.requiresBackup) {
        console.log(`  ${YELLOW}⚠ Destructive migration detected - creating backup...${RESET}`)

        const backupManager = new BackupManager(this.connection)
        backupPath = await backupManager.createBackup(migration.version)

        console.log(`  ${GREEN}✓ Backup created: ${path.basename(backupPath)}${RESET}`)
      }

      if (options.dryRun) {
        if (migration.dryRun) {
          const sql = await migration.dryRun(this.connection)
          console.log(`  ${CYAN}SQL Preview:${RESET}`)
          sql.forEach(s => console.log(`    ${s}`))
        }
        return
      }

      // Start transaction
      await this.connection.query('START TRANSACTION')

      // Execute migration
      await migration.up(this.connection)

      // Record in migrations table with backup path
      const executionTime = Date.now() - startTime
      await this.connection.query(`
        INSERT INTO migrations (version, executed_at, execution_time, batch, squashed, backup_path)
        VALUES (?, NOW(), ?, ?, ?, ?)
      `, [
        migration.version,
        executionTime,
        batch,
        false,
        backupPath
      ])

      // Commit transaction
      await this.connection.query('COMMIT')

      console.log(`  ${GREEN}✓ Completed in ${executionTime}ms${RESET}`)

    } catch (error: any) {
      // Rollback on error
      await this.connection.query('ROLLBACK')
      console.error(`  ${RED}❌ Migration failed: ${error.message}${RESET}`)

      // Keep backup on error for recovery
      if (backupPath) {
        console.log(`  ${YELLOW}💾 Backup preserved at: ${backupPath}${RESET}`)
        console.log(`  ${YELLOW}   You can restore using: npx maestro restore:backup ${migration.version}${RESET}`)
      }

      throw new Error(`Migration ${migration.version} failed: ${error.message}`)
    }
  }

  /**
   * Rollback a single migration
   */
  private async rollbackMigration(migration: MigrationInterface): Promise<void> {
    const startTime = Date.now()

    const GREEN = '\x1b[32m'
    const YELLOW = '\x1b[33m'
    const RED = '\x1b[31m'
    const RESET = '\x1b[0m'

    try {
      console.log(`${YELLOW}◀ Rolling back: ${migration.version}${RESET}`)

      await this.connection.query('START TRANSACTION')

      // Execute down migration
      await migration.down(this.connection)

      // Remove from migrations table
      await this.connection.query(`
        DELETE FROM migrations WHERE version = ?
      `, [migration.version])

      await this.connection.query('COMMIT')

      const duration = Date.now() - startTime
      console.log(`  ${GREEN}✓ Rolled back in ${duration}ms${RESET}`)

    } catch (error: any) {
      await this.connection.query('ROLLBACK')
      console.error(`  ${RED}❌ Rollback failed: ${error.message}${RESET}`)
      throw new Error(`Rollback of ${migration.version} failed: ${error.message}`)
    }
  }

  /**
   * Load all migration files from migrations folder
   */
  private async loadAllMigrations(): Promise<MigrationInterface[]> {
    const migrations: MigrationInterface[] = []
    const migrationDir = path.join(process.cwd(), 'migrations')

    if (!fs.existsSync(migrationDir)) {
      return migrations
    }

    const files = fs.readdirSync(migrationDir)
      .filter(f => f.startsWith('Migration_') && f.endsWith('.ts'))
      .sort()

    for (const file of files) {
      const migration = await this.loadMigration(file.replace('.ts', ''))
      if (migration) {
        migrations.push(migration)
      }
    }

    return migrations
  }

  /**
   * Load a specific migration by version
   */
  private async loadMigration(version: string): Promise<MigrationInterface | null> {
    try {
      const migrationDir = path.join(process.cwd(), 'migrations')
      const files = fs.readdirSync(migrationDir)

      // Find file that contains this version
      const fileName = files.find(f => f.includes(version) && f.endsWith('.ts'))
      if (!fileName) {
        console.warn(`Warning: Migration file for version ${version} not found`)
        return null
      }

      const filePath = path.join(migrationDir, fileName)
      const migrationModule = await import(`file://${filePath}`)

      // Get the class name from the file
      const className = fileName.replace('.ts', '')
      const MigrationClass = migrationModule[className]

      if (!MigrationClass) {
        console.warn(`Warning: Migration class ${className} not found in ${fileName}`)
        return null
      }

      return new MigrationClass()
    } catch (error: any) {
      console.warn(`Warning: Could not load migration ${version}:`, error.message)
      return null
    }
  }

  /**
   * Get all executed migrations from database
   */
  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    try {
      const result = await this.connection.query(`
        SELECT version, executed_at, execution_time, batch, squashed, backup_path
        FROM migrations
        ORDER BY version ASC
      `)

      const rows = Array.isArray(result[0]) ? result[0] : result

      return rows.map((row: any) => ({
        version: row.version,
        executed_at: row.executed_at,
        execution_time: row.execution_time,
        batch: row.batch,
        squashed: row.squashed === 1 || row.squashed === true,
        backup_path: row.backup_path
      }))
    } catch (error) {
      // Migrations table might not exist yet
      return []
    }
  }

  /**
   * Get the next batch number for migrations
   */
  private async getNextBatchNumber(): Promise<number> {
    try {
      const result = await this.connection.query(`
        SELECT MAX(batch) as maxBatch FROM migrations
      `)

      const rows = Array.isArray(result[0]) ? result[0] : result
      const maxBatch = rows[0]?.maxBatch || 0
      return maxBatch + 1
    } catch (error) {
      return 1
    }
  }
}
