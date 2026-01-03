import fs from "fs"
import path from "node:path"

import { LyraConsole } from "@/core/orm"

/**
 * Type definition for controller route configuration
 */
export interface ControllerRouteType {
  ctrlMethod: string
  routeHttpMethod: string
  routePathEnd: string
}

/**
 * RoutesGeneratorHelper class
 * Generates route files for controllers
 * Creates route configuration files and updates the main routes index
 */
export class RoutesGeneratorHelper {
  /**
   * Generates a routes file for a controller
   * @param {string} controllerName - Name of the controller
   * @param {ControllerRouteType[]} controllerRoutes - Array of route configurations
   * @returns {void}
   */
  generateRoutesFile(controllerName: string, controllerRoutes: ControllerRouteType[]) {
    const routesFileContent = this.getFullRoutesCode(controllerName, controllerRoutes)
    const routesName = `${controllerName.replace("Controller", "").toLowerCase()}Routes`
    const routesFilePath = path.join(process.cwd(), "src", "router", "routes", `${routesName}.ts`)

    fs.writeFileSync(routesFilePath, routesFileContent)
    LyraConsole.success(`Routes file generated successfully`, `File path: ${routesFilePath}`)

    this.updatecreateRouter()
  }

  /**
   * Generates complete routes file code
   * @param {string} controllerName - Name of the controller
   * @param {ControllerRouteType[]} controllerRoutes - Array of route configurations
   * @returns {string} - Complete routes file content
   */
  private getFullRoutesCode(controllerName: string, controllerRoutes: ControllerRouteType[]) {
    let routesFileContent = ""
    const routesName = `${controllerName.replace("Controller", "").toLowerCase()}Routes`

    routesFileContent += `import { ${controllerName} } from "@controller/${controllerName}"\n`
    routesFileContent += `import { createRouter } from "@lyra-js/core"\n\n`
    routesFileContent += `export const ${routesName} = createRouter()\n\n`

    controllerRoutes.forEach((route) => {
      routesFileContent += `${routesName}.${route.routeHttpMethod}("${route.routePathEnd}", ${controllerName}.${route.ctrlMethod})\n`
    })

    return routesFileContent
  }

  /**
   * Updates the main routes index file with all route files
   * Scans route files and regenerates the index file
   * @returns {void}
   */
  private updatecreateRouter() {
    const routeFolderPath = path.join(process.cwd(), "src", "router", "routes")
    const indexFilePath = path.join(process.cwd(), "src", "router", "routes", "index.ts")

    const routeFiles: string[] = fs
      .readdirSync(routeFolderPath)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => f.replace(".ts", ""))

    let indexFileContent = `import { createRouter } from "@lyra-js/core"\n\n`

    routeFiles.forEach((routeName) => {
      indexFileContent += `import { ${routeName} } from "@router/routes/${routeName}"\n`
    })
    indexFileContent += `\n`
    indexFileContent += `export const routes = createRouter()\n\n`
    routeFiles.forEach((routeName) => {
      indexFileContent += `routes.use("/${routeName.replace("Routes", "")}", ${routeName})\n`
    })

    fs.writeFileSync(indexFilePath, indexFileContent)
    LyraConsole.success(`createRouter file updated successfully`, `File path: ${indexFilePath}`)
  }
}
