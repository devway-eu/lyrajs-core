import "reflect-metadata";
import fs from "fs";
import * as process from "node:process";
import path from "path";
import { db } from "../../orm/Database.js";
import { LyraConsole } from "../../console/LyraConsole.js";
import { DIContainer } from "../../server/DIContainer.js";
import { Service } from "../../server/Service.js";
import { Repository as RepositoryBase } from "../../orm/Repository.js";
/**
 * LoadFixturesCommand class
 * Loads fixture data into the database
 * Empties all tables before loading fixtures to ensure clean state
 */
export class LoadFixturesCommand {
    /**
     * Executes the load fixtures command
     * Truncates all entity tables and loads fixture data
     * @returns {Promise<void>}
     */
    async execute() {
        await this.emptyDatabase();
        // Initialize DI Container and load dependencies
        const diContainer = await this.initializeDIContainer();
        const fixtures = await this.getFixtures();
        // Inject dependencies into each fixture
        for (const fixture of fixtures) {
            this.injectDependencies(fixture, diContainer);
        }
        const orderedFixtures = this.orderFixturesByDependencies(fixtures);
        for (const fixture of orderedFixtures) {
            if (typeof fixture.load === "function") {
                LyraConsole.info(`Loading fixture: ${fixture.constructor.name}`);
                await fixture.load();
            }
            else {
                LyraConsole.error(`Fixture ${fixture.constructor.name} does not have a load method`);
            }
        }
        LyraConsole.success("Fixtures loaded");
        process.exit(0);
    }
    /**
     * Empties all entity tables in the database
     * Disables foreign key checks, truncates tables, then re-enables checks
     * @returns {Promise<void>}
     */
    async emptyDatabase() {
        const entities = await this.getEntities();
        await db.query(`SET FOREIGN_KEY_CHECKS = 0`);
        for (const entity of entities.reverse()) {
            const table = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase();
            await db.query("TRUNCATE TABLE `" + table + "`");
        }
        await db.query(`SET FOREIGN_KEY_CHECKS = 1`);
    }
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Entity<T>[]>} - Array of entity instances
     */
    async getEntities() {
        const entities = [];
        const entityFolder = path.join(process.cwd(), "src", "entity");
        const files = fs.readdirSync(entityFolder).filter((f) => f.endsWith(".ts") && !f.endsWith("~"));
        for (const file of files) {
            const modulePath = path.join(entityFolder, file);
            const entityModule = await import(`file://${modulePath}`);
            const className = file.replace(".ts", "");
            const EntityClass = entityModule[className];
            if (!EntityClass) {
                throw new Error(`Class ${className} not exported correctly in ${file}`);
            }
            const instance = new EntityClass();
            entities.push(instance);
        }
        return entities;
    }
    /**
     * Retrieves all fixture instances from the fixtures folder
     * @returns {Promise<any[]>} - Array of fixture instances
     */
    async getFixtures() {
        const fixtures = [];
        const fixturesFolder = path.join(process.cwd(), "src", "fixtures");
        if (!fs.existsSync(fixturesFolder)) {
            LyraConsole.error("No fixtures folder found at src/fixtures");
            return fixtures;
        }
        const files = fs.readdirSync(fixturesFolder).filter((f) => f.endsWith(".ts") && !f.endsWith("~"));
        for (const file of files) {
            const modulePath = path.join(fixturesFolder, file);
            const fixtureModule = await import(`file://${modulePath}`);
            const className = file.replace(".ts", "");
            const FixtureClass = fixtureModule[className];
            if (!FixtureClass) {
                throw new Error(`Class ${className} not exported correctly in ${file}`);
            }
            const instance = new FixtureClass();
            fixtures.push(instance);
        }
        return fixtures;
    }
    /**
     * Initializes the DI Container with all dependencies
     * Automatically detects and registers common third-party libraries
     * @returns {Promise<DIContainer>}
     */
    async initializeDIContainer() {
        const diContainer = new DIContainer();
        // Auto-register common third-party libraries if available
        await this.registerThirdPartyLibraries(diContainer);
        // Load services and repositories
        await this.loadServicesAndRepositories(diContainer);
        return diContainer;
    }
    /**
     * Automatically registers common third-party libraries if they're installed
     * @param {DIContainer} diContainer - DI container instance
     * @returns {Promise<void>}
     */
    async registerThirdPartyLibraries(diContainer) {
        // Try to register bcrypt
        try {
            const bcrypt = await import("bcrypt");
            diContainer.registerInstance("bcrypt", bcrypt.default || bcrypt, "service");
        }
        catch (error) {
            // bcrypt not installed, skip
        }
        // Try to register jsonwebtoken
        try {
            const jwt = await import("jsonwebtoken");
            diContainer.registerInstance("jwt", jwt.default || jwt, "service");
        }
        catch (error) {
            // jwt not installed, skip
        }
    }
    /**
     * Loads and registers all services and repositories from the project
     * @param {DIContainer} diContainer - DI container instance
     * @returns {Promise<void>}
     */
    async loadServicesAndRepositories(diContainer) {
        await this.autoDiscoverInjectables(diContainer, "src/services", "service");
        await this.autoDiscoverInjectables(diContainer, "src/repository", "repository");
        diContainer.injectAll();
    }
    /**
     * Auto-discover and register services or repositories from a directory
     * @param {DIContainer} diContainer - DI container instance
     * @param {string} dirPath - Directory path to scan
     * @param {'service' | 'repository'} expectedType - Type of injectable
     * @returns {Promise<void>}
     */
    async autoDiscoverInjectables(diContainer, dirPath, expectedType) {
        const absolutePath = path.resolve(process.cwd(), dirPath);
        if (!fs.existsSync(absolutePath)) {
            return;
        }
        const files = this.getAllFiles(absolutePath, [".ts", ".js"]);
        for (const file of files) {
            try {
                const fileUrl = `file://${file.replace(/\\/g, "/")}`;
                const module = await import(fileUrl);
                for (const key in module) {
                    const exportedItem = module[key];
                    if (typeof exportedItem === "function" && exportedItem.prototype) {
                        const isService = this.extendsClass(exportedItem, Service);
                        const isRepository = this.extendsClass(exportedItem, RepositoryBase);
                        if ((expectedType === "service" && isService) || (expectedType === "repository" && isRepository)) {
                            // Mark as injectable if not already
                            if (!Reflect.getMetadata("injectable", exportedItem)) {
                                Reflect.defineMetadata("injectable", true, exportedItem);
                                Reflect.defineMetadata("injectableType", expectedType, exportedItem);
                            }
                            diContainer.register(exportedItem);
                        }
                    }
                }
            }
            catch (error) {
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
    injectDependencies(fixture, diContainer) {
        diContainer.injectIntoController(fixture);
    }
    /**
     * Get all files recursively from a directory
     * @param {string} dirPath - Directory path
     * @param {string[]} extensions - File extensions to include
     * @returns {string[]} - Array of file paths
     */
    getAllFiles(dirPath, extensions) {
        const files = [];
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath, extensions));
            }
            else if (extensions.some((ext) => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
        return files;
    }
    /**
     * Check if a class extends a specific base class
     * @param {any} ClassType - Class to check
     * @param {any} BaseClass - Base class to check against
     * @returns {boolean} - True if ClassType extends BaseClass
     */
    extendsClass(ClassType, BaseClass) {
        try {
            return ClassType.prototype instanceof BaseClass;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Orders fixtures based on their dependencies property
     * Uses topological sort to ensure dependencies are loaded first
     * @param {any[]} fixtures - Array of fixture instances
     * @returns {any[]} - Ordered array of fixture instances
     */
    orderFixturesByDependencies(fixtures) {
        const fixtureMap = new Map();
        const dependencyMap = new Map();
        // Build maps
        for (const fixture of fixtures) {
            const name = fixture.constructor.name;
            fixtureMap.set(name, fixture);
            // Convert dependencies to class names
            const deps = fixture.dependencies || [];
            const depNames = deps.map((dep) => {
                if (typeof dep === "string") {
                    return dep;
                }
                else if (typeof dep === "function") {
                    return dep.name;
                }
                else if (dep && dep.constructor) {
                    return dep.constructor.name;
                }
                return String(dep);
            });
            dependencyMap.set(name, depNames);
        }
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (name) => {
            if (visited.has(name))
                return;
            if (visiting.has(name)) {
                throw new Error(`Circular dependency detected involving fixture: ${name}`);
            }
            visiting.add(name);
            const dependencies = dependencyMap.get(name) || [];
            for (const dep of dependencies) {
                if (!fixtureMap.has(dep)) {
                    throw new Error(`Fixture ${name} depends on ${dep}, but ${dep} was not found`);
                }
                visit(dep);
            }
            visiting.delete(name);
            visited.add(name);
            sorted.push(fixtureMap.get(name));
        };
        for (const name of fixtureMap.keys()) {
            visit(name);
        }
        return sorted;
    }
}
//# sourceMappingURL=LoadFixturesCommand.js.map