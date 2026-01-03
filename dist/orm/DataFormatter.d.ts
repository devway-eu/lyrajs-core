import "reflect-metadata";
import { Entity } from "../orm/Entity.js";
import { StdObject } from "../types/index.js";
/**
 * DataFormatter class
 * Formats entity data according to database column type metadata
 * Converts values to appropriate JavaScript types based on SQL column types
 */
export declare class DataFormatter {
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
    static getFormattedEntityData(entity: Entity<StdObject> | StdObject): StdObject;
}
