import { TableDefinition, ColumnDefinition, SchemaDiff } from './types'

/**
 * Database Schema
 * Represents a complete database schema with all tables, columns, indexes, and foreign keys
 * Provides methods for schema manipulation, comparison, and serialization
 * Used by schema introspection and migration diffing systems
 * @class
 * @example
 * const schema = new DatabaseSchema()
 * schema.addTable({
 *   name: 'users',
 *   columns: [{ name: 'id', type: 'bigint', primary: true }],
 *   indexes: [],
 *   foreignKeys: []
 * })
 * console.log(schema.hasTable('users')) // true
 */
export class DatabaseSchema {
  /**
   * Internal map of table definitions indexed by table name
   * @private
   */
  private tables: Map<string, TableDefinition> = new Map()

  /**
   * Adds a table definition to the schema
   * If a table with the same name exists, it will be replaced
   * @param {TableDefinition} table - Table definition to add
   * @returns {void}
   * @example
   * schema.addTable({
   *   name: 'products',
   *   columns: [{ name: 'id', type: 'int', primary: true }],
   *   indexes: [],
   *   foreignKeys: []
   * })
   */
  addTable(table: TableDefinition): void {
    this.tables.set(table.name, table)
  }

  /**
   * Retrieves a table definition by name
   * @param {string} name - Table name
   * @returns {TableDefinition | undefined} Table definition or undefined if not found
   * @example
   * const userTable = schema.getTable('users')
   * if (userTable) {
   *   console.log(userTable.columns)
   * }
   */
  getTable(name: string): TableDefinition | undefined {
    return this.tables.get(name)
  }

  /**
   * Gets all table definitions in the schema
   * @returns {TableDefinition[]} Array of all table definitions
   * @example
   * const allTables = schema.getTables()
   * console.log(`Schema has ${allTables.length} tables`)
   */
  getTables(): TableDefinition[] {
    return Array.from(this.tables.values())
  }

  /**
   * Checks if a table exists in the schema
   * @param {string} name - Table name to check
   * @returns {boolean} True if table exists, false otherwise
   * @example
   * if (schema.hasTable('users')) {
   *   console.log('Users table exists')
   * }
   */
  hasTable(name: string): boolean {
    return this.tables.has(name)
  }

  /**
   * Removes a table from the schema
   * @param {string} name - Name of table to remove
   * @returns {void}
   * @example
   * schema.removeTable('old_table')
   */
  removeTable(name: string): void {
    this.tables.delete(name)
  }

  /**
   * Gets names of all tables in the schema
   * @returns {string[]} Array of table names
   * @example
   * const tableNames = schema.getTableNames()
   * console.log('Tables:', tableNames.join(', '))
   */
  getTableNames(): string[] {
    return Array.from(this.tables.keys())
  }

  /**
   * Serializes the schema to a JSON object
   * Useful for caching, logging, or transmission
   * @returns {any} JSON representation of the schema
   * @example
   * const json = schema.toJSON()
   * fs.writeFileSync('schema.json', JSON.stringify(json, null, 2))
   */
  toJSON(): any {
    return {
      tables: Array.from(this.tables.values())
    }
  }

  /**
   * Creates a DatabaseSchema instance from JSON
   * Deserializes a previously serialized schema
   * @static
   * @param {any} json - JSON object containing schema data
   * @returns {DatabaseSchema} New DatabaseSchema instance
   * @example
   * const json = JSON.parse(fs.readFileSync('schema.json', 'utf-8'))
   * const schema = DatabaseSchema.fromJSON(json)
   */
  static fromJSON(json: any): DatabaseSchema {
    const schema = new DatabaseSchema()

    if (json.tables) {
      for (const table of json.tables) {
        schema.addTable(table)
      }
    }

    return schema
  }
}

/**
 * Table Schema Helper
 * Wrapper class providing convenient methods for querying table structure
 * Simplifies access to columns, indexes, and foreign keys within a table
 * @class
 * @example
 * const tableSchema = new TableSchema(tableDefinition)
 * const idColumn = tableSchema.getColumn('id')
 * const pk = tableSchema.getPrimaryKey()
 */
export class TableSchema {
  /**
   * Creates a new TableSchema instance
   * @param {TableDefinition} table - Table definition to wrap
   */
  constructor(private table: TableDefinition) {}

