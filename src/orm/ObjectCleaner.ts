import { Entity } from "@/core/orm/Entity"
import { StdObject } from "@/core/types"

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
  public static removeId(obj: Entity<StdObject> | StdObject) {
    if ((obj as { id?: number }).id) delete (obj as { id?: number }).id
    return obj
  }

  /**
   * Removes all function properties from an object
   * Leaves only data properties for serialization/persistence
   * @param {Entity<StdObject> | StdObject} obj - Object to clean
   * @returns {Entity<StdObject> | StdObject} - Object without methods
   * @example
   * const dataOnly = ObjectCleaner.removeMethods(entityInstance)
   */
  public static removeMethods(obj: Entity<StdObject> | StdObject) {
    Object.keys(obj as StdObject).forEach((key: string) => {
      if (typeof (obj as StdObject)[key] === "function") delete (obj as StdObject)[key]
    })

    return obj
  }
}
