import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

/**
 * ShowMigrationsCommand class
 * Lists all migrations found in the migrations folder
 * Displays migration names with timestamps and file paths
 */
export class ShowMigrationsCommand {
  /**
   * Executes the show migrations command
   * Scans the migrations folder and displays all migration files in reverse chronological order
   * @returns {Promise<void>}
   */
  async execute() {
    const migrationsFolder = path.join(process.cwd(), "migrations")
    const migrations: string[] = ["MIGRATIONS"]

    fs.readdirSync(migrationsFolder)
      .reverse()
      .forEach((file) => {
        const migration = file.replace(".sql", "")
        const timestamp = migration.replace("migration_", "")
        // const isoDate = new Date(parseInt(timestamp)).toISOString()
        const date = new Date(new Date(parseInt(timestamp)).toISOString()).toLocaleString()
        migrations.push(`\u27A5  ${migration} | ${date} \u0040 /migrations/${file}`)
      })

    LyraConsole.success(...migrations)
  }
}
