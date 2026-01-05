/**
 * Migration Interface
 * All migrations must implement this interface
 */
export interface MigrationInterface {
  /**
   * Unique version identifier (timestamp)
   */
  readonly version: string

  /**
   * Safety flags
   */
  readonly isDestructive?: boolean
  readonly requiresBackup?: boolean
  readonly autoRollbackOnError?: boolean

  /**
   * Dependencies and parallelization
   */
  readonly dependsOn?: string[]
  readonly conflictsWith?: string[]
  readonly canRunInParallel?: boolean

  /**
   * Execute the migration (forward)
   */
  up(connection: any): Promise<void>

  /**
   * Rollback the migration (backward)
   */
  down(connection: any): Promise<void>

  /**
   * Preview SQL without executing (optional)
   */
  dryRun?(connection: any): Promise<string[]>

  /**
   * Validate before running (optional)
   */
  validate?(schema: any): Promise<import('./types').ValidationResult>
}

/**
 * Base migration class with helper methods
 */
export abstract class BaseMigration implements MigrationInterface {
  abstract readonly version: string

  readonly isDestructive?: boolean = false
  readonly requiresBackup?: boolean = false
  readonly autoRollbackOnError?: boolean = true
  readonly dependsOn?: string[] = []
  readonly conflictsWith?: string[] = []
  readonly canRunInParallel?: boolean = true

  abstract up(connection: any): Promise<void>
  abstract down(connection: any): Promise<void>

  async dryRun(connection: any): Promise<string[]> {
    return []
  }

  async validate(schema: any): Promise<import('./types').ValidationResult> {
    return { valid: true, errors: [] }
  }
}
