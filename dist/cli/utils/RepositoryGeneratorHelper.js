export class RepositoryGeneratorHelper {
    static importsString = (entityName) => {
        return (`import { Repository } from "@lyra-js/core"\n\n` +
            `import { ${entityName} } from "@entity/${entityName}"\n\n`);
    };
    static constructorString = (entityName) => {
        return `  constructor() {` + `\n` + `    super(${entityName})` + `\n` + `  }` + `\n`;
    };
    static exportString = (entityName) => {
        return `export const ${entityName.toLowerCase()}Repository = new ${entityName}Repository()` + `\n`;
    };
    static getFullRepositoryCode(entityName) {
        let entityCodeContent = ``;
        entityCodeContent += this.importsString(entityName);
        entityCodeContent += `export class ${entityName}Repository extends Repository<${entityName}> {`;
        entityCodeContent += `\n`;
        entityCodeContent += this.constructorString(entityName);
        entityCodeContent += `}` + `\n`;
        entityCodeContent += this.exportString(entityName);
        return entityCodeContent;
    }
}
//# sourceMappingURL=RepositoryGeneratorHelper.js.map