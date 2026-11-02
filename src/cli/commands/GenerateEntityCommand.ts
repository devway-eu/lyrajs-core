import fs from "fs"
import inquirer from "inquirer"
import path from "path"

import { EntityGeneratorHelper, onDeleteChoices, RepositoryGeneratorHelper, sqlTypeChoices } from "@/core/cli/utils"
import { ConsoleInputValidator } from "@/core/cli/utils/ConsoleInputValidator"
import { MiddlewareGeneratorHelper } from "@/core/cli/utils/MiddlewareGeneratorHelper"
import { ColumnType, ConstraintType, LyraConsole } from "@/core/orm"

/**
 * GenerateEntityCommand class
 * Generates entity and repository files based on user input
 * Supports creating new entities or adding properties to existing ones
 * Handles property types, constraints, and relationships
 */
export class GenerateEntityCommand {
  /**
   * Executes the generate entity command
   * Accepts an optional entity name as CLI argument (npx maestro make:entity EntityName)
   * If provided, validates it the same way as the interactive prompt
   * If omitted, falls back to the interactive prompt
   * @param {string[]} args - Command arguments [entity_name]
   * @returns {Promise<void>}
   */
  async execute(args: string[] = []) {
    let entityName: string

    if (args[0]) {
      const validation = ConsoleInputValidator.isEntityNameValid(args[0])
      if (validation !== true) {
        LyraConsole.error("Invalid entity name", validation as string)
        return
      }
      entityName = args[0]
    } else {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "entityName",
          message: "Entity name (ie: Fruit, FruitType) ?",
          validate: (input) => ConsoleInputValidator.isEntityNameValid(input)
        }
      ])
      entityName = answer.entityName
    }

    const entity = entityName.charAt(0).toUpperCase() + entityName.slice(1)

    if (this.entityExists(entity)) {
      // 3. If exists, prompt to add properties to existing entity
      await this.updateEntityPrompts(entity)
      return
    }

    await this.generateEntityPrompts(entity)
  }

  /**
   * Prompts for entity properties and generates entity and repository files
   * @param {string} entity - Name of the entity to generate
   * @returns {Promise<void>}
   */
  private async generateEntityPrompts(entity: string) {
    const properties: Array<ColumnType> = []

    let addMore = true

    while (addMore) {
      const { propName } = await inquirer.prompt([
        {
          type: "input",
          name: "propName",
          message: "Property name (ie: banana, banana_color ) ?",
          validate: (input) => ConsoleInputValidator.isPropertyNameValid(input)
        }
      ])

      const { propType } = await inquirer.prompt([
        {
          type: "list",
          name: "propType",
          message: `SQL datatype of "${propName}" ?`,
          choices: sqlTypeChoices
        }
      ])

      let references: string | undefined
      let onDelete: ConstraintType | undefined
      let inverseRelation: {
        propertyName: string
        relatedEntity: string
        manyToMany?: {
          junctionEntity: string
          junctionForeignKey: string
          targetForeignKey: string
        }
      } | undefined

      if (propType === "relation") {
        const entityFolder = path.join(process.cwd(), "src", "entity")
        const existingEntities: string[] = []

        fs.readdirSync(entityFolder)
          .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
          .forEach((file) => {
            existingEntities.push(file.replace(".ts", "").toLowerCase())
          })

        const { relatedEntity } = await inquirer.prompt([
          {
            type: "list",
            name: "relatedEntity",
            message: "Related entity ?",
            choices: existingEntities
          }
        ])

        const capitalizedRelatedEntity = relatedEntity.charAt(0).toUpperCase() + relatedEntity.slice(1)

        // Ask for relation type with descriptions
        const { relationType } = await inquirer.prompt([
          {
            type: "list",
            name: "relationType",
            message: `Relation type between ${entity} and ${capitalizedRelatedEntity}?`,
            choices: [
              {
                name: `OneToOne - One ${entity} has one ${capitalizedRelatedEntity}, and one ${capitalizedRelatedEntity} has one ${entity}`,
                value: "OneToOne"
              },
              {
                name: `ManyToOne - Many ${entity}s belong to one ${capitalizedRelatedEntity} (${entity} has FK to ${capitalizedRelatedEntity})`,
                value: "ManyToOne"
              },
              {
                name: `OneToMany - One ${entity} has many ${capitalizedRelatedEntity}s (${capitalizedRelatedEntity} has FK to ${entity})`,
                value: "OneToMany"
              },
              {
                name: `ManyToMany - Many ${entity}s have many ${capitalizedRelatedEntity}s (junction table auto-created)`,
                value: "ManyToMany"
              }
            ]
          }
        ])

        if (relationType === "ManyToMany") {
          // Auto-create junction table
          const junctionEntityName = `${entity}${capitalizedRelatedEntity}`
          const junctionFilePath = path.join(process.cwd(), "src", "entity", `${junctionEntityName}.ts`)

          // Check if junction table already exists
          if (!fs.existsSync(junctionFilePath)) {
            const { onDelete: onDeleteJunction } = await inquirer.prompt([
              {
                type: "list",
                name: "onDelete",
                message: "What to do when related entities are deleted?",
                choices: onDeleteChoices,
                default: "CASCADE"
              }
            ])

            // Singularize property names for FK columns in junction table
            const singularCurrentEntity = entity.toLowerCase()
            const singularRelatedEntity = relatedEntity

            // Create junction entity with ONLY FK columns (no relation arrays)
            const junctionProperties: Array<ColumnType> = [
              {
                name: singularCurrentEntity,
                type: "relation",
                nullable: false,
                unique: false,
                fk: true,
                references: entity.toLowerCase(),
                onDelete: onDeleteJunction
              },
              {
                name: singularRelatedEntity,
                type: "relation",
                nullable: false,
                unique: false,
                fk: true,
                references: relatedEntity,
                onDelete: onDeleteJunction
              }
            ]

            const junctionFileContent = EntityGeneratorHelper.getFullEntityCode(junctionEntityName, junctionProperties)
            fs.writeFileSync(junctionFilePath, junctionFileContent)

            // Create repository for junction table
            const junctionRepositoryContent = this.generateRepositoryFile(junctionEntityName)
            const junctionRepositoryFilePath = path.join(process.cwd(), "src", "repository", `${junctionEntityName}Repository.ts`)
            fs.writeFileSync(junctionRepositoryFilePath, junctionRepositoryContent)

            LyraConsole.success(
              `Junction table entity created!`,
              `Entity file at: ${junctionFilePath}`,
              `Repository file at: ${junctionRepositoryFilePath}`
            )

            // Now update BOTH entities with metadata and array properties
            // Update current entity (e.g., Post)
            const currentEntityFilePath = path.join(process.cwd(), "src", "entity", `${entity}.ts`)
            const currentEntityContent = fs.readFileSync(currentEntityFilePath, "utf-8")

            // Add tags array property and metadata to Post
            const currentUpdatedContent = this.addManyToManyRelationToEntity(
              currentEntityContent,
              entity,
              propName, // e.g., "tags"
              capitalizedRelatedEntity,
              junctionEntityName,
              singularCurrentEntity,
              singularRelatedEntity
            )
            fs.writeFileSync(currentEntityFilePath, currentUpdatedContent)

            // Update related entity (e.g., Tag)
            const relatedEntityFilePath = path.join(process.cwd(), "src", "entity", `${capitalizedRelatedEntity}.ts`)
            if (fs.existsSync(relatedEntityFilePath)) {
              const relatedEntityContent = fs.readFileSync(relatedEntityFilePath, "utf-8")

              // Add posts array property and metadata to Tag
              const pluralCurrentEntity = `${entity.toLowerCase()}s`
              const relatedUpdatedContent = this.addManyToManyRelationToEntity(
                relatedEntityContent,
                capitalizedRelatedEntity,
                pluralCurrentEntity, // e.g., "posts"
                entity,
                junctionEntityName,
                singularRelatedEntity,
                singularCurrentEntity
              )
              fs.writeFileSync(relatedEntityFilePath, relatedUpdatedContent)
            }

            LyraConsole.success(
              `Many-to-Many relation configured!`,
              `${entity}.${propName} -> ${capitalizedRelatedEntity}`,
              `${capitalizedRelatedEntity}.${entity.toLowerCase()}s -> ${entity}`,
              `Junction table: ${junctionEntityName}`
            )
          }

          // Don't add FK to current entity for ManyToMany
          // The relation will be handled through the junction table
          // Ask if user wants to add more properties before continuing
          const { more } = await inquirer.prompt([
            {
              type: "confirm",
              name: "more",
              message: "Add another property ?",
              default: false
            }
          ])

          addMore = more
          continue
        } else if (relationType === "ManyToOne") {
          // Current entity gets FK
          references = relatedEntity

          const { onDelete: onDeleteConstraint, addInverseRelation } = await inquirer.prompt([
            {
              type: "list",
              name: "onDelete",
              message: "What to do on related entity delete?",
              choices: onDeleteChoices,
              default: "CASCADE"
            },
            {
              type: "confirm",
              name: "addInverseRelation",
              message: `Add array property to ${capitalizedRelatedEntity} to access all related ${entity}s?`,
              default: true
            }
          ])

          onDelete = onDeleteConstraint

          if (addInverseRelation) {
            const { inversePropertyName } = await inquirer.prompt([
              {
                type: "input",
                name: "inversePropertyName",
                message: `Property name for ${entity} array in ${capitalizedRelatedEntity}:`,
                default: `${entity.toLowerCase()}s`,
                validate: (input) => ConsoleInputValidator.isPropertyNameValid(input)
              }
            ])

            inverseRelation = {
              propertyName: inversePropertyName,
              relatedEntity: entity
            }
          }
        } else if (relationType === "OneToMany") {
          // Related entity gets FK (not current entity)
          // We need to update the related entity to add FK back to current entity
          LyraConsole.info(
            `OneToMany relation setup:`,
            `${capitalizedRelatedEntity} will need a foreign key to ${entity}`,
            `Please run 'make:entity ${capitalizedRelatedEntity}' to add the foreign key`
          )
          // Ask if user wants to add more properties before continuing
          const { more } = await inquirer.prompt([
            {
              type: "confirm",
              name: "more",
              message: "Add another property ?",
              default: false
            }
          ])

          addMore = more
          continue
        } else if (relationType === "OneToOne") {
          // Current entity gets FK (similar to ManyToOne but without array on other side)
          references = relatedEntity

          const { onDelete: onDeleteConstraint } = await inquirer.prompt([
            {
              type: "list",
              name: "onDelete",
              message: "What to do on related entity delete?",
              choices: onDeleteChoices,
              default: "CASCADE"
            }
          ])

          onDelete = onDeleteConstraint
        }
      }

      let size: string | number | null = null
      if (propType === "varchar") {
        const { varcharLength } = await inquirer.prompt([
          {
            type: "input",
            name: "varcharLength",
            message: "Varchar max length ?",
            default: "255",
            validate: (input) => ConsoleInputValidator.isVarcharLengthValid(input)
          }
        ])
        size = parseInt(varcharLength)
      }

      let nullable = false
      let unique = false

      // Only ask nullable/unique for non-relation types (relations are arrays by default)
      if (propType !== "relation") {
        const nullableAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "nullable",
            message: "Nullable ?",
            default: false
          }
        ])
        nullable = nullableAnswer.nullable

        const uniqueAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "unique",
            message: "Unique ?",
            default: false
          }
        ])
        unique = uniqueAnswer.unique
      }

      properties.push({
        name: propName,
        type: propType,
        size: size ?? undefined,
        nullable,
        unique,
        fk: references ? true : undefined,
        references,
        onDelete,
        inverseRelation
      })

      const { more } = await inquirer.prompt([
        {
          type: "confirm",
          name: "more",
          message: "Add an other property ?",
          default: false
        }
      ])

      addMore = more
    }

    const entityFileContent = this.generateEntityFile(entity, properties)
    const entityFilePath = path.join(process.cwd(), "src", "entity", `${entity}.ts`)
    const repositoryFilePath = path.join(process.cwd(), "src", "repository", `${entity}Repository.ts`)

    // Write entity file
    fs.writeFileSync(entityFilePath, entityFileContent)

    // Update related entities with inverse relation properties
    this.updateRelatedEntitiesWithInverseProperties(entity, properties)

    // Check if repository already exists
    let repositoryCreated = false
    if (fs.existsSync(repositoryFilePath)) {
      const { overwriteRepository } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwriteRepository",
          message: `Repository "${entity}Repository" already exists. Do you want to overwrite it? This will delete any custom methods.`,
          default: false
        }
      ])

      if (overwriteRepository) {
        const repositoryFileContent = this.generateRepositoryFile(entity)
        fs.writeFileSync(repositoryFilePath, repositoryFileContent)
        repositoryCreated = true
      }
    } else {
      const repositoryFileContent = this.generateRepositoryFile(entity)
      fs.writeFileSync(repositoryFilePath, repositoryFileContent)
      repositoryCreated = true
    }

    if (repositoryCreated) {
      LyraConsole.success(
        `Entity and repository generated!`,
        `Entity file at: ${entityFilePath}`,
        `Repository file at: ${repositoryFilePath}`,
        "",
        "You can create a controller for this entity using the 'make:controller' command"
      )
    } else {
      LyraConsole.success(
        `Entity generated!`,
        `Entity file at: ${entityFilePath}`,
        `Repository file at: ${repositoryFilePath} (existing file preserved)`,
        "",
        "You can create a controller for this entity using the 'make:controller' command"
      )
    }

    // Check for User relations and generate ownership middleware
    this.generateOwnershipMiddleware(entity, properties)
  }

  /**
   * Prompts for new properties to add to existing entity
   * @param {string} entityName - Name of the existing entity to update
   * @returns {Promise<void>}
   */
  private async updateEntityPrompts(entityName: string) {
    const { addProperty } = await inquirer.prompt([
      {
        type: "confirm",
        name: "addProperty",
        message: `Entity "${entityName}" already exists. Do you want to add a new property?`,
        default: true
      }
    ])

    if (!addProperty) {
      LyraConsole.info("Operation cancelled.")
      return
    }

    const properties: Array<ColumnType> = []
    let addMore = true

    while (addMore) {
      const { propName } = await inquirer.prompt([
        {
          type: "input",
          name: "propName",
          message: "Property name (ie: banana, banana_color) ?",
          validate: (input) => ConsoleInputValidator.isPropertyNameValid(input)
        }
      ])

      const { propType } = await inquirer.prompt([
        {
          type: "list",
          name: "propType",
          message: `SQL datatype of "${propName}" ?`,
          choices: sqlTypeChoices
        }
      ])

      let references: string | undefined
      let onDelete: ConstraintType | undefined
      let inverseRelation: {
        propertyName: string
        relatedEntity: string
        manyToMany?: {
          junctionEntity: string
          junctionForeignKey: string
          targetForeignKey: string
        }
      } | undefined

      if (propType === "relation") {
        const entityFolder = path.join(process.cwd(), "src", "entity")
        const existingEntities: string[] = []

        fs.readdirSync(entityFolder)
          .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
          .forEach((file) => {
            existingEntities.push(file.replace(".ts", "").toLowerCase())
          })

        const { relatedEntity } = await inquirer.prompt([
          {
            type: "list",
            name: "relatedEntity",
            message: "Related entity ?",
            choices: existingEntities
          }
        ])

        const capitalizedRelatedEntity = relatedEntity.charAt(0).toUpperCase() + relatedEntity.slice(1)

        // Ask for relation type with descriptions
        const { relationType } = await inquirer.prompt([
          {
            type: "list",
            name: "relationType",
            message: `Relation type between ${entityName} and ${capitalizedRelatedEntity}?`,
            choices: [
              {
                name: `OneToOne - One ${entityName} has one ${capitalizedRelatedEntity}, and one ${capitalizedRelatedEntity} has one ${entityName}`,
                value: "OneToOne"
              },
              {
                name: `ManyToOne - Many ${entityName}s belong to one ${capitalizedRelatedEntity} (${entityName} has FK to ${capitalizedRelatedEntity})`,
                value: "ManyToOne"
              },
              {
                name: `OneToMany - One ${entityName} has many ${capitalizedRelatedEntity}s (${capitalizedRelatedEntity} has FK to ${entityName})`,
                value: "OneToMany"
              },
              {
                name: `ManyToMany - Many ${entityName}s have many ${capitalizedRelatedEntity}s (junction table auto-created)`,
                value: "ManyToMany"
              }
            ]
          }
        ])

        if (relationType === "ManyToMany") {
          // Auto-create junction table
          const junctionEntityName = `${entityName}${capitalizedRelatedEntity}`
          const junctionFilePath = path.join(process.cwd(), "src", "entity", `${junctionEntityName}.ts`)

          // Check if junction table already exists
          if (!fs.existsSync(junctionFilePath)) {
            const { onDelete: onDeleteJunction } = await inquirer.prompt([
              {
                type: "list",
                name: "onDelete",
                message: "What to do when related entities are deleted?",
                choices: onDeleteChoices,
                default: "CASCADE"
              }
            ])

            // Singularize property names for FK columns in junction table
            const singularCurrentEntity = entityName.toLowerCase()
            const singularRelatedEntity = relatedEntity

            // Create junction entity with ONLY FK columns (no relation arrays)
            const junctionProperties: Array<ColumnType> = [
              {
                name: singularCurrentEntity,
                type: "relation",
                nullable: false,
                unique: false,
                fk: true,
                references: entityName.toLowerCase(),
                onDelete: onDeleteJunction
              },
              {
                name: singularRelatedEntity,
                type: "relation",
                nullable: false,
                unique: false,
                fk: true,
                references: relatedEntity,
                onDelete: onDeleteJunction
              }
            ]

            const junctionFileContent = EntityGeneratorHelper.getFullEntityCode(junctionEntityName, junctionProperties)
            fs.writeFileSync(junctionFilePath, junctionFileContent)

            // Create repository for junction table
            const junctionRepositoryContent = this.generateRepositoryFile(junctionEntityName)
            const junctionRepositoryFilePath = path.join(process.cwd(), "src", "repository", `${junctionEntityName}Repository.ts`)
            fs.writeFileSync(junctionRepositoryFilePath, junctionRepositoryContent)

            LyraConsole.success(
              `Junction table entity created!`,
              `Entity file at: ${junctionFilePath}`,
              `Repository file at: ${junctionRepositoryFilePath}`
            )

            // Now update BOTH entities with metadata and array properties
            // Update current entity (e.g., Post)
            const currentEntityFilePath = path.join(process.cwd(), "src", "entity", `${entityName}.ts`)
            const currentEntityContent = fs.readFileSync(currentEntityFilePath, "utf-8")

            // Add tags array property and metadata to Post
            const currentUpdatedContent = this.addManyToManyRelationToEntity(
              currentEntityContent,
              entityName,
              propName, // e.g., "tags"
              capitalizedRelatedEntity,
              junctionEntityName,
              singularCurrentEntity,
              singularRelatedEntity
            )
            fs.writeFileSync(currentEntityFilePath, currentUpdatedContent)

            // Update related entity (e.g., Tag)
            const relatedEntityFilePath = path.join(process.cwd(), "src", "entity", `${capitalizedRelatedEntity}.ts`)
            if (fs.existsSync(relatedEntityFilePath)) {
              const relatedEntityContent = fs.readFileSync(relatedEntityFilePath, "utf-8")

              // Add posts array property and metadata to Tag
              const pluralCurrentEntity = `${entityName.toLowerCase()}s`
              const relatedUpdatedContent = this.addManyToManyRelationToEntity(
                relatedEntityContent,
                capitalizedRelatedEntity,
                pluralCurrentEntity, // e.g., "posts"
                entityName,
                junctionEntityName,
                singularRelatedEntity,
                singularCurrentEntity
              )
              fs.writeFileSync(relatedEntityFilePath, relatedUpdatedContent)
            }

            LyraConsole.success(
              `Many-to-Many relation configured!`,
              `${entityName}.${propName} -> ${capitalizedRelatedEntity}`,
              `${capitalizedRelatedEntity}.${entityName.toLowerCase()}s -> ${entityName}`,
              `Junction table: ${junctionEntityName}`
            )
          }

          // Don't add FK to current entity for ManyToMany
          // The relation will be handled through the junction table
          // Ask if user wants to add more properties before continuing
          const { more } = await inquirer.prompt([
            {
              type: "confirm",
              name: "more",
              message: "Add another property ?",
              default: false
            }
          ])

          addMore = more
          continue
        } else if (relationType === "ManyToOne") {
          // Current entity gets FK
          references = relatedEntity

          const { onDelete: onDeleteConstraint, addInverseRelation } = await inquirer.prompt([
            {
              type: "list",
              name: "onDelete",
              message: "What to do on related entity delete?",
              choices: onDeleteChoices,
              default: "CASCADE"
            },
            {
              type: "confirm",
              name: "addInverseRelation",
              message: `Add array property to ${capitalizedRelatedEntity} to access all related ${entityName}s?`,
              default: true
            }
          ])

          onDelete = onDeleteConstraint

          if (addInverseRelation) {
            const { inversePropertyName } = await inquirer.prompt([
              {
                type: "input",
                name: "inversePropertyName",
                message: `Property name for ${entityName} array in ${capitalizedRelatedEntity}:`,
                default: `${entityName.toLowerCase()}s`,
                validate: (input) => ConsoleInputValidator.isPropertyNameValid(input)
              }
            ])

            inverseRelation = {
              propertyName: inversePropertyName,
              relatedEntity: entityName
            }
          }
        } else if (relationType === "OneToMany") {
          // Related entity gets FK (not current entity)
          // We need to update the related entity to add FK back to current entity
          LyraConsole.info(
            `OneToMany relation setup:`,
            `${capitalizedRelatedEntity} will need a foreign key to ${entityName}`,
            `Please run 'make:entity ${capitalizedRelatedEntity}' to add the foreign key`
          )
          // Skip adding this property
          continue
        } else if (relationType === "OneToOne") {
          // Current entity gets FK (similar to ManyToOne but without array on other side)
          references = relatedEntity

          const { onDelete: onDeleteConstraint } = await inquirer.prompt([
            {
              type: "list",
              name: "onDelete",
              message: "What to do on related entity delete?",
              choices: onDeleteChoices,
              default: "CASCADE"
            }
          ])

          onDelete = onDeleteConstraint
        }
      }

      let size: string | number | null = null
      if (propType === "varchar") {
        const { varcharLength } = await inquirer.prompt([
          {
            type: "input",
            name: "varcharLength",
            message: "Varchar max length ?",
            default: "255",
            validate: (input) => ConsoleInputValidator.isVarcharLengthValid(input)
          }
        ])
        size = parseInt(varcharLength)
      }

      let nullable = false
      let unique = false

      // Only ask nullable/unique for non-relation types (relations are arrays by default)
      if (propType !== "relation") {
        const nullableAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "nullable",
            message: "Nullable ?",
            default: false
          }
        ])
        nullable = nullableAnswer.nullable

        const uniqueAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "unique",
            message: "Unique ?",
            default: false
          }
        ])
        unique = uniqueAnswer.unique
      }

      properties.push({
        name: propName,
        type: propType,
        size: size ?? undefined,
        nullable,
        unique,
        fk: references ? true : undefined,
        references,
        onDelete,
        inverseRelation
      })

      const { more } = await inquirer.prompt([
        {
          type: "confirm",
          name: "more",
          message: "Add another property ?",
          default: false
        }
      ])

      addMore = more
    }

    // Read existing entity file
    const entityFilePath = path.join(process.cwd(), "src", "entity", `${entityName}.ts`)
    const existingContent = fs.readFileSync(entityFilePath, "utf-8")

    // Add new properties to existing entity
    const updatedContent = EntityGeneratorHelper.addPropertiesToExistingEntity(existingContent, properties)

    fs.writeFileSync(entityFilePath, updatedContent)

    // Update related entities with inverse relation properties
    this.updateRelatedEntitiesWithInverseProperties(entityName, properties)

    LyraConsole.success(
      `Entity updated successfully!`,
      `New ${properties.length > 1 ? "properties" : "property"} added to: ${entityFilePath}`,
      "",
      "Don't forget to run migrations to update your database schema!"
    )

    // Check for User relations in new properties and generate ownership middleware
    this.generateOwnershipMiddleware(entityName, properties)
  }

  /**
   * Generates entity file content
   * @param {string} entityName - Name of the entity
   * @param {Array<ColumnType>} properties - Array of entity properties
   * @returns {string} - Generated entity file content
   */
  private generateEntityFile(entityName: string, properties: Array<ColumnType>): string {
    return EntityGeneratorHelper.getFullEntityCode(entityName, properties)
  }

  /**
   * Generates repository file content
   * @param {string} entityName - Name of the entity
   * @returns {string} - Generated repository file content
   */
  private generateRepositoryFile(entityName: string): string {
    return RepositoryGeneratorHelper.getFullRepositoryCode(entityName)
  }

  /**
   * Checks if an entity file already exists
   * @param {string} entityName - Name of the entity to check
   * @returns {boolean} - True if entity exists, false otherwise
   */
  private entityExists(entityName: string): boolean {
    const entityFilePath = path.join(process.cwd(), "src", "entity", `${entityName}.ts`)
    return fs.existsSync(entityFilePath)
  }

  /**
   * Updates related entities with inverse relation properties
   * When creating Post→Category FK, adds posts: Post[] = [] to Category
   * @param {string} entityName - Name of the current entity being created
   * @param {Array<ColumnType>} properties - Array of entity properties
   * @returns {void}
   */
  private updateRelatedEntitiesWithInverseProperties(entityName: string, properties: Array<ColumnType>): void {
    const currentEntityFilePath = path.join(process.cwd(), "src", "entity", `${entityName}.ts`)
    let currentEntityContent = fs.readFileSync(currentEntityFilePath, "utf-8")
    let currentEntityModified = false

    // Loop through properties looking for FK relations
    properties.forEach((property) => {
      if (!property.references || !property.name) {
        return
      }

      // Extract the related entity name from references (e.g., "category.id" → "Category")
      const referencedEntityName = property.references.split('.')[0]
      const capitalizedReferencedEntity = referencedEntityName.charAt(0).toUpperCase() + referencedEntityName.slice(1)

      // Add inverse relation to RELATED entity (OneToMany)
      if (property.inverseRelation) {
        const { inverseRelation } = property

        // Path to the related entity file
        const relatedEntityFilePath = path.join(process.cwd(), "src", "entity", `${capitalizedReferencedEntity}.ts`)

        // Check if the related entity file exists
        if (!fs.existsSync(relatedEntityFilePath)) {
          LyraConsole.warn(
            `Related entity file not found: ${relatedEntityFilePath}`,
            `Skipping inverse relation property "${inverseRelation.propertyName}"`
          )
          return
        }

        // Read the existing entity file
        let relatedEntityContent = fs.readFileSync(relatedEntityFilePath, "utf-8")

        // Check if the property already exists in the file
        const propertyPattern = new RegExp(`\\s+${inverseRelation.propertyName}:\\s*${inverseRelation.relatedEntity}\\[\\]`)
        if (propertyPattern.test(relatedEntityContent)) {
          // Property already exists, skip
          return
        }

        // Add inverse relation property with @Relation decorator
        const constructorRegex = /\s+constructor\(/
        const constructorMatch = relatedEntityContent.match(constructorRegex)

        if (!constructorMatch || constructorMatch.index === undefined) {
          LyraConsole.warn(
            `Could not find constructor in entity file: ${relatedEntityFilePath}`,
            `Skipping inverse relation property "${inverseRelation.propertyName}"`
          )
          return
        }

        const beforeConstructor = relatedEntityContent.substring(0, constructorMatch.index)
        const fromConstructor = relatedEntityContent.substring(constructorMatch.index)

        let propertyCode = "\n"
        propertyCode += `  @Relation({ type: "oneToMany", entity: "${inverseRelation.relatedEntity}", foreignKey: "${property.name}" })\n`
        propertyCode += `  ${inverseRelation.propertyName}: ${inverseRelation.relatedEntity}[] = []\n`

        relatedEntityContent = beforeConstructor + propertyCode + fromConstructor

        // Ensure Relation import exists
        const relationImportPattern = /import \{[^}]*Relation[^}]*\} from ["']@lyra-js\/core["']/
        if (!relationImportPattern.test(relatedEntityContent)) {
          const importPattern = /import \{([^}]+)\} from ["']@lyra-js\/core["']/
          const importMatch = relatedEntityContent.match(importPattern)
          if (importMatch) {
            const imports = importMatch[1].split(',').map((i) => i.trim())
            if (!imports.includes('Relation')) {
              imports.push('Relation')
              const newImport = `import { ${imports.join(', ')} } from "@lyra-js/core"`
              relatedEntityContent = relatedEntityContent.replace(importPattern, newImport)
            }
          }
        }

        // Ensure entity import exists
        const entityImportPattern = new RegExp(`import \\{ ${inverseRelation.relatedEntity} \\}`)
        if (!entityImportPattern.test(relatedEntityContent)) {
          const importStatement = `\nimport { ${inverseRelation.relatedEntity} } from "@entity/${inverseRelation.relatedEntity}"\n`
          const lastImportRegex = /import .+ from .+\n/g
          const imports = relatedEntityContent.match(lastImportRegex)
          if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1]
            const lastImportIndex = relatedEntityContent.lastIndexOf(lastImport)
            if (lastImportIndex !== -1) {
              const insertPosition = lastImportIndex + lastImport.length
              relatedEntityContent = relatedEntityContent.substring(0, insertPosition) + importStatement + relatedEntityContent.substring(insertPosition)
            }
          }
        }

        // Write the updated content back to the file
        // Ensure no more than 1 successive empty line (max 2 consecutive newlines)
        relatedEntityContent = relatedEntityContent.replace(/\n{3,}/g, '\n\n')
        fs.writeFileSync(relatedEntityFilePath, relatedEntityContent)

        LyraConsole.info(
          `Updated ${capitalizedReferencedEntity} entity:`,
          `Added inverse relation property "${inverseRelation.propertyName}: ${inverseRelation.relatedEntity}[]"`
        )
      }
    })

    // Write updated current entity content if modified
    if (currentEntityModified) {
      // Ensure no more than 1 successive empty line (max 2 consecutive newlines)
      currentEntityContent = currentEntityContent.replace(/\n{3,}/g, '\n\n')
      fs.writeFileSync(currentEntityFilePath, currentEntityContent)
    }
  }

  /**
   * Adds many-to-many relation (array property + metadata) to an entity
   * @param {string} entityContent - Current entity file content
   * @param {string} entityName - Name of the entity being updated
   * @param {string} propertyName - Name of the array property (e.g., "tags")
   * @param {string} relatedEntity - Name of the related entity (e.g., "Tag")
   * @param {string} junctionEntity - Name of the junction entity (e.g., "PostTag")
   * @param {string} junctionForeignKey - FK in junction pointing to this entity
   * @param {string} targetForeignKey - FK in junction pointing to related entity
   * @returns {string} - Updated entity content
   */
  private addManyToManyRelationToEntity(
    entityContent: string,
    entityName: string,
    propertyName: string,
    relatedEntity: string,
    junctionEntity: string,
    junctionForeignKey: string,
    targetForeignKey: string
  ): string {
    let updatedContent = entityContent

    // 1. Add import for related entity if not present
    const importPattern = new RegExp(`import \\{ ${relatedEntity} \\}`)
    if (!importPattern.test(updatedContent)) {
      const importStatement = `import { ${relatedEntity} } from "@entity/${relatedEntity}"\n`
      const lastImportRegex = /import .+ from .+\n/g
      const imports = updatedContent.match(lastImportRegex)
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1]
        const lastImportIndex = updatedContent.lastIndexOf(lastImport)
        if (lastImportIndex !== -1) {
          const insertPosition = lastImportIndex + lastImport.length
          updatedContent = updatedContent.substring(0, insertPosition) + `\n` + importStatement + updatedContent.substring(insertPosition)
        }
      }
    }

    // 2. Add @Relation decorator and array property before constructor
    const propertyPattern = new RegExp(`\\s+${propertyName}:\\s*${relatedEntity}\\[\\]`)
    if (!propertyPattern.test(updatedContent)) {
      const constructorRegex = /\s+constructor\(/
      const constructorMatch = updatedContent.match(constructorRegex)

      if (constructorMatch && constructorMatch.index !== undefined) {
        const beforeConstructor = updatedContent.substring(0, constructorMatch.index)
        const fromConstructor = updatedContent.substring(constructorMatch.index)

        let propertyCode = "\n"
        propertyCode += `  @Relation({ type: "manyToMany", entity: "${relatedEntity}", through: "${junctionEntity}", foreignKey: "${junctionForeignKey}", targetKey: "${targetForeignKey}" })\n`
        propertyCode += `  ${propertyName}: ${relatedEntity}[] = []\n`

        updatedContent = beforeConstructor + propertyCode + fromConstructor
      }
    }

    // 3. Ensure Relation import exists
    const relationImportPattern = /import \{[^}]*Relation[^}]*\} from ["']@lyra-js\/core["']/
    if (!relationImportPattern.test(updatedContent)) {
      // Add Relation to existing imports
      const importPattern = /import \{([^}]+)\} from ["']@lyra-js\/core["']/
      const importMatch = updatedContent.match(importPattern)
      if (importMatch) {
        const imports = importMatch[1].split(',').map((i) => i.trim())
        if (!imports.includes('Relation')) {
          imports.push('Relation')
          const newImport = `import { ${imports.join(', ')} } from "@lyra-js/core"`
          updatedContent = updatedContent.replace(importPattern, newImport)
        }
      }
    }

    // Ensure no more than 1 successive empty line (max 2 consecutive newlines)
    updatedContent = updatedContent.replace(/\n{3,}/g, '\n\n')

    return updatedContent
  }

  /**
   * Detects User relations and generates ownership middleware
   * @param {string} entityName - Name of the entity
   * @param {Array<ColumnType>} properties - Array of entity properties
   * @returns {void}
   */
  private generateOwnershipMiddleware(entityName: string, properties: Array<ColumnType>): void {
    // Find properties that reference the User entity
    const userRelations = properties.filter(
      (prop) => prop.references && prop.references.toLowerCase() === "user"
    )

    if (userRelations.length === 0) {
      return
    }

    // For each User relation, generate a middleware
    userRelations.forEach((relation) => {
      if (!relation.name) return

      const middlewareCode = MiddlewareGeneratorHelper.getOwnershipMiddlewareCode(
        entityName,
        relation.name
      )
      const middlewareFileName = MiddlewareGeneratorHelper.getMiddlewareFileName(entityName)
      const middlewareFilePath = path.join(process.cwd(), "src", "middleware", middlewareFileName)

      // Ensure middleware directory exists
      const middlewareDir = path.join(process.cwd(), "src", "middleware")
      if (!fs.existsSync(middlewareDir)) {
        fs.mkdirSync(middlewareDir, { recursive: true })
      }

      // Write middleware file
      fs.writeFileSync(middlewareFilePath, middlewareCode)

      LyraConsole.success(
        `Ownership middleware generated!`,
        `Middleware file at: ${middlewareFilePath}`,
        `Property "${relation.name}" references User entity`,
        `Use this middleware in your routes to protect ${entityName} resources`
      )
    })
  }
}
