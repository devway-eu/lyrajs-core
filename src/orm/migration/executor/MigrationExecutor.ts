import * as fs from 'fs'
import * as path from 'path'
import * as process from 'process'

import { MigrationInterface } from '../interfaces/MigrationInterface'
import { MigrationLockManager } from '../lock/MigrationLockManager'
import { MigrationValidator } from '../validator/MigrationValidator'
import { SchemaIntrospector } from '../introspector/SchemaIntrospector'
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
      // 1. Load all migrations
      const allMigrations = await this.loadAllMigrations()

      // 2. Get executed migrations
      const executed = await this.getExecutedMigrations()

      // 3. Find pending migrations
      const pending = allMigrations.filter(m =>
        !executed.some(e => e.version === m.version)
      )

      if (pending.length === 0) {
        console.log('✓ No pending migrations')
        return
      }

      console.log(`Found ${pending.length} pending migration(s)`)

      // 4. Validate each migration
      if (!options.force) {
        await this.validateMigrations(pending)
      }

      // 5. Get next batch number
      const nextBatch = await this.getNextBatchNumber()

      // 6. Execute migrations sequentially (parallel support can be added in Phase 2)
      for (const migration of pending) {
        await this.executeMigration(migration, nextBatch, options)
      }

      console.log(`✓ Successfully executed ${pending.length} migration(s)`)
    })
  }

  /**
   * Rollback the last batch of migrations
   */
  async rollback(steps: number = 1): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
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
        console.log('✓ No migrations to rollback')
        return
      }

      const batchNumbers = batches.map((b: any) => b.batch).filter((b: any) => b !== null && b !== undefined)

      if (batchNumbers.length === 0) {
        console.log('✓ No valid batches to rollback')
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

      console.log(`Rolling back ${toRollback.length} migration(s)...`)

      for (const record of toRollback) {
        const migration = await this.loadMigration(record.version)
        if (migration) {
          await this.rollbackMigration(migration)
        }
      }

      console.log(`✓ Rolled back ${toRollback.length} migration(s)`)
    })
  }

  /**
   * Rollback to a specific migration version
   * Rolls back all migrations after (and including) the specified version
   */
  async rollbackToVersion(targetVersion: string): Promise<void> {
    const lockManager = new MigrationLockManager(this.connection)

    await lockManager.withLock(async () => {
      // Get all executed migrations
      const executed = await this.getExecutedMigrations()

      // Check if target version exists
      const targetExists = executed.some(m => m.version === targetVersion)
      if (!targetExists) {
        throw new Error(`Migration version ${targetVersion} not found in executed migrations`)
      }

      // Get migrations to rollback (all migrations >= target version)
      const toRollback = executed
        .filter(m => m.version >= targetVersion)
        .sort((a, b) => b.version.localeCompare(a.version)) // Descending order

      if (toRollback.length === 0) {
        console.log('✓ No migrations to rollback')
        return
      }

      console.log(`Rolling back ${toRollback.length} migration(s) to version ${targetVersion}...`)

      for (const record of toRollback) {
        const migration = await this.loadMigration(record.version)
        if (migration) {
          await this.rollbackMigration(migration)
        }
      }

      console.log(`✓ Rolled back to version ${targetVersion}`)
    })
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    const allMigrations = await this.loadAllMigrations()
    const executed = await this.getExecutedMigrations()

    console.log('\n📊 Migration Status:\n')
    console.log('Executed migrations:')

    if (executed.length === 0) {
      console.log('  (none)')
    } else {
      executed.forEach((m: MigrationRecord) => {
        console.log(`  ✓ ${m.version} (batch: ${m.batch})`)
      })
    }

    const pending = allMigrations.filter(m =>
      !executed.some(e => e.version === m.version)
    )

    console.log('\nPending migrations:')
    if (pending.length === 0) {
      console.log('  (none)')
    } else {
      pending.forEach(m => {
        console.log(`  ⏳ ${m.version}`)
      })
    }

    console.log('')
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

    try {
      console.log(`▶ Running: ${migration.version}`)

      if (options.dryRun) {
        if (migration.dryRun) {
          const sql = await migration.dryRun(this.connection)
          console.log('  SQL Preview:')
          sql.forEach(s => console.log(`    ${s}`))
        }
        return
      }

      // Start transaction
      await this.connection.query('START TRANSACTION')

      // Execute migration
      await migration.up(this.connection)

      // Record in migrations table
      const executionTime = Date.now() - startTime
      await this.connection.query(`
        INSERT INTO migrations (version, executed_at, execution_time, batch, squashed, backup_path)
        VALUES (?, NOW(), ?, ?, ?, ?)
      `, [
        migration.version,
        executionTime,
        batch,
        false,
        null
      ])

      // Commit transaction
      await this.connection.query('COMMIT')

      console.log(`  ✓ Completed in ${executionTime}ms`)

    } catch (error: any) {
      // Rollback on error
      await this.connection.query('ROLLBACK')
      console.error(`  ❌ Failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Rollback a single migration
   */
  private async rollbackMigration(migration: MigrationInterface): Promise<void> {
    const startTime = Date.now()

    try {
      console.log(`◀ Rolling back: ${migration.version}`)

      await this.connection.query('START TRANSACTION')

      // Execute down migration
      await migration.down(this.connection)

      // Remove from migrations table
      await this.connection.query(`
        DELETE FROM migrations WHERE version = ?
      `, [migration.version])

      await this.connection.query('COMMIT')

      const duration = Date.now() - startTime
      console.log(`  ✓ Rolled back in ${duration}ms`)

    } catch (error: any) {
      await this.connection.query('ROLLBACK')
      console.error(`  ❌ Rollback failed: ${error.message}`)
      throw error
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
