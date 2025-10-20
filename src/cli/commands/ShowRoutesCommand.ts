import { LyraConsole } from "@/core/orm"
import { RouterHelper } from "@/core/security"

export class ShowRoutesCommand {
  async execute() {
    const routes = RouterHelper.listRoutes()
    const routesInfos: string[] = ["ROUTES"]

    const methodColumnWidth = Math.max(...routes.map((r) => r.httpMethod.length))
    const pathColumnWidth = Math.max(...routes.map((r) => r.path.length))
    const controllerColumnWidth = Math.max(...routes.map((r) => r.controller.concat("()").length))

    routesInfos.push(
      `┌${"─".repeat(methodColumnWidth + 2)}┬${"─".repeat(pathColumnWidth + 2)}┬${"─".repeat(controllerColumnWidth + 2)}┐`
    )
    routesInfos.push(
      `│ ${"METHOD".padEnd(methodColumnWidth)} │ ${"PATH".padEnd(pathColumnWidth)} │ ${"HANDLER".padEnd(controllerColumnWidth)} │`
    )
    routesInfos.push(
      `├${"─".repeat(methodColumnWidth + 2)}┼${"─".repeat(pathColumnWidth + 2)}┼${"─".repeat(controllerColumnWidth + 2)}┤`
    )
    for (const route of routes) {
      routesInfos.push(
        `│ ${route.httpMethod.padEnd(methodColumnWidth)} │ ${route.path.padEnd(pathColumnWidth)} │ ${route.controller.concat("()").padEnd(controllerColumnWidth)} │`
      )
    }
    routesInfos.push(
      `└${"─".repeat(methodColumnWidth + 2)}┴${"─".repeat(pathColumnWidth + 2)}┴${"─".repeat(controllerColumnWidth + 2)}┘`
    )
    LyraConsole.success(...routesInfos)
  }
}
