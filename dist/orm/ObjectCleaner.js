/**
 * ObjectCleaner class
 * Utility for removing specific properties from objects
 * Useful for preparing entities for database operations
 */
export class ObjectCleaner {
    /**
     * Removes the id property from an object
     * Useful before inserting new entities into database
     * @param {Entity<StdObject> | StdObject} obj - Object to clean
     * @returns {Entity<StdObject> | StdObject} - Object without id property
     * @example
     * const cleanedEntity = ObjectCleaner.removeId(entity)
     */
    static removeId(obj) {
        if (obj.id)
            delete obj.id;
        return obj;
    }
    /**
     * Removes all function properties from an object
     * Leaves only data properties for serialization/persistence
     * @param {Entity<StdObject> | StdObject} obj - Object to clean
     * @returns {Entity<StdObject> | StdObject} - Object without methods
     * @example
     * const dataOnly = ObjectCleaner.removeMethods(entityInstance)
     */
    static removeMethods(obj) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "function")
                delete obj[key];
        });
        return obj;
    }
}
//# sourceMappingURL=ObjectCleaner.js.map