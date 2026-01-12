import "reflect-metadata";
/**
 * LoadFixturesCommand class
 * Loads fixture data into the database
 * Empties all tables before loading fixtures to ensure clean state
 */
export declare class LoadFixturesCommand<T extends object> {
    /**
     * Executes the load fixtures command
     * Truncates all entity tables and loads fixture data
     * @returns {Promise<void>}
     */
    execute(): Promise<void>;
    /**
     * Empties all entity tables in the database
     * Disables foreign key checks, truncates tables, then re-enables checks
     * @returns {Promise<void>}
     */
    private emptyDatabase;
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Entity<T>[]>} - Array of entity instances
     */
    private getEntities;
    /**
     * Retrieves all fixture instances from the fixtures folder
     * @returns {Promise<any[]>} - Array of fixture instances
     */
    private getFixtures;
    /**
     * Initializes the DI Container with all dependencies
     * Automatically detects and registers common third-party libraries
     * @returns {Promise<DIContainer>}
     */
    private initializeDIContainer;
    /**
     * Automatically registers common third-party libraries if they're installed
     * @param {DIContainer} diContainer - DI container instance
     * @returns {Promise<void>}
     */
    private registerThirdPartyLibraries;
    /**
     * Loads and registers all services and repositories from the project
     * @param {DIContainer} diContainer - DI container instance
     * @returns {Promise<void>}
     */
    private loadServicesAndRepositories;
    /**
     * Auto-discover and register services or repositories from a directory
     * @param {DIContainer} diContainer - DI container instance
     * @param {string} dirPath - Directory path to scan
     * @param {'service' | 'repository'} expectedType - Type of injectable
     * @returns {Promise<void>}
     */
    private autoDiscoverInjectables;
    /**
     * Inject services and repositories into a fixture instance
     * @param {any} fixture - Fixture instance
     * @param {DIContainer} diContainer - DI Container instance
     * @returns {void}
     */
    private injectDependencies;
    /**
     * Get all files recursively from a directory
     * @param {string} dirPath - Directory path
     * @param {string[]} extensions - File extensions to include
     * @returns {string[]} - Array of file paths
     */
    private getAllFiles;
    /**
     * Check if a class extends a specific base class
     * @param {any} ClassType - Class to check
     * @param {any} BaseClass - Base class to check against
     * @returns {boolean} - True if ClassType extends BaseClass
     */
    private extendsClass;
    /**
     * Orders fixtures based on their dependencies property
     * Uses topological sort to ensure dependencies are loaded first
     * @param {any[]} fixtures - Array of fixture instances
     * @returns {any[]} - Ordered array of fixture instances
     */
    private orderFixturesByDependencies;
}
