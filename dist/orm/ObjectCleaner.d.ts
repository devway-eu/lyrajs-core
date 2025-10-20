import { Entity } from "../orm/Entity.js";
import { StdObject } from "../types/index.js";
export declare class ObjectCleaner {
    static removeId(obj: Entity<StdObject> | StdObject): StdObject | Entity<StdObject>;
    static removeMethods(obj: Entity<StdObject> | StdObject): StdObject | Entity<StdObject>;
}
