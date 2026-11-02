import { ColumnType } from "@/core/orm"

/**
 * EntityGeneratorHelper class
 * Generates entity class code from property definitions
 * Creates entity files with decorators and TypeScript type annotations
 */
export class EntityGeneratorHelper {
  static starts = {
    table: "@Table(",
    column: "@Column({ "
  }
  static ends = {
    table: ")",
    column: " })"
  }

  /**
   * Generates import statements for entity file
   * Imports related entities for TypeScript types (FK properties, inverse relations)
   * @param {ColumnType[]} properties - Array of entity properties to check for relations
   * @returns {string} - Import statements code
   */
  static importsString = (properties: ColumnType[] = []) => {
    let imports = `import { Column, Entity, Table } from "@lyra-js/core"\n`

    const entityImports = new Set<string>()

    // Check for ALL FK properties (manyToOne) - need to import for "number | Entity" types
    // Note: manyToMany properties are NOT added to the current entity, so no imports needed for them
    const allFKProperties = properties.filter((prop) => {
      return prop.type.toLowerCase() === "relation" && prop.references && prop.fk
    })
    allFKProperties.forEach((prop) => {
      if (prop.references) {
        // Extract entity name from references (e.g., "user.id" → "User")
        const referencedEntity = prop.references.split('.')[0]
        const capitalizedEntity = referencedEntity.charAt(0).toUpperCase() + referencedEntity.slice(1)
        // Always import - all FK properties now have "number | Entity" type
        entityImports.add(capitalizedEntity)
      }
    })

    if (entityImports.size > 0) {
      imports += `\n`
      // Add entity imports for TypeScript types
      entityImports.forEach((entity) => {
        imports += `import { ${entity} } from "@entity/${entity}"\n`
      })
    }

    return imports + `\n`
  }

  /**
   * Generates @Table decorator
   * @returns {string} - Table decorator code
   */
  static tableDecorator = () => {
    return this.starts.table + this.ends.table + "\n"
  }

  /**
   * Generates constructor code for entity class
   * @param {string} entityName - Name of the entity
   * @returns {string} - Constructor code
   */
  static constructorString = (entityName: string) => {
    return (
      `  constructor(${entityName.toLowerCase()}?: Partial<${entityName}> | ${entityName}) {` +
      `\n` +
      `    super(${entityName.toLowerCase()})` +
      `\n` +
      `  }` +
      `\n`
    )
  }

  /**
   * Generates @Column decorator for a property
   * @param {ColumnType} property - Property definition
   * @returns {string} - Column decorator code
   */
  static columnDecorator = (property: ColumnType) => {
    let decoratorString = "  " + this.starts.column
    decoratorString += `type: "${property.type === "relation" ? "bigint" : property.type}"`
    decoratorString += property.size ? `, size: ${property.size}` : ``
    decoratorString += property.pk ? `, pk: true` : ``
    decoratorString += property.references ? `, fk: true, references: "${property.references}.id"` : ``
    decoratorString += property.onDelete ? `, onDelete: "${property.onDelete}"` : ``
    decoratorString += property.nullable ? `, nullable: true` : ``
    decoratorString += property.unique ? `, unique: true` : ``
    decoratorString += property.default ? `, default: ${property.default}` : ``
    decoratorString += this.ends.column
    return decoratorString
  }

