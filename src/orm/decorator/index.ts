import "reflect-metadata"

import { ColumnType } from "@/core/orm"

export function Table() {
  return (target: { name: string }) => {
    const tableName = Reflect.getMetadata("entity:table", target) || target.name.toLowerCase()
    Reflect.defineMetadata("entity:table", tableName, target)
  }
}

export function Column(config: ColumnType) {
  return (target: object, propertyKey: string) => {
    const columns = Reflect.getMetadata("entity:columns", target) ?? []
    columns.push({ name: propertyKey, ...config })
    Reflect.defineMetadata("entity:columns", columns, target)
  }
}

/**
 * Relation decorator for non-persisted relation properties
 * Defines relationship metadata for use with with() and withAll() methods
 * @param config - Relation configuration
 * @example
 * // ManyToMany
 * @Relation({ type: "manyToMany", entity: "Tag", through: "PostTag", foreignKey: "post", targetKey: "tag" })
 * tags: Tag[] = []
 *
 * // ManyToOne
 * @Relation({ type: "manyToOne", entity: "Category", foreignKey: "category_id" })
 * category: Category | null = null
 *
 * // OneToMany
 * @Relation({ type: "oneToMany", entity: "Post", foreignKey: "category_id" })
 * posts: Post[] = []
 */
export function Relation(config: {
  type: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany"
  entity: string
  foreignKey?: string
  // ManyToMany specific
  through?: string
  targetKey?: string
}) {
  return (target: object, propertyKey: string) => {
    const relations = Reflect.getMetadata("entity:relations", target) ?? {}
    relations[propertyKey] = config
    Reflect.defineMetadata("entity:relations", relations, target)
  }
}
