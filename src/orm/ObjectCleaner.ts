import { Entity } from "@/core/orm/Entity"
import { StdObject } from "@/core/types"

export class ObjectCleaner {
  public static removeId(obj: Entity<StdObject> | StdObject) {
    if ((obj as { id?: number }).id) delete (obj as { id?: number }).id
    return obj
  }

  public static removeMethods(obj: Entity<StdObject> | StdObject) {
    Object.keys(obj as StdObject).forEach((key: string) => {
      if (typeof (obj as StdObject)[key] === "function") delete (obj as StdObject)[key]
    })

    return obj
  }
}
