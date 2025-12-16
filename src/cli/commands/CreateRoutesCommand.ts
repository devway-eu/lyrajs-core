import fs from "fs"
import inquirer from "inquirer"
import * as console from "node:console"
import path from "path"
import { pathToFileURL } from "url"

import { ConsoleInputValidator, ControllerRouteType, RoutesGeneratorHelper } from "@/core/cli/utils"

export class CreateRoutesCommand {
  async execute() {
    const controllerFolder = path.join(process.cwd(), "src", "controller")
    const existingControllers: string[] = []

    fs.readdirSync(controllerFolder).forEach((file) => {
      existingControllers.push(file.replace(".ts", ""))
    })

    const { baseController } = await inquirer.prompt([
      {
        type: "list",
        name: "baseController",
        message: "For which controller do you want to generate controller ?",
        choices: existingControllers
      }
    ])

    const controllerPath = path.join(controllerFolder, `${baseController}.ts`)
    const controllerModule = await import(pathToFileURL(controllerPath).href)

    const ControllerClass = controllerModule[baseController]
    if (!ControllerClass) {
      throw new Error(`Controller ${baseController} not found`)
    }

    const methodNames = Object.getOwnPropertyNames(ControllerClass).filter(
      (name) => name !== "constructor" && typeof ControllerClass[name] === "function"
    )

    const controllerRoutes: ControllerRouteType[] = []
    for (const methodName of methodNames) {
      const { routeHttpMethod } = await inquirer.prompt([
        {
          type: "list",
          name: "routeHttpMethod",
          message: `Wich http method do you want to use for ${baseController}.${methodName}() ?`,
          choices: ["get", "post", "put", "patch", "delete", "options", "head", "all"]
        }
      ])

      const { routePathEnd } = await inquirer.prompt([
        {
          type: "input",
          name: "routePathEnd",
          message: `End of route path (ie: "/", "/get/all", "/get/:id" ) ?`,
          validate: (input) => ConsoleInputValidator.isRoutePathEndValid(input)
        }
      ])

      controllerRoutes.push({ ctrlMethod: methodName, routeHttpMethod, routePathEnd })
    }

    const routeGeneratorHelper = new RoutesGeneratorHelper()
    routeGeneratorHelper.generateRoutesFile(baseController, controllerRoutes)
  }
}
