export class ControllerGeneratorHelper {
    static getFullControllerCode(controller) {
        switch (controller.type) {
            case "Entity based":
                return this.getEntityBaseControllerCode(controller);
                break;
            case "Blank controller with methods":
                return this.getBlankControllerCode(controller);
                break;
            case "Totally blank controller":
                return this.getTotallyBlankControllerCode(controller);
                break;
        }
        return "";
    }
    static getEntityBaseControllerCode(controller) {
        let controllerCodeContent = ``;
        const repository = `${controller.baseEntity?.toLowerCase()}Repository`;
        controllerCodeContent += `import {NextFunction, Request, Response} from "@lyra-js/core"\n\n`;
        controllerCodeContent += `import {AuthenticatedRequest} from "@lyra-js/core"\n\n`;
        controllerCodeContent += `import {${controller.baseEntity?.toLowerCase()}Repository} from "@repository/${controller.baseEntity}Repository"\n\n`;
        controllerCodeContent += `export class ${controller.name} {\n`;
        controllerCodeContent += `  static list = async (req: Request, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      const data = await ${repository}.findAll()\n`;
        controllerCodeContent += `      res.status(200).json({ message: "${controller.baseEntity} list fetched successfully", data })\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static read = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      const { id } = req.params\n`;
        controllerCodeContent += `      const data = await ${repository}.find(id)\n`;
        controllerCodeContent += `      res.status(200).json({ message: "${controller.baseEntity} fetched successfully", data })\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static create = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      const data = req.body\n`;
        controllerCodeContent += `      await ${repository}.save(data)\n`;
        controllerCodeContent += `      res.status(200).json({ message: "${controller.baseEntity} fetched successfully", data })\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static update = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      const data = req.body\n`;
        controllerCodeContent += `      const ${controller.baseEntity?.toLowerCase()} = await ${repository}.find(data.id)\n`;
        controllerCodeContent += `      if (!${controller.baseEntity?.toLowerCase()}) res.status(404).json({ message: "${controller.baseEntity} not found" })\n`;
        controllerCodeContent += `      if (${controller.baseEntity?.toLowerCase()}) await ${repository}.save(data)\n`;
        controllerCodeContent += `      res.status(200).json({ message: "${controller.baseEntity} fetched successfully"})\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static delete = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      const { id } = req.params\n`;
        controllerCodeContent += `      const ${controller.baseEntity?.toLowerCase()} = await ${repository}.find(id)\n`;
        controllerCodeContent += `      if (!${controller.baseEntity?.toLowerCase()}) res.status(404).json({ message: "${controller.baseEntity} not found" })\n`;
        controllerCodeContent += `      if (!${controller.baseEntity?.toLowerCase()}?.id) res.status(400).json({ message: "Invalid ${controller.baseEntity} id" })\n`;
        controllerCodeContent += `      if (${controller.baseEntity?.toLowerCase()}?.id && id) await ${repository}.delete(id)\n`;
        controllerCodeContent += `      res.status(200).json({ message: "${controller.baseEntity} deleted successfully"})\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n`;
        controllerCodeContent += `}\n`;
        return controllerCodeContent;
    }
    static getBlankControllerCode(controller) {
        let controllerCodeContent = ``;
        controllerCodeContent += `import {NextFunction, Request, Response} from "@lyra-js/core"\n\n`;
        controllerCodeContent += `import {AuthenticatedRequest} from "@lyra-js/core"\n\n`;
        controllerCodeContent += `export class ${controller.name} {\n`;
        controllerCodeContent += `  static list = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      // method code here...\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static read = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      // method code here...\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static create = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      // method code here...\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static update = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      // method code here...\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n\n`;
        controllerCodeContent += `  static delete = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {\n`;
        controllerCodeContent += `    try {\n`;
        controllerCodeContent += `      // method code here...\n`;
        controllerCodeContent += `    } catch (error) {\n`;
        controllerCodeContent += `      next(error)\n`;
        controllerCodeContent += `    }\n`;
        controllerCodeContent += `  }\n`;
        controllerCodeContent += `}\n`;
        return controllerCodeContent;
    }
    static getTotallyBlankControllerCode(controller) {
        let controllerCodeContent = ``;
        controllerCodeContent += `import {NextFunction, Request, Response} from "@lyra-js/core"\n\n`;
        controllerCodeContent += `export class ${controller.name} {\n`;
        controllerCodeContent += `  \n`;
        controllerCodeContent += `}\n`;
        return controllerCodeContent;
    }
}
//# sourceMappingURL=ControllerGeneratorHelper.js.map