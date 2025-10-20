import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

export class ShowEntitiesCommand {
  async execute() {
    const entityFolder = path.join(process.cwd(), "src", "entity")
    const entities: string[] = ["ENTITIES"]

    fs.readdirSync(entityFolder).forEach((file) => {
      const entity = file.replace(".ts", "")
      entities.push(`\u27A5  ${entity} \u0040 /src/entity/${file}`)
    })

    LyraConsole.success(...entities)
  }
}
