import { LyraConsole } from "@/core/console/LyraConsole"

import { MigrationGeneratorHelper } from "../utils"

/**
 * GenerateMigrationCommand class
 * Generates SQL migration files based on entity definitions
 * Creates timestamped migration files with CREATE TABLE and ALTER TABLE statements
 */
export class GenerateMigrationCommand {
  /**
   * Executes the generate migration command
   * Builds SQL queries from entities and writes them to a migration file
   * @returns {Promise<void>}
   */
  async execute() {
    const migrator = new MigrationGeneratorHelper()
    const queries = await migrator.buildCreateTableQueries()

    migrator.generateMigrationFile(queries)

    LyraConsole.success("Migration created")
  }
}
