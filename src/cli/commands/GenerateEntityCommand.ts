import fs from "fs"
import inquirer from "inquirer"
import path from "path"

import { EntityGeneratorHelper, onDeleteChoices, RepositoryGeneratorHelper, sqlTypeChoices } from "@/core/cli/utils"
import { ConsoleInputValidator } from "@/core/cli/utils/ConsoleInputValidator"
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
   * Prompts for entity name and either creates new entity or updates existing one
   * @returns {Promise<void>}
   */
  async execute() {
    const { entityName } = await inquirer.prompt([
      {
        type: "input",
        name: "entityName",
        message: "Entity name (ie: Fruit, FruitType) ?",
        validate: (input) => ConsoleInputValidator.isEntityNameValid(input)
      }
    ])

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

      if (propType === "relation") {
        const entityFolder = path.join(process.cwd(), "src", "entity")
        const existingEntities: string[] = []

        fs.readdirSync(entityFolder)
          .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
          .forEach((file) => {
            existingEntities.push(file.replace(".ts", "").toLowerCase())
          })

        const relation = await inquirer.prompt([
          {
            type: "list",
            name: "relatedEntity",
            message: "Related entity ?",
            choices: existingEntities
          },
          {
            type: "list",
            name: "onDelete",
            message: "What to do on related entity delete ?",
            choices: onDeleteChoices,
            default: "CASCADE"
          }
        ])
        references = relation.relatedEntity
        onDelete = relation.onDelete
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

      const { nullable } = await inquirer.prompt([
        {
          type: "confirm",
          name: "nullable",
          message: "Nullable ?",
          default: false
        }
      ])

      const { unique } = await inquirer.prompt([
        {
          type: "confirm",
          name: "unique",
          message: "Unique ?",
          default: false
        }
      ])

      properties.push({
        name: propName,
        type: propType,
        size: size ?? undefined,
        nullable,
        unique,
        references,
        onDelete
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

      if (propType === "relation") {
        const entityFolder = path.join(process.cwd(), "src", "entity")
        const existingEntities: string[] = []

        fs.readdirSync(entityFolder)
          .filter((file) => file.endsWith(".ts") && !file.endsWith("~"))
          .forEach((file) => {
            existingEntities.push(file.replace(".ts", "").toLowerCase())
          })

        const relation = await inquirer.prompt([
          {
            type: "list",
            name: "relatedEntity",
            message: "Related entity ?",
            choices: existingEntities
          },
          {
            type: "list",
            name: "onDelete",
            message: "What to do on related entity delete ?",
            choices: onDeleteChoices,
            default: "CASCADE"
          }
        ])
        references = relation.relatedEntity
        onDelete = relation.onDelete
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

      const { nullable } = await inquirer.prompt([
        {
          type: "confirm",
          name: "nullable",
          message: "Nullable ?",
          default: false
        }
      ])

      const { unique } = await inquirer.prompt([
        {
          type: "confirm",
          name: "unique",
          message: "Unique ?",
          default: false
        }
      ])

      properties.push({
        name: propName,
        type: propType,
        size: size ?? undefined,
        nullable,
        unique,
        references,
        onDelete
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
    LyraConsole.success(
      `Entity updated successfully!`,
      `New ${properties.length > 1 ? "properties" : "property"} added to: ${entityFilePath}`,
      "",
      "Don't forget to run migrations to update your database schema!"
    )
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
}
