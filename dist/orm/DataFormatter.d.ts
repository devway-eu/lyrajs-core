import "reflect-metadata";
import { Entity } from "../orm/Entity.js";
import { StdObject } from "../types/index.js";
export declare class DataFormatter {
    static getFormattedEntityData(entity: Entity<StdObject> | StdObject): StdObject;
}
