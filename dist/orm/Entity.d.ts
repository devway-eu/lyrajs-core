/**
 * Entity base class
 * Base class for all database entities in LyraJS ORM
 * Provides id property and automatic property assignment from partial objects
 * @template T - The entity type
 * @example
 * class User extends Entity<User> {
 *   name: string
 *   email: string
 * }
 * const user = new User({ name: 'John', email: 'john@example.com' })
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
}
