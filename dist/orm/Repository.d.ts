import { StdObject } from "../types/index.js";
/**
 * Repository class
 * Generic repository for database CRUD operations
 * Provides type-safe database access with automatic entity mapping
 * Implements SQL injection prevention through identifier sanitization and parameterized queries
 * @template T - Entity type that extends {id: number | string}
 * @example
 * class UserRepository extends Repository<User> {
 *   constructor() {
 *     super(User)
 *   }
 * }
 * const userRepo = new UserRepository()
 * const user = await userRepo.find(1)
 */
export declare class Repository<T extends {
    id: number | string;
}> {
    private readonly entityClass;
    private readonly table;
    /**
     * Creates a new Repository instance
     * Extracts table name from entity metadata
     * @param {new () => T} entityClass - Entity class constructor
     */
    constructor(entityClass: new () => T);
    /**
     * Sanitizes SQL identifiers to prevent SQL injection
     * @param identifier - The identifier to sanitize
     * @returns The sanitized identifier wrapped in backticks
     */
    private sanitizeIdentifier;
    /**
     * Finds a single entity by its primary key ID
     * @param {number | string} id - Primary key value
     * @returns {Promise<T | null>} - Entity instance or null if not found
     * @example
     * const user = await userRepository.find(42)
     */
    find: (id: number | string) => Promise<T | null>;
    /**
     * Finds a single entity matching the given constraints
     * Returns first match if multiple results exist
     * @param {StdObject} constraints - Key-value pairs for WHERE conditions
     * @returns {Promise<T | null>} - First matching entity or null
     * @example
     * const user = await userRepository.findOneBy({ email: 'user@example.com' })
     */
    findOneBy: (constraints: StdObject) => Promise<T | null>;
    /**
     * Finds all entities matching the given criteria
     * All criteria must be satisfied (AND condition)
     * @param {Partial<T> | StdObject} criteria - Key-value pairs for WHERE conditions
     * @returns {Promise<T[]>} - Array of matching entities
     * @throws {Error} - If no criteria provided
     * @example
     * const activeUsers = await userRepository.findBy({ active: true, role: 'admin' })
     */
    findBy: (criteria: Partial<T> | StdObject) => Promise<T[]>;
    /**
     * Retrieves all entities from the table
     * @returns {Promise<T[]>} - Array of all entities
     * @example
     * const allUsers = await userRepository.findAll()
     */
    findAll: () => Promise<T[]>;
    /**
     * Saves an entity (insert or update)
     * Performs INSERT if entity has no id, UPDATE if id exists
     * Automatically formats data according to column metadata
     * @param {T | StdObject} entity - Entity to save
     * @returns {Promise<void>}
     * @example
     * const user = new User({ name: 'John', email: 'john@example.com' })
     * await userRepository.save(user) // INSERT
     * user.name = 'Jane'
     * await userRepository.save(user) // UPDATE
     */
    save: (entity: T | StdObject) => Promise<void>;
    /**
     * Deletes an entity by its primary key ID
     * @param {number | string} id - Primary key value of entity to delete
     * @returns {Promise<void>}
     * @example
     * await userRepository.delete(42)
     */
    delete: (id: number | string) => Promise<void>;
}