  /**
   * Generates property declaration with TypeScript type
   * Handles foreign keys: if property name matches related entity (camelCase), type is number | Entity
   * @param {ColumnType} property - Property definition
   * @returns {string} - Property declaration code
   */
  static propertyString = (property: ColumnType) => {
    let propertyString = "  " + property.name + ": "
    switch (property.type.toLowerCase()) {
      case "date":
      case "time":
      case "year":
      case "datetime":
      case "timestamp":
        propertyString +=
          `string | Date` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = new Date()`)
        break
      case "tinyint":
      case "smallint":
      case "mediumint":
      case "int":
      case "integer":
      case "bigint":
      case "float":
      case "double":
      case "decimal":
        propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        break
      case "char":
      case "varchar":
      case "tinytext":
      case "text":
      case "mediumtext":
      case "longtext":
      case "json":
      case "tinyblob":
      case "blob":
      case "mediumblob":
      case "longblob":
        propertyString += `string` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        break
      case "bool":
        propertyString +=
          `boolean` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = false`)
        break
      case "relation":
        // Always generate "number | Entity" type for FK properties
        // This allows users to name FK properties however they want (author, created_by, owner, etc.)
        if (property.references) {
          // Extract entity name from references (e.g., "user.id" → "User")
          const referencedEntity = property.references.split('.')[0]
          const capitalizedEntity = referencedEntity.charAt(0).toUpperCase() + referencedEntity.slice(1)
          propertyString += `number | ${capitalizedEntity}` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        } else {
          propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        }
        break
    }
    return propertyString
  }

  /**
   * Generates property with decorator and declaration
   * @param {ColumnType} property - Property definition
   * @returns {string} - Complete property code
   */
  static propertyWithDecorator = (property: ColumnType) => {
    return this.columnDecorator(property) + "\n" + this.propertyString(property) + "\n"
  }

  /**
   * Generates an inverse relation array property (without decorator)
   * @param {string} propertyName - Name of the property
   * @param {string} relatedEntity - Name of the related entity
   * @returns {string} - Property declaration code
   */
  static inverseRelationProperty = (propertyName: string, relatedEntity: string) => {
    return `  ${propertyName}: ${relatedEntity}[] = []\n`
  }

  /**
   * Generates relation metadata registration code
   * DEPRECATED: Relations now use @Relation decorator instead of manual metadata
   * @param {ColumnType[]} properties - Array of properties
   * @param {string} entityName - Name of the current entity
   * @returns {string} - Empty string (metadata no longer generated)
   */
  static relationMetadata = (properties: ColumnType[], entityName?: string) => {
    // Relations are now defined using @Relation decorator
    // No need to generate manual metadata registration
    return ""
  }

  /**
   * Generates complete entity file code
   * @param {string} entityName - Name of the entity
   * @param {ColumnType[]} properties - Array of entity properties
   * @returns {string} - Complete entity code
   * @example
   * // Generate entity for User
   * const code = EntityGeneratorHelper.getFullEntityCode('User', properties)
   */
  static getFullEntityCode(entityName: string, properties: ColumnType[]) {
    let entityCodeContent = ``

    entityCodeContent += this.importsString(properties)
    entityCodeContent += this.tableDecorator()

    entityCodeContent += `export class ${entityName} extends Entity<${entityName}> {` + "\n"

    entityCodeContent += this.propertyWithDecorator({
      name: "id",
      type: "bigint",
      nullable: false,
      unique: false,
      pk: true
    })

    for (const prop of properties) {
      entityCodeContent += this.propertyWithDecorator(prop)
    }

    entityCodeContent += `\n`

    entityCodeContent += this.constructorString(entityName)

    entityCodeContent += `}` + `\n`

    // Relations are now defined using @Relation decorator
    // No need to generate manual metadata registration

    // Ensure no more than 1 successive empty line (max 2 consecutive newlines)
    entityCodeContent = entityCodeContent.replace(/\n{3,}/g, '\n\n')

    return entityCodeContent
  }

  /**
   * Adds new properties to existing entity file content
   * @param {string} existingContent - Current entity file content
   * @param {ColumnType[]} newProperties - Array of new properties to add
   * @returns {string} - Updated entity file content
   */
  static addPropertiesToExistingEntity(existingContent: string, newProperties: ColumnType[]): string {
    // Add decorated properties
    let newPropertiesCode = `\n`
    for (const prop of newProperties) {
      newPropertiesCode += this.propertyWithDecorator(prop)
    }

    // DO NOT add manyToMany properties to the current entity
    // They will be added to the related entities via updateRelatedEntitiesWithInverseProperties

    const constructorRegex = /\s+constructor\(/
    const constructorMatch = existingContent.match(constructorRegex)

    if (!constructorMatch || constructorMatch.index === undefined) {
      throw new Error("Could not find constructor in entity file")
    }

    // Insert new properties before the constructor
    const beforeConstructor = existingContent.substring(0, constructorMatch.index)
    const fromConstructor = existingContent.substring(constructorMatch.index)

    let updatedContent = beforeConstructor + newPropertiesCode + fromConstructor

    // DO NOT add manyToMany metadata to the current entity
    // Metadata will be added to the related entities via updateRelatedEntitiesWithInverseProperties

    // Add necessary entity type imports (ALWAYS, not just when inverseRelations exist)
    const entityImports = new Set<string>()

    // DO NOT add imports for manyToMany relations (they're not added to current entity)

    // Add imports for ALL FK properties (manyToOne) - all have "number | Entity" type
    const allFKProperties = newProperties.filter((prop) => {
      return prop.type.toLowerCase() === "relation" && prop.references && prop.fk
    })
    allFKProperties.forEach((prop) => {
      if (prop.references) {
        // Extract entity name from references (e.g., "user.id" → "User")
        const referencedEntity = prop.references.split('.')[0]
        const capitalizedEntity = referencedEntity.charAt(0).toUpperCase() + referencedEntity.slice(1)
        entityImports.add(capitalizedEntity)
      }
    })

    // Check if imports already exist and add missing ones
    if (entityImports.size > 0) {
      let importsToAdd = ""

      entityImports.forEach((entity) => {
        if (!updatedContent.includes(`import { ${entity} }`)) {
          importsToAdd += `import { ${entity} } from "@entity/${entity}"\n`
        }
      })

      if (importsToAdd) {
        // Find the last import statement and add after it with an empty line
        const lastImportRegex = /import .+ from .+\n/g
        const imports = updatedContent.match(lastImportRegex)
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1]
          const lastImportIndex = updatedContent.lastIndexOf(lastImport)
          if (lastImportIndex !== -1) {
            const insertPosition = lastImportIndex + lastImport.length
            // Add empty line before new imports
            updatedContent = updatedContent.substring(0, insertPosition) + `\n` + importsToAdd + updatedContent.substring(insertPosition)
          }
        } else {
          // No existing imports, add at the beginning
          updatedContent = importsToAdd + updatedContent
        }
      }
    }

    // Ensure no more than 1 successive empty line (max 2 consecutive newlines)
    updatedContent = updatedContent.replace(/\n{3,}/g, '\n\n')

    return updatedContent
  }
}
