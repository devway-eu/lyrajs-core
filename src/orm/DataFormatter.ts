import "reflect-metadata"

import { Entity } from "@/core/orm/Entity"
import { StdObject } from "@/core/types"

/**
 * DataFormatter class
 * Formats entity data according to database column type metadata
 * Converts values to appropriate JavaScript types based on SQL column types
 */
export class DataFormatter {
  /**
   * Formats entity data based on column metadata
   * Converts database values to appropriate JavaScript types (Date, number, string, etc.)
   * Handles nullable columns and various SQL data types
   * @param {Entity<StdObject> | StdObject} entity - Entity instance to format
   * @returns {StdObject} - Formatted entity with properly typed values
   * @example
   * const formattedUser = DataFormatter.getFormattedEntityData(rawUser)
   * // Date strings become Date objects, numeric strings become numbers, etc.
   */
  static getFormattedEntityData(entity: Entity<StdObject> | StdObject): StdObject {
    const columns = Reflect.getMetadata("entity:columns", entity)
    const EntityClass = entity.constructor as new (data?: StdObject) => StdObject
    const formattedEntity = new EntityClass(entity as StdObject)

    for (const [property, value] of Object.entries(entity)) {
      const columnInfo = columns?.find((col: StdObject) => col.name === property)

      if (!columnInfo) {
        ;(formattedEntity as StdObject)[property] = value
        continue
      }

      const { type, nullable } = columnInfo

      switch (type.toLowerCase()) {
        case "date":
        case "time":
        case "year":
        case "datetime":
        case "timestamp":
          ;(formattedEntity as StdObject)[property] = value && !nullable ? new Date(value as string) : null
          break
        case "tinyint":
        case "smallint":
        case "mediumint":
        case "int":
        case "integer":
        case "bigint":
          ;(formattedEntity as StdObject)[property] = value && !nullable ? parseInt(value as string) : null
          break
        case "float":
        case "double":
        case "decimal":
          ;(formattedEntity as StdObject)[property] = value && !nullable ? parseFloat(value as string) : null
          break
        case "char":
        case "varchar":
        case "tinytext":
        case "text":
        case "mediumtext":
        case "longtext":
        case "tinyblob":
        case "blob":
        case "mediumblob":
        case "longblob":
          ;(formattedEntity as StdObject)[property] = value && !nullable ? String(value) : null
          break
        case "json":
          ;(formattedEntity as StdObject)[property] = value && !nullable ? JSON.stringify(value) : null
          break
        default:
          ;(formattedEntity as StdObject)[property] = value
          break
      }
    }
    return formattedEntity as StdObject
  }
}
