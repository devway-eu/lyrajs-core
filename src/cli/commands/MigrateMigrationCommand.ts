import * as fs from "node:fs"
import path from "node:path"
import * as process from "node:process"
import { dirname } from "path"
import { fileURLToPath } from "url"

import { db, LyraConsole } from "@/core/orm"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * MigrateMigrationCommand class
 * Applies the most recent migration file to the database
 * Executes SQL queries from the latest migration file
 */
export class MigrateMigrationCommand {
  /**
   * Executes the migrate migration command
   * Finds and applies the most recent migration file
   * @returns {Promise<void>}
   */
  async execute() {
    const migrations = await this.listMigrationsFiles()
    if (migrations && migrations.length) {
      const timestampMigrations = migrations.map((migration) => {
        return parseInt(migration.replace("migration_", "").replace(".sql", ""))
      })
      const mostRecetMigration = `migration_${Math.max(...timestampMigrations)}.sql`

      const migrationFullSql = fs.readFileSync(
        path.join(process.cwd(), "migrations", mostRecetMigration),
        "utf8"
      )

      const migrationSqlQueries = migrationFullSql.split(";\n")
      migrationSqlQueries.pop()

      for (const query of migrationSqlQueries) {
        await db.query(query)
      }
    }

    LyraConsole.success("Migration applied")
    process.exit(0)
  }

  /**
   * Lists all migration files in the migrations directory
   * @returns {Promise<string[]>} - Array of migration file names
   */
  private async listMigrationsFiles() {
    const migrationDirectory = path.join(process.cwd(), "migrations")

    return fs.readdirSync(migrationDirectory)
  }
}
