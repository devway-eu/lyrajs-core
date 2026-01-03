import { Entity } from "../orm/Entity.js";
import { StdObject } from "../types/index.js";
/**
 * ObjectCleaner class
 * Utility for removing specific properties from objects
 * Useful for preparing entities for database operations
 */
export declare class ObjectCleaner {
    /**
     * Removes the id property from an object
     * Useful before inserting new entities into database
     * @param {Entity<StdObject> | StdObject} obj - Object to clean
     * @returns {Entity<StdObject> | StdObject} - Object without id property
     * @example
     * const cleanedEntity = ObjectCleaner.removeId(entity)
     */
    static removeId(obj: Entity<StdObject> | StdObject): StdObject | Entity<StdObject>;
    /**
     * Removes all function properties from an object
     * Leaves only data properties for serialization/persistence
     * @param {Entity<StdObject> | StdObject} obj - Object to clean
     * @returns {Entity<StdObject> | StdObject} - Object without methods
     * @example
     * const dataOnly = ObjectCleaner.removeMethods(entityInstance)
     */
    static removeMethods(obj: Entity<StdObject> | StdObject): StdObject | Entity<StdObject>;
}
