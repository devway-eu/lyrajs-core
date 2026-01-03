import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

/**
 * ShowRepositoriesCommand class
 * Lists all repositories found in the project's repository folder
 * Displays repository names and their file paths
 */
export class ShowRepositoriesCommand {
  /**
   * Executes the show repositories command
   * Scans the repository folder and displays all repository files
   * @returns {Promise<void>}
   */
  async execute() {
    const repositoryFolder = path.join(process.cwd(), "src", "repository")
    const repositories: string[] = ["REPOSITORIES"]

    fs.readdirSync(repositoryFolder).forEach((file) => {
      const repository = file.replace(".ts", "")
      repositories.push(`\u27A5  ${repository} \u0040 /src/repository/${file}`)
    })

    LyraConsole.success(...repositories)
  }
}
