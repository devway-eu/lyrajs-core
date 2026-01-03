import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

/**
 * ShowControllersCommand class
 * Lists all controllers found in the project's controller folder
 * Displays controller names and their file paths
 */
export class ShowControllersCommand {
  /**
   * Executes the show controllers command
   * Scans the controller folder and displays all controller files
   * @returns {Promise<void>}
   */
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
