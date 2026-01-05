/**
 * Migration Interface
 * Contract that all database migrations must implement
 * Defines the structure and behavior of schema migrations in LyraJS
 * @interface
 * @example
 * export class Migration_1234567890 implements MigrationInterface {
 *   readonly version = "1234567890"
 *   readonly isDestructive = false
 *
 *   async up(connection: any): Promise<void> {
 *     await connection.query("CREATE TABLE users (id INT PRIMARY KEY)")
 *   }
 *
 *   async down(connection: any): Promise<void> {
 *     await connection.query("DROP TABLE users")
 *   }
 * }
 */
export interface MigrationInterface {
  /**
   * Unique version identifier for this migration
   * Typically a Unix timestamp (milliseconds) representing when the migration was created
   * @example "1767607917120"
   */
  readonly version: string

  /**
   * Indicates if this migration performs destructive operations
   * When true, automatic backup is created before execution
   * Examples: DROP TABLE, DROP COLUMN, TRUNCATE
   * @default false
   */
  readonly isDestructive?: boolean

  /**
   * Forces backup creation regardless of isDestructive flag
   * Useful for risky operations that aren't strictly destructive
   * @default false
   */
  readonly requiresBackup?: boolean

  /**
   * Automatically rollback migration if execution fails
   * Set to false for migrations that handle their own error recovery
   * @default true
   */
  readonly autoRollbackOnError?: boolean

  /**
   * List of migration versions that must be executed before this one
   * Ensures proper execution order for dependent schema changes
   * @example ["1767607917120", "1767608034567"]
   */
  readonly dependsOn?: string[]

  /**
   * List of migration versions that cannot run alongside this one
   * Prevents concurrent execution of conflicting schema changes
   * @example ["1767608123456"]
   */
  readonly conflictsWith?: string[]

  /**
   * Indicates if this migration can be executed in parallel with others
   * Set to false for migrations that require exclusive database access
   * @default true
   */
  readonly canRunInParallel?: boolean

  /**
   * Executes the migration forward
   * Applies database schema changes defined in this migration
   * Runs within a transaction unless explicitly disabled
   * @param {any} connection - Database connection or pool
   * @returns {Promise<void>}
   * @example
   * async up(connection: any): Promise<void> {
   *   await connection.query(`
   *     ALTER TABLE users
   *     ADD COLUMN email VARCHAR(255) UNIQUE
   *   `)
   * }
   */
  up(connection: any): Promise<void>

  /**
   * Rolls back the migration
   * Reverts database schema changes made by the up() method
   * Should restore the database to its state before up() was executed
   * @param {any} connection - Database connection or pool
   * @returns {Promise<void>}
   * @example
   * async down(connection: any): Promise<void> {
   *   await connection.query(`
   *     ALTER TABLE users
   *     DROP COLUMN email
   *   `)
   * }
   */
  down(connection: any): Promise<void>

  /**
   * Previews SQL statements without executing them
   * Optional method for dry-run capability
   * Useful for reviewing changes before actual execution
   * @param {any} connection - Database connection or pool
   * @returns {Promise<string[]>} Array of SQL statements that would be executed
   * @example
   * async dryRun(connection: any): Promise<string[]> {
   *   return [
   *     "ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE"
   *   ]
   * }
   */
  dryRun?(connection: any): Promise<string[]>

  /**
   * Validates migration before execution
   * Optional method for pre-execution validation
   * Can check for naming conflicts, data integrity, etc.
   * @param {any} schema - Current database schema
   * @returns {Promise<ValidationResult>} Validation result with errors if any
   * @example
   * async validate(schema: any): Promise<ValidationResult> {
   *   if (schema.hasTable('users')) {
   *     return { valid: true, errors: [] }
   *   }
   *   return { valid: false, errors: ['Table users does not exist'] }
   * }
   */
  validate?(schema: any): Promise<import('./types').ValidationResult>
}

/**
 * Base Migration Class
 * Abstract base class providing default implementations for migration interface
 * Reduces boilerplate by providing sensible defaults for optional properties
 * Extend this class instead of implementing MigrationInterface directly
 * @abstract
 * @implements {MigrationInterface}
 * @example
 * export class Migration_1234567890 extends BaseMigration {
 *   readonly version = "1234567890"
 *
 *   async up(connection: any): Promise<void> {
 *     await connection.query("CREATE TABLE products (id INT PRIMARY KEY)")
 *   }
 *
 *   async down(connection: any): Promise<void> {
 *     await connection.query("DROP TABLE products")
 *   }
 * }
 */
export abstract class BaseMigration implements MigrationInterface {
  /**
   * Migration version identifier
   * Must be overridden in concrete implementations
   */
  abstract readonly version: string

  /**
   * Default: non-destructive migration
   * Override to true for DROP, TRUNCATE, or DELETE operations
   */
  readonly isDestructive?: boolean = false

  /**
   * Default: no forced backup
   * Override to true for risky operations
   */
  readonly requiresBackup?: boolean = false

  /**
   * Default: automatic rollback on error
   * Override to false if migration handles errors internally
   */
  readonly autoRollbackOnError?: boolean = true

  /**
   * Default: no dependencies
   * Override to specify required preceding migrations
   */
  readonly dependsOn?: string[] = []

  /**
   * Default: no conflicts
   * Override to specify incompatible concurrent migrations
   */
  readonly conflictsWith?: string[] = []

  /**
   * Default: can run in parallel
   * Override to false for migrations requiring exclusive access
   */
  readonly canRunInParallel?: boolean = true

  /**
   * Apply migration changes
   * Must be implemented in concrete class
   * @param {any} connection - Database connection
   * @returns {Promise<void>}
   */
  abstract up(connection: any): Promise<void>

  /**
   * Revert migration changes
   * Must be implemented in concrete class
   * @param {any} connection - Database connection
   * @returns {Promise<void>}
   */
  abstract down(connection: any): Promise<void>

  /**
   * Preview migration SQL
   * Default implementation returns empty array
   * Override to provide dry-run capability
   * @param {any} connection - Database connection
   * @returns {Promise<string[]>} SQL statements to be executed
   */
  async dryRun(connection: any): Promise<string[]> {
    return []
  }

  /**
   * Validate migration before execution
   * Default implementation always returns valid
   * Override to add custom validation logic
   * @param {any} schema - Current database schema
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(schema: any): Promise<import('./types').ValidationResult> {
    return { valid: true, errors: [] }
  }
}
