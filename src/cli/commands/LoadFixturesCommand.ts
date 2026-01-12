import "reflect-metadata"
import fs from "fs"
import * as process from "node:process"
import path from "path"

import { db } from "../../orm/Database"
import { Entity } from "../../orm/Entity"
import { LyraConsole } from "../../console/LyraConsole"
import { DIContainer } from "../../server/DIContainer"
import { Service } from "../../server/Service"
import { Repository as RepositoryBase } from "../../orm/Repository"

/**
 * LoadFixturesCommand class
 * Loads fixture data into the database
 * Empties all tables before loading fixtures to ensure clean state
 */
export class LoadFixturesCommand<T extends object> {
  /**
   * Executes the load fixtures command
   * Truncates all entity tables and loads fixture data
   * @returns {Promise<void>}
   */
  async execute() {
    await this.emptyDatabase()

    // Initialize DI Container and load dependencies
    const diContainer = await this.initializeDIContainer()

    const fixtures = await this.getFixtures()

    // Inject dependencies into each fixture
    for (const fixture of fixtures) {
      this.injectDependencies(fixture, diContainer)
    }

    const orderedFixtures = this.orderFixturesByDependencies(fixtures)

    for (const fixture of orderedFixtures) {
      if (typeof fixture.load === "function") {
        LyraConsole.info(`Loading fixture: ${fixture.constructor.name}`)
        await fixture.load()
      } else {
        LyraConsole.error(`Fixture ${fixture.constructor.name} does not have a load method`)
      }
    }

    LyraConsole.success("Fixtures loaded")
    process.exit(0)
  }

  /**
   * Empties all entity tables in the database
   * Disables foreign key checks, truncates tables, then re-enables checks
   * @returns {Promise<void>}
   */
  private async emptyDatabase() {
    const entities = await this.getEntities()
    await db.query(`SET FOREIGN_KEY_CHECKS = 0`)
    for (const entity of entities.reverse()) {
      const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase()
      await db.query("TRUNCATE TABLE `" + table + "`")
    }
    await db.query(`SET FOREIGN_KEY_CHECKS = 1`)
  }

  /**
   * Retrieves all entity instances from the entity folder
   * @returns {Promise<Entity<T>[]>} - Array of entity instances
   */
  private async getEntities() {
    const entities: Entity<T>[] = []

    const entityFolder = path.join(process.cwd(), "src", "entity")
    const files = fs.readdirSync(entityFolder).filter((f) => f.endsWith(".ts") && !f.endsWith("~"))

    for (const file of files) {
      const modulePath = path.join(entityFolder, file)

      const entityModule = await import(`file://${modulePath}`)
      const className = file.replace(".ts", "")

      const EntityClass = entityModule[className]
      if (!EntityClass) {
        throw new Error(`Class ${className} not exported correctly in ${file}`)
      }

      const instance = new EntityClass()
      entities.push(instance)
    }

    return entities
  }

  /**
   * Retrieves all fixture instances from the fixtures folder
   * @returns {Promise<any[]>} - Array of fixture instances
   */
  private async getFixtures() {
    const fixtures: any[] = []

    const fixturesFolder = path.join(process.cwd(), "src", "fixtures")

    if (!fs.existsSync(fixturesFolder)) {
      LyraConsole.error("No fixtures folder found at src/fixtures")
      return fixtures
    }

    const files = fs.readdirSync(fixturesFolder).filter((f) => f.endsWith(".ts") && !f.endsWith("~"))

    for (const file of files) {
      const modulePath = path.join(fixturesFolder, file)

      const fixtureModule = await import(`file://${modulePath}`)
      const className = file.replace(".ts", "")

      const FixtureClass = fixtureModule[className]
      if (!FixtureClass) {
        throw new Error(`Class ${className} not exported correctly in ${file}`)
      }

      const instance = new FixtureClass()
      fixtures.push(instance)
    }

    return fixtures
  }

  /**
   * Initializes the DI Container with all dependencies
   * Automatically detects and registers common third-party libraries
   * @returns {Promise<DIContainer>}
   */
  private async initializeDIContainer(): Promise<DIContainer> {
    const diContainer = new DIContainer()

    // Auto-register common third-party libraries if available
    await this.registerThirdPartyLibraries(diContainer)

    // Load services and repositories
    await this.loadServicesAndRepositories(diContainer)

    return diContainer
  }

  /**
   * Automatically registers common third-party libraries if they're installed
   * @param {DIContainer} diContainer - DI container instance
   * @returns {Promise<void>}
   */
  private async registerThirdPartyLibraries(diContainer: DIContainer): Promise<void> {
    // Try to register bcrypt
    try {
      const bcrypt = await import("bcrypt")
      diContainer.registerInstance("bcrypt", bcrypt.default || bcrypt, "service")
    } catch (error) {
      // bcrypt not installed, skip
    }

    // Try to register jsonwebtoken
    try {
      const jwt = await import("jsonwebtoken")
      diContainer.registerInstance("jwt", jwt.default || jwt, "service")
    } catch (error) {
      // jwt not installed, skip
    }
  }

