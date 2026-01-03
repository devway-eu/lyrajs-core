import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import { ControllerGeneratorHelper } from "../../cli/utils/index.js";
import { ConsoleInputValidator } from "../../cli/utils/ConsoleInputValidator.js";
import { LyraConsole } from "../../console/LyraConsole.js";
export class GenerateControllerCommand {
    async execute() {
        const controller = {
            name: "",
            type: null,
            baseEntity: null,
            useDecorators: false
        };
        const { controllerType } = await inquirer.prompt([
            {
                type: "list",
                name: "controllerType",
                message: "What type of controller do you want to generate ?",
                choices: ["Entity based", "Blank controller with methods", "Totally blank controller"]
            }
        ]);
        switch (controllerType) {
            case "Entity based":
                const entityFolder = path.join(process.cwd(), "src", "entity");
                const existingEntities = [];
                fs.readdirSync(entityFolder).forEach((file) => {
                    existingEntities.push(file.replace(".ts", ""));
                });
                const { baseEntity } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "baseEntity",
                        message: "For which entity do you want to generate controller ?",
                        choices: existingEntities
                    }
                ]);
                const { useDecoratorsEntity } = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "useDecoratorsEntity",
                        message: "Do you want to use route decorators (@Get, @Post, etc.)?",
                        default: true
                    }
                ]);
                controller.name = `${baseEntity.charAt(0).toUpperCase()}${baseEntity.slice(1)}Controller`;
                controller.baseEntity = baseEntity;
                controller.type = controllerType;
                controller.useDecorators = useDecoratorsEntity;
                break;
            case "Blank controller with methods":
                const { nameWithMethods } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "nameWithMethods",
                        message: "Controller name (ie: Banana, BananaController ) ?",
                        validate: (input) => ConsoleInputValidator.isControllerNameValid(input)
                    }
                ]);
                const { useDecoratorsBlank } = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "useDecoratorsBlank",
                        message: "Do you want to use route decorators (@Get, @Post, etc.)?",
                        default: true
                    }
                ]);
                const cleanLowercaseBaseNameWithMethods = nameWithMethods.replace(/[cC][oO][nN][tT][rR][oO][lL][lL][eE][rR]/, "").toLowerCase();
                controller.name = `${cleanLowercaseBaseNameWithMethods.charAt(0).toUpperCase()}${cleanLowercaseBaseNameWithMethods.slice(1)}Controller`;
                controller.type = controllerType;
                controller.useDecorators = useDecoratorsBlank;
                break;
            case "Totally blank controller":
                const { name } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "Controller name (ie: Banana, BananaController ) ?",
                        validate: (input) => ConsoleInputValidator.isControllerNameValid(input)
                    }
                ]);
                const cleanLowercaseBaseName = name.replace(/[cC][oO][nN][tT][rR][oO][lL][lL][eE][rR]/, "").toLowerCase();
                controller.name = `${cleanLowercaseBaseName.charAt(0).toUpperCase()}${cleanLowercaseBaseName.slice(1)}Controller`;
                controller.type = controllerType;
                break;
        }
        const controllerFileContent = ControllerGeneratorHelper.getFullControllerCode(controller);
        const controllerFilePath = path.join(process.cwd(), "src", "controller", `${controller.name}.ts`);
        fs.writeFileSync(controllerFilePath, controllerFileContent);
        LyraConsole.success(`Controller generated!`, `Controller file at: ${controllerFilePath}`);
    }
}
//# sourceMappingURL=GenerateControllerCommand.js.map