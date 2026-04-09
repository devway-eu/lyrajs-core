/**
 * MiddlewareGeneratorHelper class
 * Generates ownership middleware code for entities with User relations
 * Creates middleware files that check entity ownership based on authenticated user
 */
export class MiddlewareGeneratorHelper {
  /**
   * Generates import statements for middleware file
   * @param {string} entityName - Name of the entity
   * @returns {string} - Import statements code
   */
  static importsString = (entityName: string) => {
    return (
      `import { NextFunction, Request, Response } from "@lyra-js/core"\n\n` +
      `import { ${entityName}Repository } from "@repository/${entityName}Repository"\n\n`
    )
  }

  /**
   * Generates complete ownership middleware code
   * @param {string} entityName - Name of the entity (e.g., "Post", "Cart")
   * @param {string} userPropertyName - Property name that references User (e.g., "author", "user")
   * @returns {string} - Complete middleware code
   * @example
   * // Generate middleware for Post entity with "author" property
   * const code = MiddlewareGeneratorHelper.getOwnershipMiddlewareCode('Post', 'author')
   */
  static getOwnershipMiddlewareCode(entityName: string, userPropertyName: string): string {
    const entityNameLower = entityName.toLowerCase()
    const middlewareName = `canManage${entityName}`
    const paramName = entityNameLower

    let middlewareCode = ``

    // Add imports
    middlewareCode += this.importsString(entityName)

    // Add middleware function
    middlewareCode += `export const ${middlewareName} = async (req: Request, res: Response, next: NextFunction) => {\n`
    middlewareCode += `  const authUser = req.user\n`
    middlewareCode += `\n`
    middlewareCode += `  if (!authUser) {\n`
    middlewareCode += `    return res.status(401).json({ message: "Unauthorized" })\n`
    middlewareCode += `  }\n`
    middlewareCode += `\n`
    middlewareCode += `  if (authUser.role === "ROLE_ADMIN") {\n`
    middlewareCode += `    return next()\n`
    middlewareCode += `  }\n`
    middlewareCode += `\n`
    middlewareCode += `  const ${entityNameLower}Repository = new ${entityName}Repository()\n`
    middlewareCode += `  const ${entityNameLower} = await ${entityNameLower}Repository.find(req.params.${paramName})\n`
    middlewareCode += `\n`
    middlewareCode += `  if (${entityNameLower}?.${userPropertyName} !== authUser.id) {\n`
    middlewareCode += `    return res.status(401).json({ message: "Unauthorized" })\n`
    middlewareCode += `  }\n`
    middlewareCode += `\n`
    middlewareCode += `  next()\n`
    middlewareCode += `}\n`

    return middlewareCode
  }

  /**
   * Gets the middleware file name
   * @param {string} entityName - Name of the entity
   * @returns {string} - Middleware file name
   */
  static getMiddlewareFileName(entityName: string): string {
    return `canManage${entityName}.ts`
  }
}
