import * as fs from "node:fs"
import * as path from "node:path"
import * as process from "node:process"

import { EntitySchemaBuilder } from '../builder/EntitySchemaBuilder'
import { SchemaIntrospector } from '../introspector/SchemaIntrospector'
import { SchemaDiffer } from '../differ/SchemaDiffer'
import { DatabaseSchema } from '../interfaces/DatabaseSchema'
import {
  SchemaDiff,
  GenerateOptions,
  TableDefinition,
  ColumnDefinition,
  IndexDefinition,
  ForeignKeyDefinition
} from '../interfaces/types'

/**
 * MigrationGenerator
 * Generates TypeScript migration files based on entity changes
 */
export class MigrationGenerator {
  constructor(private connection: any) {}

  /**
   * Generate a new migration file
   */
  async generate(options: GenerateOptions = {}): Promise<void> {
    console.log('🔍 Analyzing schema changes...')

    // 1. Build desired schema from entities
    const entityBuilder = new EntitySchemaBuilder()
    const desiredSchema = await entityBuilder.buildSchemaFromEntities()

    // 2. Get current schema from database
    const introspector = new SchemaIntrospector(this.connection)

    // Initialize migration tables if they don't exist
    const tablesExist = await introspector.migrationTablesExist()
    if (!tablesExist) {
      console.log('📋 Initializing migration tracking tables...')
      await introspector.initializeMigrationTables()
    }

    const currentSchema = await introspector.getCurrentSchema()

    // 3. Diff the schemas
    const differ = new SchemaDiffer()
    const diff = differ.diff(currentSchema, desiredSchema)

    // 4. Check if there are any changes
    if (diff.isEmpty()) {
      console.log('✓ No schema changes detected')
      return
    }

    // 5. Generate migration class
    const timestamp = Date.now()
    const className = `Migration_${timestamp}`
    const migrationContent = this.buildMigrationClass(className, timestamp, diff)

    // 6. Write migration file
    const migrationDir = path.join(process.cwd(), 'migrations')
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true })
    }

    const filename = `${className}.ts`
    const filepath = path.join(migrationDir, filename)

    fs.writeFileSync(filepath, migrationContent)

    // 7. Show summary
    console.log(`✓ Migration created: ${filename}`)
    this.printDiffSummary(diff)
  }

  /**
   * Build the TypeScript migration class content using string concatenation
   */
  private buildMigrationClass(className: string, timestamp: number, diff: SchemaDiff): string {
    let content = ``

    // Import statement
    content += `import { MigrationInterface } from '../lyrajs-core/src/orm/migration/interfaces/MigrationInterface'\n\n`

    // Class documentation
    content += `/**\n`
    content += ` * Generated migration: ${className}\n`
    content += ` * Generated at: ${new Date(timestamp).toISOString()}\n`
    content += ` */\n`

    // Class declaration
    content += `export class ${className} implements MigrationInterface {\n`
    content += `  readonly version = '${timestamp}'\n`
    content += `  readonly isDestructive = ${diff.isDestructive()}\n`
    content += `  readonly canRunInParallel = true\n\n`

    // up() method
    content += `  async up(connection: any): Promise<void> {\n`
    content += this.generateUpSQL(diff)
    content += `  }\n\n`

    // down() method
    content += `  async down(connection: any): Promise<void> {\n`
    content += this.generateDownSQL(diff)
    content += `  }\n\n`

    // dryRun() method
    content += `  async dryRun(connection: any): Promise<string[]> {\n`
    content += `    return [\n`
    content += this.generateDryRunSQL(diff)
    content += `    ]\n`
    content += `  }\n`

    content += `}\n`

    return content
  }

  /**
   * Generate UP migration SQL
   */
  private generateUpSQL(diff: SchemaDiff): string {
    let sql = ``

    // 1. Drop foreign keys that will be removed
    for (const fkRemove of diff.foreignKeysToRemove) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${fkRemove.table}\\\` DROP FOREIGN KEY \\\`${fkRemove.foreignKey}\\\`\`)\n`
    }

    // 2. Create new tables
    for (const table of diff.tablesToCreate) {
      const createSQL = this.generateCreateTableSQL(table)
      sql += `    await connection.query(\`${createSQL}\`)\n`
    }

    // 3. Drop tables
    for (const tableName of diff.tablesToDrop) {
      sql += `    await connection.query(\`DROP TABLE IF EXISTS \\\`${tableName}\\\`\`)\n`
    }

    // 4. Add columns
    for (const colAdd of diff.columnsToAdd) {
      const addSQL = this.generateAddColumnSQL(colAdd.table, colAdd.column)
      sql += `    await connection.query(\`${addSQL}\`)\n`
    }

    // 5. Modify columns
    for (const colMod of diff.columnsToModify) {
      const modSQL = this.generateModifyColumnSQL(colMod.table, colMod.column, colMod.to)
      sql += `    await connection.query(\`${modSQL}\`)\n`
    }

    // 6. Remove columns
    for (const colRemove of diff.columnsToRemove) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${colRemove.table}\\\` DROP COLUMN \\\`${colRemove.column}\\\`\`)\n`
    }

    // 7. Add indexes
    for (const idxAdd of diff.indexesToAdd) {
      const idxSQL = this.generateAddIndexSQL(idxAdd.table, idxAdd.index)
      sql += `    await connection.query(\`${idxSQL}\`)\n`
    }

    // 8. Remove indexes
    for (const idxRemove of diff.indexesToRemove) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${idxRemove.table}\\\` DROP INDEX \\\`${idxRemove.index}\\\`\`)\n`
    }

    // 9. Add foreign keys
    for (const fkAdd of diff.foreignKeysToAdd) {
      const fkSQL = this.generateAddForeignKeySQL(fkAdd.table, fkAdd.foreignKey)
      sql += `    await connection.query(\`${fkSQL}\`)\n`
    }

    if (sql === ``) {
      sql = `    // No changes\n`
    }

    return sql
  }

  /**
   * Generate DOWN migration SQL (reverse operations)
   */
  private generateDownSQL(diff: SchemaDiff): string {
    let sql = ``

    // Reverse order: remove FKs, remove indexes, restore columns, restore tables

    // 1. Drop foreign keys that were added
    for (const fkAdd of diff.foreignKeysToAdd) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${fkAdd.table}\\\` DROP FOREIGN KEY \\\`${fkAdd.foreignKey.name}\\\`\`)\n`
    }

    // 2. Drop indexes that were added
    for (const idxAdd of diff.indexesToAdd) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${idxAdd.table}\\\` DROP INDEX \\\`${idxAdd.index.name}\\\`\`)\n`
    }

    // 3. Drop columns that were added
    for (const colAdd of diff.columnsToAdd) {
      sql += `    await connection.query(\`ALTER TABLE \\\`${colAdd.table}\\\` DROP COLUMN \\\`${colAdd.column.name}\\\`\`)\n`
    }

    // 4. Restore tables that were dropped
    for (const tableName of diff.tablesToDrop) {
      sql += `    // TODO: Restore table ${tableName} - requires backup\n`
    }

    // 5. Drop tables that were created
    for (const table of diff.tablesToCreate) {
      sql += `    await connection.query(\`DROP TABLE IF EXISTS \\\`${table.name}\\\`\`)\n`
    }

    if (sql === ``) {
      sql = `    // No changes\n`
    }

    return sql
  }

  /**
   * Generate dry run SQL preview
   */
  private generateDryRunSQL(diff: SchemaDiff): string {
    let sql = ``

    for (const table of diff.tablesToCreate) {
      const createSQL = this.generateCreateTableSQL(table).replace(/'/g, "\\'")
      sql += `      '${createSQL}',\n`
    }

    for (const colAdd of diff.columnsToAdd) {
      const addSQL = this.generateAddColumnSQL(colAdd.table, colAdd.column).replace(/'/g, "\\'")
      sql += `      '${addSQL}',\n`
    }

    // Remove trailing comma and newline
    if (sql.endsWith(',\n')) {
      sql = sql.slice(0, -2) + '\n'
    }

    return sql
  }

  /**
   * Generate CREATE TABLE SQL
   */
  private generateCreateTableSQL(table: TableDefinition): string {
    let sql = `CREATE TABLE IF NOT EXISTS \\\`${table.name}\\\` (`

    const columnDefs: string[] = []

    // Add columns
    for (const col of table.columns) {
      let colDef = `\\\`${col.name}\\\` ${col.type.toUpperCase()}`

      if (col.length) {
        colDef += `(${col.length})`
      }

      if (col.autoIncrement) {
        colDef += ' AUTO_INCREMENT'
      }

      if (!col.nullable) {
        colDef += ' NOT NULL'
      }

      if (col.unique) {
        colDef += ' UNIQUE'
      }

      if (col.default !== undefined && col.default !== null) {
        colDef += ` DEFAULT '${col.default}'`
      }

      columnDefs.push(colDef)
    }

    sql += columnDefs.join(', ')

    // Add primary key
    const pk = table.columns.find(c => c.primary)
    if (pk) {
      sql += `, PRIMARY KEY (\\\`${pk.name}\\\`)`
    }

    sql += ')'

    return sql
  }

  /**
   * Generate ADD COLUMN SQL
   */
  private generateAddColumnSQL(tableName: string, column: ColumnDefinition): string {
    let sql = `ALTER TABLE \\\`${tableName}\\\` ADD COLUMN \\\`${column.name}\\\` ${column.type.toUpperCase()}`

    if (column.length) {
      sql += `(${column.length})`
    }

    if (!column.nullable) {
      sql += ' NOT NULL'
    }

    if (column.default !== undefined && column.default !== null) {
      sql += ` DEFAULT '${column.default}'`
    }

    return sql
  }

  /**
   * Generate MODIFY COLUMN SQL
   */
  private generateModifyColumnSQL(tableName: string, columnName: string, newType: any): string {
    return `ALTER TABLE \\\`${tableName}\\\` MODIFY COLUMN \\\`${columnName}\\\` ${newType}`
  }

  /**
   * Generate ADD INDEX SQL
   */
  private generateAddIndexSQL(tableName: string, index: IndexDefinition): string {
    const unique = index.unique ? 'UNIQUE ' : ''
    const columns = index.columns.map(c => `\\\`${c}\\\``).join(', ')
    return `ALTER TABLE \\\`${tableName}\\\` ADD ${unique}INDEX \\\`${index.name}\\\` (${columns})`
  }

  /**
   * Generate ADD FOREIGN KEY SQL
   */
  private generateAddForeignKeySQL(tableName: string, fk: ForeignKeyDefinition): string {
    let sql = `ALTER TABLE \\\`${tableName}\\\` ADD CONSTRAINT \\\`${fk.name}\\\` `
    sql += `FOREIGN KEY (\\\`${fk.column}\\\`) `
    sql += `REFERENCES \\\`${fk.referencedTable}\\\` (\\\`${fk.referencedColumn}\\\`)`

    if (fk.onUpdate && fk.onUpdate !== 'RESTRICT') {
      sql += ` ON UPDATE ${fk.onUpdate}`
    }

    if (fk.onDelete && fk.onDelete !== 'RESTRICT') {
      sql += ` ON DELETE ${fk.onDelete}`
    }

    return sql
  }

  /**
   * Print a summary of the diff
   */
  private printDiffSummary(diff: SchemaDiff): void {
    console.log('\n📊 Changes Summary:')

    if (diff.tablesToCreate.length > 0) {
      console.log(`  ✓ Tables to create: ${diff.tablesToCreate.length}`)
      diff.tablesToCreate.forEach(t => console.log(`    - ${t.name}`))
    }

    if (diff.tablesToDrop.length > 0) {
      console.log(`  ⚠️  Tables to drop: ${diff.tablesToDrop.length}`)
      diff.tablesToDrop.forEach(t => console.log(`    - ${t}`))
    }

    if (diff.columnsToAdd.length > 0) {
      console.log(`  ✓ Columns to add: ${diff.columnsToAdd.length}`)
    }

    if (diff.columnsToRemove.length > 0) {
      console.log(`  ⚠️  Columns to remove: ${diff.columnsToRemove.length}`)
    }

    if (diff.columnsToModify.length > 0) {
      console.log(`  ✓ Columns to modify: ${diff.columnsToModify.length}`)
    }

    if (diff.indexesToAdd.length > 0) {
      console.log(`  ✓ Indexes to add: ${diff.indexesToAdd.length}`)
    }

    if (diff.foreignKeysToAdd.length > 0) {
      console.log(`  ✓ Foreign keys to add: ${diff.foreignKeysToAdd.length}`)
    }

    console.log('')
  }
}
