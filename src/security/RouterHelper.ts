import fs from "fs"
import path from "path"

import { Config } from "@/core/config"
import { RouteInfo } from "@/core/types"

export class RouterHelper {
  static listRoutes(): RouteInfo[] {
    const routerBasePath = new Config().get("router.base_path")
    const routesFolderPath = path.join(process.cwd(), "src", "router", "routes")
    const routesFiles: string[] = []
    const routes: RouteInfo[] = []

    fs.readdirSync(routesFolderPath).forEach((file) => {
      routesFiles.push(file)
    })

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
