import fs from "fs";
import inquirer from "inquirer";
import * as console from "node:console";
import path from "path";
import { pathToFileURL } from "url";
import { ConsoleInputValidator, RoutesGeneratorHelper } from "../../cli/utils/index.js";
/**
 * CreateRoutesCommand class
 * Generates route files based on controller methods
 * Prompts user to select a controller and configure HTTP methods and paths for each method
 */
export class CreateRoutesCommand {
    /**
     * Executes the create routes command
     * Scans controllers, prompts for route configuration, and generates a routes file
     * @returns {Promise<void>}
     */
    async execute() {
        const controllerFolder = path.join(process.cwd(), "src", "controller");
        const allControllers = [];
        fs.readdirSync(controllerFolder)
            .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
            .forEach((file) => {
            allControllers.push(file.replace(".ts", ""));
        });
        // Filter out decorator-based controllers (only show static method controllers)
        const staticMethodControllers = [];
        for (const controllerName of allControllers) {
            const controllerPath = path.join(controllerFolder, `${controllerName}.ts`);
            const controllerContent = fs.readFileSync(controllerPath, "utf-8");
            // Check if controller uses route decorators
            const usesDecorators = /@(Get|Post|Put|Patch|Delete|Options|Head|All)\s*\(/i.test(controllerContent);
            if (!usesDecorators) {
                staticMethodControllers.push(controllerName);
            }
        }
        if (staticMethodControllers.length === 0) {
            console.log("\nNo static method controllers found.");
            console.log("All controllers use route decorators (@Get, @Post, etc.) and don't need route files.");
            console.log("Route files are only needed for controllers with static methods.");
            return;
        }
        const { baseController } = await inquirer.prompt([
            {
                type: "list",
                name: "baseController",
                message: "For which controller do you want to generate routes?",
                choices: staticMethodControllers
            }
        ]);
        const controllerPath = path.join(controllerFolder, `${baseController}.ts`);
        const controllerModule = await import(pathToFileURL(controllerPath).href);
        const ControllerClass = controllerModule[baseController];
        if (!ControllerClass) {
            throw new Error(`Controller ${baseController} not found`);
        }
        const methodNames = Object.getOwnPropertyNames(ControllerClass).filter((name) => name !== "constructor" && typeof ControllerClass[name] === "function");
        const controllerRoutes = [];
        for (const methodName of methodNames) {
            const { routeHttpMethod } = await inquirer.prompt([
                {
                    type: "list",
                    name: "routeHttpMethod",
                    message: `Wich http method do you want to use for ${baseController}.${methodName}() ?`,
                    choices: ["get", "post", "put", "patch", "delete", "options", "head", "all"]
                }
            ]);
            const { routePathEnd } = await inquirer.prompt([
                {
                    type: "input",
                    name: "routePathEnd",
                    message: `End of route path (ie: "/", "/get/all", "/get/:id" ) ?`,
                    validate: (input) => ConsoleInputValidator.isRoutePathEndValid(input)
                }
            ]);
            controllerRoutes.push({ ctrlMethod: methodName, routeHttpMethod, routePathEnd });
        }
        // Check if routes file already exists
        const routesName = `${baseController.replace("Controller", "").toLowerCase()}Routes`;
        const routesFilePath = path.join(process.cwd(), "src", "router", "routes", `${routesName}.ts`);
        if (fs.existsSync(routesFilePath)) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "overwrite",
                    message: `Routes file "${routesName}.ts" already exists. Do you want to overwrite it? This will delete all existing route configurations.`,
                    default: false
                }
            ]);
            if (!overwrite) {
                console.log("\nOperation cancelled. Existing routes file was not modified.");
                return;
            }
        }
        const routeGeneratorHelper = new RoutesGeneratorHelper();
        routeGeneratorHelper.generateRoutesFile(baseController, controllerRoutes);
    }
}
//# sourceMappingURL=CreateRoutesCommand.js.map