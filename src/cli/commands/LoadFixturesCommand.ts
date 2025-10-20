import fs from "fs"
import * as process from "node:process"
import path from "path"

import { db, Entity, LyraConsole } from "@/core/orm"
import { AppFixtures } from "@/core/loader"

export class LoadFixturesCommand<T extends object> {
  async execute() {
    await this.emptyDatabase()
    const fixtures = new AppFixtures()
    await fixtures.load()

    LyraConsole.success("Fixtures loaded", "")
    process.exit(0)
  }

  private async emptyDatabase() {
    const entities = await this.getEntities()
    await db.query(`SET FOREIGN_KEY_CHECKS = 0`)
    for (const entity of entities.reverse()) {
      const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase()
      await db.query("TRUNCATE TABLE `" + table + "`")
    }
    await db.query(`SET FOREIGN_KEY_CHECKS = 1`)
  }

  private async getEntities() {
    const entities: Entity<T>[] = []

    const entityFolder = path.join(process.cwd(), "src", "entity")
    const files = fs.readdirSync(entityFolder).filter((f) => f.endsWith(".ts"))

    for (const file of files) {
      const modulePath = path.join(entityFolder, file)

      const entityModule = await import(`file://${modulePath}`)
      const className = file.replace(".ts", "")

      const EntityClass = entityModule[className]
      if (!EntityClass) {
        throw new Error(`Class ${className} not exported correctly in ${file}`)
      }

      const instance = new EntityClass()
      entities.push(instance)
    }

    return entities
  }
}
