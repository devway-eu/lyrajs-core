import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

export class ShowControllersCommand {
  async execute() {
    const controllerFolder = path.join(process.cwd(), "src", "controller")
    const controllers: string[] = ["CONTROLLERS"]

    fs.readdirSync(controllerFolder).forEach((file) => {
      const controller = file.replace(".ts", "")
      controllers.push(`\u27A5  ${controller} \u0040 /src/entity/${file}`)
    })

    LyraConsole.success(...controllers)
  }
}
