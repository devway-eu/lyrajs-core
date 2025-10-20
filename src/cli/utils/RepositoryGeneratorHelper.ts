export class RepositoryGeneratorHelper {
  static importsString = (entityName: string) => {
    return (
      `import { Repository } from "@lyrajs/core"\n\n` +
      `import { ${entityName} } from "@entity/${entityName}"\n\n`
    )
  }

  static constructorString = (entityName: string) => {
    return `  constructor() {` + `\n` + `    super(${entityName})` + `\n` + `  }` + `\n`
  }

  static exportString = (entityName: string) => {
    return `export const ${entityName.toLowerCase()}Repository = new ${entityName}Repository()` + `\n`
  }

  static getFullRepositoryCode(entityName: string) {
    let entityCodeContent = ``

    entityCodeContent += this.importsString(entityName)

    entityCodeContent += `export class ${entityName}Repository extends Repository<${entityName}> {`

    entityCodeContent += `\n`

    entityCodeContent += this.constructorString(entityName)

    entityCodeContent += `}` + `\n`

    entityCodeContent += this.exportString(entityName)

    return entityCodeContent
  }
}
