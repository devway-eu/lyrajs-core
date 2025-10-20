import { ColumnType } from "@/core/orm"

export class EntityGeneratorHelper {
  static starts = {
    table: "@Table(",
    column: "@Column({ "
  }
  static ends = {
    table: ")",
    column: " })"
  }

  static importsString = () => {
    return `import { Column, Entity, Table } from "@lyrajs/core"\n\n`
  }

  static tableDecorator = () => {
    return this.starts.table + this.ends.table + "\n"
  }

  static constructorString = (entityName: string) => {
    return (
      `  constructor(${entityName.toLowerCase()}?: Partial<${entityName}> | ${entityName}) {` +
      `\n` +
      `    super(${entityName.toLowerCase()})` +
      `\n` +
      `  }` +
      `\n`
    )
  }

  static columnDecorator = (property: ColumnType) => {
    let decoratorString = "  " + this.starts.column
    decoratorString += `type: "${property.type === "relation" ? "bigint" : property.type}"`
    decoratorString += property.size ? `, size: ${property.size}` : ``
    decoratorString += property.pk ? `, pk: true` : ``
    decoratorString += property.references ? `, fk: true, references: "${property.references}.id"` : ``
    decoratorString += property.onDelete ? `, onDelete: "${property.onDelete}"` : ``
    decoratorString += property.nullable ? `, nullable: true` : ``
    decoratorString += property.unique ? `, unique: true` : ``
    decoratorString += property.default ? `, default: ${property.default}` : ``
    decoratorString += this.ends.column
    return decoratorString
  }

  static propertyString = (property: ColumnType) => {
    let propertyString = "  " + property.name + ": "
    switch (property.type.toLowerCase()) {
      case "date":
      case "time":
      case "year":
      case "datetime":
      case "timestamp":
        propertyString +=
          `string | Date` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = new Date()`)
        break
      case "tinyint":
      case "smallint":
      case "mediumint":
      case "int":
      case "integer":
      case "bigint":
      case "float":
      case "double":
      case "decimal":
        propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        break
      case "char":
      case "varchar":
      case "tinytext":
      case "text":
      case "mediumtext":
      case "longtext":
      case "json":
      case "tinyblob":
      case "blob":
      case "mediumblob":
      case "longblob":
        propertyString += `string` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        break
      case "bool":
        propertyString +=
          `boolean` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ` = false`)
        break
      case "relation":
        propertyString += `number` + (property.nullable ? ` | null` : ``) + (property.nullable ? ` = null` : ``)
        break
    }
    return propertyString
  }

  static propertyWithDecorator = (property: ColumnType) => {
    return this.columnDecorator(property) + "\n" + this.propertyString(property) + "\n"
  }

  static getFullEntityCode(entityName: string, properties: ColumnType[]) {
    let entityCodeContent = ``

    entityCodeContent += this.importsString()
    entityCodeContent += this.tableDecorator()

    entityCodeContent += `export class ${entityName} extends Entity<${entityName}> {` + "\n"

    entityCodeContent += this.propertyWithDecorator({
      name: "id",
      type: "bigint",
      nullable: false,
      unique: false,
      pk: true
    })

    for (const prop of properties) {
      entityCodeContent += this.propertyWithDecorator(prop)
    }

    entityCodeContent += `\n`

    entityCodeContent += this.constructorString(entityName)

    entityCodeContent += `}` + `\n`

    return entityCodeContent
  }
}
