import { LyraConsole } from "@/core/console/LyraConsole"

import { MigrationGeneratorHelper } from "../utils"


export class GenerateMigrationCommand {
  async execute() {
    const migrator = new MigrationGeneratorHelper()
    const queries = await migrator.buildCreateTableQueries()

    migrator.generateMigrationFile(queries)

    LyraConsole.success("Migration created")
  }
}
