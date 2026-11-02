import "reflect-metadata";
/**
 * Entity base class
 * Base class for all database entities in LyraJS ORM
 * Provides id property and automatic property assignment from partial objects
 * Includes generic relation loading methods (with, withAll)
 * @template T - The entity type
 * @example
 * class User extends Entity<User> {
 *   name: string
 *   email: string
 * }
 * const user = new User({ name: 'John', email: 'john@example.com' })
 * await user.with('posts') // Load posts relation
 * await user.withAll() // Load all relations
 */
export declare class Entity<T extends object> {
    id: string | number | null;
    /**
     * Creates a new Entity instance
     * Automatically assigns properties from provided object
     * @param {Partial<T> | T} entity - Partial or complete entity data
     * @returns {Entity<T>} - Entity instance with assigned properties
     */
    constructor(entity?: Partial<T> | T);
    /**
     * Gets all available relations including auto-detected relations
     * Auto-detects:
     * - manyToOne: from FK columns on this entity (fk: true, references)
     * - oneToMany: by checking if properties exist that are arrays (e.g., posts: Post[])
     * @returns {RelationMetadata} - Combined relation metadata
     * @private
     */
    private getAllRelations;
    /**
     * Loads one or multiple relations for this entity
     * Uses QueriesBatcher to load multiple relations in parallel for better performance
     * Auto-detects manyToOne relations from FK columns (fk: true, references)
     * @param {string | string[]} relations - Single relation name or array of relation names
     * @returns {Promise<this>} - Returns this for method chaining
     * @example
     * await user.with('posts')
     * await user.with(['posts', 'comments'])
     * await post.with('category') // Auto-detected from category_id FK
     */
    with(relations: string | string[]): Promise<this>;
    /**
     * Loads all defined relations for this entity
     * Includes both explicit relations and auto-detected FK (manyToOne) relations
     * @returns {Promise<this>} - Returns this for method chaining
     * @example
     * await user.withAll()
     * await post.withAll() // Loads category (auto-detected FK), tags, comments, etc.
     */
    withAll(): Promise<this>;
    /**
     * Internal method to load a single relation
     * Handles One-to-Many, Many-to-Many, and Many-to-One (belongsTo) relationships
     * Uses QueriesBatcher to avoid await in loops for better performance
     * @param {string} propertyName - Name of the property to populate
     * @param {object} relation - Relation metadata
     * @returns {Promise<void>}
     * @private
     */
    private loadRelation;
}
