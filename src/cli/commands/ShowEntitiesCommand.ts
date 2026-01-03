import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

/**
 * ShowEntitiesCommand class
 * Lists all entities found in the project's entity folder
 * Displays entity names and their file paths
 */
export class ShowEntitiesCommand {
  /**
   * Executes the show entities command
   * Scans the entity folder and displays all entity files
   * @returns {Promise<void>}
   */
  async execute() {
    const entityFolder = path.join(process.cwd(), "src", "entity")
    const entities: string[] = ["ENTITIES"]

    fs.readdirSync(entityFolder)
      .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
      .forEach((file) => {
        const entity = file.replace(".ts", "")
        entities.push(`\u27A5  ${entity} \u0040 /src/entity/${file}`)
      })

    LyraConsole.success(...entities)
  }
}
