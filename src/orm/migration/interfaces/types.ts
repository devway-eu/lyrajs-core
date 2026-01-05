/**
 * Core types for the LyraJS Migration System
 */

/**
 * Column definition from database introspection or entity metadata
 */
export interface ColumnDefinition {
  name: string
  type: string
  length?: number
  nullable: boolean
  default?: any
  primary: boolean
  unique: boolean
  autoIncrement: boolean
  comment?: string
}

/**
 * Index definition from database introspection or entity metadata
 */
export interface IndexDefinition {
  name: string
  columns: string[]
  unique: boolean
  type: string
}

/**
 * Foreign key definition from database introspection or entity metadata
 */
export interface ForeignKeyDefinition {
  name: string
  column: string
  referencedTable: string
  referencedColumn: string
  onUpdate: string
  onDelete: string
}

/**
 * Table definition from database introspection or entity metadata
 */
export interface TableDefinition {
  name: string
  columns: ColumnDefinition[]
  indexes: IndexDefinition[]
  foreignKeys: ForeignKeyDefinition[]
}

/**
 * Schema difference types
 */
export interface TableRename {
  from: string
  to: string
}

export interface ColumnRename {
  table: string
  from: string
  to: string
  confidence: number
}

export interface ColumnChange {
  table: string
  column: string
  changeType: 'TYPE_CHANGE' | 'NULLABLE_CHANGE' | 'DEFAULT_CHANGE'
  from: any
  to: any
}

export interface ColumnToAdd {
  table: string
  column: ColumnDefinition
}

export interface ColumnToRemove {
  table: string
  column: string
}

export interface IndexToAdd {
  table: string
  index: IndexDefinition
}

export interface IndexToRemove {
  table: string
  index: string
}

export interface ForeignKeyToAdd {
  table: string
  foreignKey: ForeignKeyDefinition
}

export interface ForeignKeyToRemove {
  table: string
  foreignKey: string
}

/**
 * Complete schema diff result
 */
export interface SchemaDiff {
  tablesToCreate: TableDefinition[]
  tablesToRename: TableRename[]
  tablesToDrop: string[]

  columnsToAdd: ColumnToAdd[]
  columnsToRename: ColumnRename[]
  columnsToModify: ColumnChange[]
  columnsToRemove: ColumnToRemove[]

  indexesToAdd: IndexToAdd[]
  indexesToRemove: IndexToRemove[]

  foreignKeysToAdd: ForeignKeyToAdd[]
  foreignKeysToRemove: ForeignKeyToRemove[]

  isEmpty(): boolean
  isDestructive(): boolean
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
  suggestions?: string[]
  canProceed?: boolean
  requiresConfirmation?: boolean
}

/**
 * Migration execution options
 */
export interface MigrateOptions {
  dryRun?: boolean
  force?: boolean
  parallel?: boolean
  online?: boolean
}

/**
 * Migration generation options
 */
export interface GenerateOptions {
  name?: string
  useSnapshot?: boolean
}

/**
 * Checkpoint for rollback
 */
export interface Checkpoint {
  id: string
  timestamp: number
}

/**
 * Table information for analysis
 */
export interface TableInfo {
  name: string
  rowCount: number
  dataSize: number
  indexSize: number
}

/**
 * Migration record from database
 */
export interface MigrationRecord {
  version: string
  executed_at: Date
  execution_time: number
  batch: number
  squashed: boolean
  backup_path?: string
}
