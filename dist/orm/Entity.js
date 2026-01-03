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
export class Entity {
    id = null;
    /**
     * Creates a new Entity instance
     * Automatically assigns properties from provided object
     * @param {Partial<T> | T} entity - Partial or complete entity data
     * @returns {Entity<T>} - Entity instance with assigned properties
     */
    constructor(entity) {
        if (entity) {
            Object.assign(this, entity);
        }
        return this;
    }
}
//# sourceMappingURL=Entity.js.map