  /**
   * Loads and registers all services and repositories from the project
   * @param {DIContainer} diContainer - DI container instance
   * @returns {Promise<void>}
   */
  private async loadServicesAndRepositories(diContainer: DIContainer) {
    await this.autoDiscoverInjectables(diContainer, "src/services", "service")
    await this.autoDiscoverInjectables(diContainer, "src/repository", "repository")
    diContainer.injectAll()
  }

  /**
   * Auto-discover and register services or repositories from a directory
   * @param {DIContainer} diContainer - DI container instance
   * @param {string} dirPath - Directory path to scan
   * @param {'service' | 'repository'} expectedType - Type of injectable
   * @returns {Promise<void>}
   */
  private async autoDiscoverInjectables(
    diContainer: DIContainer,
    dirPath: string,
    expectedType: "service" | "repository"
  ): Promise<void> {
    const absolutePath = path.resolve(process.cwd(), dirPath)

    if (!fs.existsSync(absolutePath)) {
      return
    }

    const files = this.getAllFiles(absolutePath, [".ts", ".js"])

    for (const file of files) {
      try {
        const fileUrl = `file://${file.replace(/\\/g, "/")}`
        const module = await import(fileUrl)

        for (const key in module) {
          const exportedItem = module[key]

          if (typeof exportedItem === "function" && exportedItem.prototype) {
            const isService = this.extendsClass(exportedItem, Service)
            const isRepository = this.extendsClass(exportedItem, RepositoryBase)

            if ((expectedType === "service" && isService) || (expectedType === "repository" && isRepository)) {
              // Mark as injectable if not already
              if (!Reflect.getMetadata("injectable", exportedItem)) {
                Reflect.defineMetadata("injectable", true, exportedItem)
                Reflect.defineMetadata("injectableType", expectedType, exportedItem)
              }
              diContainer.register(exportedItem)
            }
          }
        }
      } catch (error) {
        // Skip files that can't be imported
      }
    }
  }

  /**
   * Inject services and repositories into a fixture instance
   * @param {any} fixture - Fixture instance
   * @param {DIContainer} diContainer - DI Container instance
   * @returns {void}
   */
  private injectDependencies(fixture: any, diContainer: DIContainer): void {
    diContainer.injectIntoController(fixture)
  }

  /**
   * Get all files recursively from a directory
   * @param {string} dirPath - Directory path
   * @param {string[]} extensions - File extensions to include
   * @returns {string[]} - Array of file paths
   */
  private getAllFiles(dirPath: string, extensions: string[]): string[] {
    const files: string[] = []

    const items = fs.readdirSync(dirPath)

    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extensions))
      } else if (extensions.some((ext) => item.endsWith(ext))) {
        files.push(fullPath)
      }
    }

    return files
  }

  /**
   * Check if a class extends a specific base class
   * @param {any} ClassType - Class to check
   * @param {any} BaseClass - Base class to check against
   * @returns {boolean} - True if ClassType extends BaseClass
   */
  private extendsClass(ClassType: any, BaseClass: any): boolean {
    try {
      return ClassType.prototype instanceof BaseClass
    } catch {
      return false
    }
  }

  /**
   * Orders fixtures based on their dependencies property
   * Uses topological sort to ensure dependencies are loaded first
   * @param {any[]} fixtures - Array of fixture instances
   * @returns {any[]} - Ordered array of fixture instances
   */
  private orderFixturesByDependencies(fixtures: any[]): any[] {
    const fixtureMap = new Map<string, any>()
    const dependencyMap = new Map<string, string[]>()

    // Build maps
    for (const fixture of fixtures) {
      const name = fixture.constructor.name
      fixtureMap.set(name, fixture)

      // Convert dependencies to class names
      const deps = fixture.dependencies || []
      const depNames = deps.map((dep: any) => {
        if (typeof dep === "string") {
          return dep
        } else if (typeof dep === "function") {
          return dep.name
        } else if (dep && dep.constructor) {
          return dep.constructor.name
        }
        return String(dep)
      })

      dependencyMap.set(name, depNames)
    }

    const sorted: any[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving fixture: ${name}`)
      }

      visiting.add(name)

      const dependencies = dependencyMap.get(name) || []
      for (const dep of dependencies) {
        if (!fixtureMap.has(dep)) {
          throw new Error(`Fixture ${name} depends on ${dep}, but ${dep} was not found`)
        }
        visit(dep)
      }

      visiting.delete(name)
      visited.add(name)
      sorted.push(fixtureMap.get(name))
    }

    for (const name of fixtureMap.keys()) {
      visit(name)
    }

    return sorted
  }
}
