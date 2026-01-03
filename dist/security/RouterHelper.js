import fs from "fs";
import path from "path";
import { Config } from "../config/index.js";
import { getRoutePrefix, getRoutes } from "../server/decorators/RouteDecorator.js";
export class RouterHelper {
    static async listRoutes() {
        const routes = [];
        // Get traditional routes from router folder
        const traditionalRoutes = this.listTraditionalRoutes();
        routes.push(...traditionalRoutes);
        // Get decorator-based routes from controllers
        const decoratorRoutes = await this.listDecoratorRoutes();
        routes.push(...decoratorRoutes);
        return routes;
    }
    static listTraditionalRoutes() {
        const routerBasePath = new Config().get("router.base_path");
        const routesFolderPath = path.join(process.cwd(), "src", "router", "routes");
        const routes = [];
        // Check if routes folder exists
        if (!fs.existsSync(routesFolderPath)) {
            return routes;
        }
        const routesFiles = fs.readdirSync(routesFolderPath);
        for (const file of routesFiles) {
            const routesFilePath = path.join(process.cwd(), "src", "router", "routes", file);
            const routesFileContent = fs.readFileSync(routesFilePath, "utf-8");
            const fileRoutesDetails = this.extractDetailsFromRoutes(routesFileContent);
            const routesBasePath = file.replace("Routes.ts", "");
            for (const routeDetails of fileRoutesDetails) {
                const [httpMethod, path, controller] = routeDetails;
                routes.push({
                    httpMethod,
                    controller,
                    path: `${routerBasePath}/${routesBasePath}${path}`
                });
            }
        }
        return routes;
    }
    static async listDecoratorRoutes() {
        const routes = [];
        const controllersPath = path.join(process.cwd(), "src", "controller");
        const routerBasePath = new Config().get("router.base_path");
        // Check if controller folder exists
        if (!fs.existsSync(controllersPath)) {
            return routes;
        }
        const files = fs.readdirSync(controllersPath);
        for (const file of files) {
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                const filePath = path.join(controllersPath, file);
                try {
                    // Use dynamic import to avoid circular dependency issues
                    const absolutePath = path.resolve(filePath);
                    const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;
                    const module = await import(fileUrl);
                    // Check all exports for decorated controllers
                    for (const key of Object.keys(module)) {
                        const exportedItem = module[key];
                        if (typeof exportedItem === 'function') {
                            const controllerRoutes = getRoutes(exportedItem);
                            if (controllerRoutes && controllerRoutes.length > 0) {
                                const prefix = getRoutePrefix(exportedItem);
                                const controllerName = exportedItem.name;
                                // Add each route from this controller
                                controllerRoutes.forEach((route) => {
                                    const fullPath = routerBasePath + prefix + route.path;
                                    routes.push({
                                        httpMethod: route.method,
                                        controller: `${controllerName}.${route.methodName}`,
                                        path: fullPath
                                    });
                                });
                            }
                        }
                    }
                }
                catch (error) {
                    // Silently skip files that can't be loaded
                    // (might be interfaces, types, or have missing dependencies)
                }
            }
        }
        return routes;
    }
    static extractDetailsFromRoutes(routesFileContent) {
        const regex = /\.([a-zA-Z]+)\(\s*"(.*?)"\s*,\s*([^)]+)\s*\)/g;
        const matches = [...routesFileContent.matchAll(regex)];
        return matches
            .filter((m) => m[1] !== "use")
            .map((m) => [m[1].trim().toUpperCase(), this.removeTrailingSlash(m[2].trim()), m[3].trim()]);
    }
    static removeTrailingSlash(str) {
        return str.endsWith("/") ? str.slice(0, -1) : str;
    }
}
//# sourceMappingURL=RouterHelper.js.map