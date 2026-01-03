import fs from "fs"
import path from "path"

import { Config } from "@/core/config"
import { RouteInfo } from "@/core/types"
import { getRoutePrefix, getRoutes, RouteMetadata } from "@/core/server/decorators/RouteDecorator"

export class RouterHelper {
  static async listRoutes(): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = []

    // Get traditional routes from router folder
    const traditionalRoutes = this.listTraditionalRoutes()
    routes.push(...traditionalRoutes)

    // Get decorator-based routes from controllers
    const decoratorRoutes = await this.listDecoratorRoutes()
    routes.push(...decoratorRoutes)

    return routes
  }

  private static listTraditionalRoutes(): RouteInfo[] {
    const routerBasePath = new Config().get("router.base_path")
    const routesFolderPath = path.join(process.cwd(), "src", "router", "routes")
    const routes: RouteInfo[] = []

    // Check if routes folder exists
    if (!fs.existsSync(routesFolderPath)) {
      return routes
    }

    const routesFiles = fs.readdirSync(routesFolderPath)

    for (const file of routesFiles) {
      const routesFilePath = path.join(process.cwd(), "src", "router", "routes", file)
      const routesFileContent = fs.readFileSync(routesFilePath, "utf-8")
      const fileRoutesDetails = this.extractDetailsFromRoutes(routesFileContent)
      const routesBasePath = file.replace("Routes.ts", "")
      for (const routeDetails of fileRoutesDetails) {
        const [httpMethod, path, controller] = routeDetails

        routes.push({
          httpMethod,
          controller,
          path: `${routerBasePath}/${routesBasePath}${path}`
        })
      }
    }

    return routes
  }

  private static async listDecoratorRoutes(): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = []
    const controllersPath = path.join(process.cwd(), "src", "controller")
    const routerBasePath = new Config().get("router.base_path")

    // Check if controller folder exists
    if (!fs.existsSync(controllersPath)) {
      return routes
    }

    const files = fs.readdirSync(controllersPath)

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const filePath = path.join(controllersPath, file)
        try {
          // Use dynamic import to avoid circular dependency issues
          const absolutePath = path.resolve(filePath)
          const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`
          const module = await import(fileUrl)

          // Check all exports for decorated controllers
          for (const key of Object.keys(module)) {
            const exportedItem = module[key]
            if (typeof exportedItem === 'function') {
              const controllerRoutes = getRoutes(exportedItem)
              if (controllerRoutes && controllerRoutes.length > 0) {
                const prefix = getRoutePrefix(exportedItem)
                const controllerName = exportedItem.name

                // Add each route from this controller
                controllerRoutes.forEach((route: RouteMetadata) => {
                  const fullPath = routerBasePath + prefix + route.path
                  routes.push({
                    httpMethod: route.method,
                    controller: `${controllerName}.${route.methodName}`,
                    path: fullPath
                  })
                })
              }
            }
          }
        } catch (error) {
          // Silently skip files that can't be loaded
          // (might be interfaces, types, or have missing dependencies)
        }
      }
    }

    return routes
  }

  private static extractDetailsFromRoutes(routesFileContent: string): Array<string[]> {
    const regex = /\.([a-zA-Z]+)\(\s*"(.*?)"\s*,\s*([^)]+)\s*\)/g
    const matches = [...routesFileContent.matchAll(regex)]
    return matches
      .filter((m) => m[1] !== "use")
      .map((m) => [m[1].trim().toUpperCase(), this.removeTrailingSlash(m[2].trim()), m[3].trim()])
  }

  private static removeTrailingSlash(str: string): string {
    return str.endsWith("/") ? str.slice(0, -1) : str
  }
}