  /**
   * Retrieves a column definition by name
   * @param {string} name - Column name
   * @returns {ColumnDefinition | undefined} Column definition or undefined if not found
   * @example
   * const emailColumn = tableSchema.getColumn('email')
   * if (emailColumn?.unique) {
   *   console.log('Email must be unique')
   * }
   */
  getColumn(name: string): ColumnDefinition | undefined {
    return this.table.columns.find(c => c.name === name)
  }

  /**
   * Checks if a column exists in the table
   * @param {string} name - Column name to check
   * @returns {boolean} True if column exists, false otherwise
   * @example
   * if (tableSchema.hasColumn('deleted_at')) {
   *   console.log('Table supports soft deletes')
   * }
   */
  hasColumn(name: string): boolean {
    return this.table.columns.some(c => c.name === name)
  }

  /**
   * Gets the primary key column
   * @returns {ColumnDefinition | undefined} Primary key column or undefined if none
   * @example
   * const pk = tableSchema.getPrimaryKey()
   * console.log(`Primary key: ${pk?.name}`)
   */
  getPrimaryKey(): ColumnDefinition | undefined {
    return this.table.columns.find(c => c.primary)
  }

  /**
   * Gets all foreign key constraints
   * @returns {ForeignKeyDefinition[]} Array of foreign key definitions
   * @example
   * const fks = tableSchema.getForeignKeys()
   * fks.forEach(fk => console.log(`${fk.column} -> ${fk.referencedTable}`))
   */
  getForeignKeys() {
    return this.table.foreignKeys
  }

  /**
   * Gets all indexes
   * @returns {IndexDefinition[]} Array of index definitions
   * @example
   * const indexes = tableSchema.getIndexes()
   * console.log(`Table has ${indexes.length} indexes`)
   */
  getIndexes() {
    return this.table.indexes
  }
}

/**
 * Schema Diff Result
 * Contains the differences between two database schemas
 * Used by the migration generator to create migration files
 * Tracks all types of schema changes: tables, columns, indexes, and foreign keys
 * @class
 * @implements {SchemaDiff}
 * @example
 * const diff = new SchemaDiffResult()
 * diff.tablesToCreate.push({ name: 'users', columns: [], indexes: [], foreignKeys: [] })
 * if (diff.isDestructive()) {
 *   console.log('This migration requires a backup')
 * }
 */
export class SchemaDiffResult implements SchemaDiff {
  /** Tables to be created */
  tablesToCreate: TableDefinition[] = []

  /** Tables to be renamed (preserves data) */
  tablesToRename: any[] = []

  /** Tables to be dropped (destructive) */
  tablesToDrop: string[] = []

  /** Columns to be added to existing tables */
  columnsToAdd: any[] = []

  /** Columns to be renamed (preserves data) */
  columnsToRename: any[] = []

  /** Columns to be modified (type, length, nullable, etc.) */
  columnsToModify: any[] = []

  /** Columns to be removed (destructive) */
  columnsToRemove: any[] = []

  /** Indexes to be created */
  indexesToAdd: any[] = []

  /** Indexes to be dropped */
  indexesToRemove: any[] = []

  /** Foreign keys to be added */
  foreignKeysToAdd: any[] = []

  /** Foreign keys to be dropped */
  foreignKeysToRemove: any[] = []

  /**
   * Checks if there are no schema changes
   * @returns {boolean} True if no changes detected, false otherwise
   * @example
   * if (diff.isEmpty()) {
   *   console.log('No migrations needed - schema is in sync')
   * }
   */
  isEmpty(): boolean {
    return (
      this.tablesToCreate.length === 0 &&
      this.tablesToRename.length === 0 &&
      this.tablesToDrop.length === 0 &&
      this.columnsToAdd.length === 0 &&
      this.columnsToRename.length === 0 &&
      this.columnsToModify.length === 0 &&
      this.columnsToRemove.length === 0 &&
      this.indexesToAdd.length === 0 &&
      this.indexesToRemove.length === 0 &&
      this.foreignKeysToAdd.length === 0 &&
      this.foreignKeysToRemove.length === 0
    )
  }

  /**
   * Checks if any changes are destructive
   * Destructive changes include table/column drops that cause data loss
   * When true, automatic backup should be created before migration
   * @returns {boolean} True if migration contains destructive operations
   * @example
   * if (diff.isDestructive()) {
   *   console.log('⚠️  Backup will be created before migration')
   * }
   */
  isDestructive(): boolean {
    return (
      this.tablesToDrop.length > 0 ||
      this.columnsToRemove.length > 0
    )
  }
}
