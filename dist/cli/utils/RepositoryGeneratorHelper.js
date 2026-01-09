/**
 * RepositoryGeneratorHelper class
 * Generates repository class code for entities
 * Creates repository files that extend the base Repository class
 */
export class RepositoryGeneratorHelper {
    /**
     * Generates complete repository file code
     * @param {string} entityName - Name of the entity
     * @returns {string} - Complete repository code
     * @example
     * // Generate repository for User entity
     * const code = RepositoryGeneratorHelper.getFullRepositoryCode('User')
     */
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
/**
 * Generates import statements for repository file
 * @param {string} entityName - Name of the entity
 * @returns {string} - Import statements code
 */
RepositoryGeneratorHelper.importsString = (entityName) => {
    return (`import { Repository } from "@lyra-js/core"\n\n` +
        `import { ${entityName} } from "@entity/${entityName}"\n\n`);
};
/**
 * Generates constructor code for repository class
 * @param {string} entityName - Name of the entity
 * @returns {string} - Constructor code
 */
RepositoryGeneratorHelper.constructorString = (entityName) => {
    return `  constructor() {` + `\n` + `    super(${entityName})` + `\n` + `  }` + `\n`;
};
/**
 * Generates export statement for repository instance
 * @param {string} entityName - Name of the entity
 * @returns {string} - Export statement code
 */
RepositoryGeneratorHelper.exportString = (entityName) => {
    return `export const ${entityName.toLowerCase()}Repository = new ${entityName}Repository()` + `\n`;
};
//# sourceMappingURL=RepositoryGeneratorHelper.js.map