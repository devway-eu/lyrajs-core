import fs from "fs"
import path from "path"

import { LyraConsole } from "@/core/orm"

export class ShowRepositoriesCommand {
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
