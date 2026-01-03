import fs from "fs"
import inquirer from "inquirer"
import path from "path"

import { ControllerGeneratorHelper, ControllerObjType } from "@/core/cli/utils"
import { ConsoleInputValidator } from "@/core/cli/utils/ConsoleInputValidator"
import { LyraConsole } from "@/core/console/LyraConsole"

export class GenerateControllerCommand {
  async execute() {
    const controller: ControllerObjType = {
      name: "",
      type: null,
      baseEntity: null
    }
    const { controllerType } = await inquirer.prompt([
      {
        type: "list",
        name: "controllerType",
        message: "What type of controller do you want to generate ?",
        choices: ["Entity based", "Blank controller with methods", "Totally blank controller"]
      }
    ])

    switch (controllerType) {
      case "Entity based":
        const entityFolder = path.join(process.cwd(), "src", "entity")
        const existingEntities: string[] = []

        fs.readdirSync(entityFolder).forEach((file) => {
          existingEntities.push(file.replace(".ts", ""))
        })
        const { baseEntity } = await inquirer.prompt([
          {
            type: "list",
            name: "baseEntity",
            message: "For which entity do you want to generate controller ?",
            choices: existingEntities
          }
        ])
        controller.name = `${baseEntity.charAt(0).toUpperCase()}${baseEntity.slice(1)}Controller`
        controller.baseEntity = baseEntity
        controller.type = controllerType
        break
      case "Blank controller with methods":
      case "Totally blank controller":
        const { name } = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: "Controller name (ie: Banana, BananaController ) ?",
            validate: (input) => ConsoleInputValidator.isControllerNameValid(input)
          }
        ])
        const cleanLowercaseBaseName = name.replace(/[cC][oO][nN][tT][rR][oO][lL][lL][eE][rR]/, "").toLowerCase()
        controller.name = `${cleanLowercaseBaseName.charAt(0).toUpperCase()}${cleanLowercaseBaseName.slice(1)}Controller`
        controller.type = controllerType
        break
    }

    const controllerFileContent = ControllerGeneratorHelper.getFullControllerCode(controller)
    const controllerFilePath = path.join(process.cwd(), "src", "controller", `${controller.name}.ts`)
    fs.writeFileSync(controllerFilePath, controllerFileContent)
    LyraConsole.success(`Controller generated!`, `Controller file at: ${controllerFilePath}`)
  }
}
