import { TableDefinition, ColumnDefinition, SchemaDiff } from './types'

/**
 * Represents a complete database schema
 */
export class DatabaseSchema {
  private tables: Map<string, TableDefinition> = new Map()

  /**
   * Add a table to the schema
   */
  addTable(table: TableDefinition): void {
    this.tables.set(table.name, table)
  }

  /**
   * Get a table by name
   */
  getTable(name: string): TableDefinition | undefined {
    return this.tables.get(name)
  }

  /**
   * Get all tables
   */
  getTables(): TableDefinition[] {
    return Array.from(this.tables.values())
  }

  /**
   * Check if table exists
   */
  hasTable(name: string): boolean {
    return this.tables.has(name)
  }

  /**
   * Remove a table
   */
  removeTable(name: string): void {
    this.tables.delete(name)
  }

  /**
   * Get table names
   */
  getTableNames(): string[] {
    return Array.from(this.tables.keys())
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      tables: Array.from(this.tables.values())
    }
  }

  /**
   * Create from JSON
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
 * Table helper class
 */
export class TableSchema {
  constructor(private table: TableDefinition) {}

  /**
   * Get column by name
   */
  getColumn(name: string): ColumnDefinition | undefined {
    return this.table.columns.find(c => c.name === name)
  }

  /**
   * Check if column exists
   */
  hasColumn(name: string): boolean {
    return this.table.columns.some(c => c.name === name)
  }

  /**
   * Get primary key column
   */
  getPrimaryKey(): ColumnDefinition | undefined {
    return this.table.columns.find(c => c.primary)
  }

  /**
   * Get all foreign keys
   */
  getForeignKeys() {
    return this.table.foreignKeys
  }

  /**
   * Get all indexes
   */
  getIndexes() {
    return this.table.indexes
  }
}

/**
 * Schema diff result implementation
 */
export class SchemaDiffResult implements SchemaDiff {
  tablesToCreate: TableDefinition[] = []
  tablesToRename: any[] = []
  tablesToDrop: string[] = []

  columnsToAdd: any[] = []
  columnsToRename: any[] = []
  columnsToModify: any[] = []
  columnsToRemove: any[] = []

  indexesToAdd: any[] = []
  indexesToRemove: any[] = []

  foreignKeysToAdd: any[] = []
  foreignKeysToRemove: any[] = []

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

  isDestructive(): boolean {
    return (
      this.tablesToDrop.length > 0 ||
      this.columnsToRemove.length > 0
    )
  }
}
