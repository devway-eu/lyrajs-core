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
