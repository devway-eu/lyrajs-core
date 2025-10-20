import fs from "fs"
import path from "node:path"

import { LyraConsole } from "@/core/orm"

export interface ControllerRouteType {
  ctrlMethod: string
  routeHttpMethod: string
  routePathEnd: string
}

export class RoutesGeneratorHelper {
  generateRoutesFile(controllerName: string, controllerRoutes: ControllerRouteType[]) {
    const routesFileContent = this.getFullRoutesCode(controllerName, controllerRoutes)
    const routesName = `${controllerName.replace("Controller", "").toLowerCase()}Routes`
    const routesFilePath = path.join(process.cwd(), "src", "router", "routes", `${routesName}.ts`)

    fs.writeFileSync(routesFilePath, routesFileContent)
    LyraConsole.success(`Routes file generated successfully`, `File path: ${routesFilePath}`)

    this.updateRouter()
  }

  private getFullRoutesCode(controllerName: string, controllerRoutes: ControllerRouteType[]) {
    let routesFileContent = ""
    const routesName = `${controllerName.replace("Controller", "").toLowerCase()}Routes`

    routesFileContent += `import { ${controllerName} } from "@controller/${controllerName}"\n`
    routesFileContent += `import { Router } from "express"\n\n`
    routesFileContent += `export const ${routesName} = Router()\n\n`

    controllerRoutes.forEach((route) => {
      routesFileContent += `${routesName}.${route.routeHttpMethod}("${route.routePathEnd}", ${controllerName}.${route.ctrlMethod})\n`
    })

    return routesFileContent
  }

  private updateRouter() {
    const routeFolderPath = path.join(process.cwd(), "src", "router", "routes")
    const indexFilePath = path.join(process.cwd(), "src", "router", "routes", "index.ts")

    const routeFiles: string[] = fs
      .readdirSync(routeFolderPath)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => f.replace(".ts", ""))

    let indexFileContent = `import { Router } from "express"\n\n`

    routeFiles.forEach((routeName) => {
      indexFileContent += `import { ${routeName} } from "@router/routes/${routeName}"\n`
    })
    indexFileContent += `\n`
    indexFileContent += `export const routes = Router()\n\n`
    routeFiles.forEach((routeName) => {
      indexFileContent += `routes.use("/${routeName.replace("Routes", "")}", ${routeName})\n`
    })

    fs.writeFileSync(indexFilePath, indexFileContent)
    LyraConsole.success(`Router file updated successfully`, `File path: ${indexFilePath}`)
  }
}
