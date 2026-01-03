/**
 * Type definition for controller configuration object
 */
export interface ControllerObjType {
  name: string
  type: "Entity based" | "Blank controller with methods" | "Totally blank controller" | null
  baseEntity: string | null
  useDecorators: boolean
}

/**
 * ControllerGeneratorHelper class
 * Generates controller class code based on configuration
 * Supports multiple controller types with or without decorators
 */
export class ControllerGeneratorHelper {
  /**
   * Pluralizes a word using simple English rules
   * @param {string} word - Word to pluralize
   * @returns {string} - Pluralized word
   */
  private static pluralize(word: string): string {
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') ||
        word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es'
    }
    if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
      return word.slice(0, -1) + 'ies'
    }
    return word + 's'
  }

  /**
   * Generates complete controller file code based on configuration
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Complete controller code
   * @example
   * // Generate entity-based controller
   * const code = ControllerGeneratorHelper.getFullControllerCode({
   *   name: 'UserController',
   *   type: 'Entity based',
   *   baseEntity: 'User',
   *   useDecorators: true
   * })
   */
  static getFullControllerCode(controller: ControllerObjType) {
    switch (controller.type) {
      case "Entity based":
        return controller.useDecorators
          ? this.getDecoratorEntityBaseControllerCode(controller)
          : this.getEntityBaseControllerCode(controller)
      case "Blank controller with methods":
        return controller.useDecorators
          ? this.getDecoratorBlankControllerCode(controller)
          : this.getBlankControllerCode(controller)
      case "Totally blank controller":
        return this.getTotallyBlankControllerCode(controller)
    }
    return ""
  }

  /**
   * Generates entity-based controller code without decorators
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Controller code
   */
  private static getEntityBaseControllerCode(controller: ControllerObjType) {
    let controllerCodeContent = ``
    const entityName = controller.baseEntity || ''
    const entityVarName = entityName.toLowerCase()
    const entityVarNamePlural = this.pluralize(entityVarName)
    const repository = `${entityVarName}Repository`

    controllerCodeContent += `import { Controller, NextFunction, Request, Response } from "@lyra-js/core"\n\n`
    controllerCodeContent += `import { ${entityName} } from "@entity/${entityName}"\n\n`
    controllerCodeContent += `export class ${controller.name} extends Controller {\n`
    controllerCodeContent += `  async list(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const ${entityVarNamePlural} = await this.${repository}.findAll()\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} list fetched successfully", ${entityVarNamePlural} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async read(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const { id } = req.params\n`
    controllerCodeContent += `      const ${entityVarName} = await this.${repository}.find(id)\n`
    controllerCodeContent += `      if (!${entityVarName}) return res.status(404).json({ message: "${entityName} not found" })\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} fetched successfully", ${entityVarName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async create(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const data = req.body\n`
    controllerCodeContent += `      const ${entityVarName} = await this.${repository}.save(data)\n`
    controllerCodeContent += `      res.status(201).json({ message: "${entityName} created successfully", ${entityVarName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async update(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const { id } = req.params\n`
    controllerCodeContent += `      const data = req.body\n`
    controllerCodeContent += `      const ${entityVarName} = await this.${repository}.find(id)\n`
    controllerCodeContent += `      if (!${entityVarName}) return res.status(404).json({ message: "${entityName} not found" })\n`
    controllerCodeContent += `      Object.assign(${entityVarName}, data)\n`
    controllerCodeContent += `      const updated${entityName} = await this.${repository}.save(${entityVarName})\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} updated successfully", updated${entityName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async delete(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const { id } = req.params\n`
    controllerCodeContent += `      const ${entityVarName} = await this.${repository}.find(id)\n`
    controllerCodeContent += `      if (!${entityVarName}) return res.status(404).json({ message: "${entityName} not found" })\n`
    controllerCodeContent += `      if (!${entityVarName}?.id) return res.status(400).json({ message: "Invalid ${entityName} id" })\n`
    controllerCodeContent += `      await this.${repository}.delete(${entityVarName}.id)\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} deleted successfully" })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n`
    controllerCodeContent += `}\n`
    return controllerCodeContent
  }

  /**
   * Generates blank controller code with CRUD methods but without decorators
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Controller code
   */
  private static getBlankControllerCode(controller: ControllerObjType) {
    let controllerCodeContent = ``
    controllerCodeContent += `import { Controller, NextFunction, Request, Response } from "@lyra-js/core"\n\n`
    controllerCodeContent += `export class ${controller.name} extends Controller {\n`
    controllerCodeContent += `  async list(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async read(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async create(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async update(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  async delete(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n`
    controllerCodeContent += `}\n`
    return controllerCodeContent
  }

  /**
   * Generates totally blank controller code with no methods
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Controller code
   */
  private static getTotallyBlankControllerCode(controller: ControllerObjType) {
    let controllerCodeContent = ``
    controllerCodeContent += `import { Controller, NextFunction, Request, Response } from "@lyra-js/core"\n\n`
    controllerCodeContent += `export class ${controller.name} extends Controller {\n`
    controllerCodeContent += `  \n`
    controllerCodeContent += `}\n`
    return controllerCodeContent
  }

  /**
   * Generates entity-based controller code with route decorators
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Controller code
   */
  private static getDecoratorEntityBaseControllerCode(controller: ControllerObjType) {
    let controllerCodeContent = ``
    const entityName = controller.baseEntity || ''
    const entityVarName = entityName.toLowerCase()
    const entityVarNamePlural = this.pluralize(entityVarName)
    const entityPath = entityName.charAt(0).toLowerCase() + entityName.slice(1)
    const repository = `${entityVarName}Repository`

    controllerCodeContent += `import { Controller, Delete, Get, NextFunction, Post, Put, Request, Response, Route } from "@lyra-js/core"\n\n`
    controllerCodeContent += `import { ${entityName} } from "@entity/${entityName}"\n\n`
    controllerCodeContent += `@Route({ path: "/${entityPath}" })\n`
    controllerCodeContent += `export class ${controller.name} extends Controller {\n`
    controllerCodeContent += `  @Get({ path: "/" })\n`
    controllerCodeContent += `  async list(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const ${entityVarNamePlural} = await this.${repository}.findAll()\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} list fetched successfully", ${entityVarNamePlural} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Get({ path: "/:${entityVarName}", resolve: { ${entityVarName}: ${entityName} } })\n`
    controllerCodeContent += `  async read(req: Request, res: Response, next: NextFunction, ${entityVarName}: ${entityName}) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      if (!${entityVarName}) return res.status(404).json({ message: "${entityName} not found" })\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} fetched successfully", ${entityVarName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Post({ path: "/" })\n`
    controllerCodeContent += `  async create(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const data = req.body\n`
    controllerCodeContent += `      const ${entityVarName} = await this.${repository}.save(data)\n`
    controllerCodeContent += `      res.status(201).json({ message: "${entityName} created successfully", ${entityVarName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Put({ path: "/:${entityVarName}", resolve: { ${entityVarName}: ${entityName} } })\n`
    controllerCodeContent += `  async update(req: Request, res: Response, next: NextFunction, ${entityVarName}: ${entityName}) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      const data = req.body\n`
    controllerCodeContent += `      Object.assign(${entityVarName}, data)\n`
    controllerCodeContent += `      const updated${entityName} = await this.${repository}.save(${entityVarName})\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} updated successfully", updated${entityName} })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Delete({ path: "/:${entityVarName}", resolve: { ${entityVarName}: ${entityName} } })\n`
    controllerCodeContent += `  async delete(req: Request, res: Response, next: NextFunction, ${entityVarName}: ${entityName}) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      if (!${entityVarName}?.id) {\n`
    controllerCodeContent += `        return res.status(400).json({ message: "Invalid ${entityName} id" })\n`
    controllerCodeContent += `      }\n`
    controllerCodeContent += `      await this.${repository}.delete(${entityVarName}.id)\n`
    controllerCodeContent += `      res.status(200).json({ message: "${entityName} deleted successfully" })\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n`
    controllerCodeContent += `}\n`
    return controllerCodeContent
  }

  /**
   * Generates blank controller code with CRUD methods and route decorators
   * @param {ControllerObjType} controller - Controller configuration
   * @returns {string} - Controller code
   */
  private static getDecoratorBlankControllerCode(controller: ControllerObjType) {
    let controllerCodeContent = ``
    const controllerBaseName = controller.name.replace('Controller', '').toLowerCase()

    controllerCodeContent += `import { Controller, Delete, Get, NextFunction, Post, Put, Request, Response, Route } from "@lyra-js/core"\n\n`
    controllerCodeContent += `@Route({ path: "/${controllerBaseName}" })\n`
    controllerCodeContent += `export class ${controller.name} extends Controller {\n`
    controllerCodeContent += `  @Get({ path: "/" })\n`
    controllerCodeContent += `  async list(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Get({ path: "/:id" })\n`
    controllerCodeContent += `  async read(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Post({ path: "/" })\n`
    controllerCodeContent += `  async create(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Put({ path: "/:id" })\n`
    controllerCodeContent += `  async update(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n\n`
    controllerCodeContent += `  @Delete({ path: "/:id" })\n`
    controllerCodeContent += `  async delete(req: Request, res: Response, next: NextFunction) {\n`
    controllerCodeContent += `    try {\n`
    controllerCodeContent += `      // method code here...\n`
    controllerCodeContent += `    } catch (error) {\n`
    controllerCodeContent += `      next(error)\n`
    controllerCodeContent += `    }\n`
    controllerCodeContent += `  }\n`
    controllerCodeContent += `}\n`
    return controllerCodeContent
  }
}
