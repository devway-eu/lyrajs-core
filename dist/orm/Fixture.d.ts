import { Container } from "../server/Container.js";
/**
 * Base Fixture class for seeding database with test or initial data
 * Extends Container to provide dependency injection capabilities
 * Supports dependency resolution for proper execution order
 */
export declare abstract class Fixture extends Container {
    /**
     * Optional array of fixture classes that must be loaded before this one
     * Used for automatic dependency resolution and execution ordering
     * @example
     * dependencies = [UserFixtures, RoleFixtures]
     */
    dependencies?: (typeof Fixture)[];
    /**
     * Abstract method that must be implemented by concrete fixture classes
     * Contains the logic for loading fixture data into the database
     * @example
     * async load() {
     *   await this.userRepository.save(new User({ username: 'admin' }))
     * }
     */
    abstract load(): Promise<void>;
}
