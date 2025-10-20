import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import { EntityGeneratorHelper, onDeleteChoices, RepositoryGeneratorHelper, sqlTypeChoices } from "../../cli/utils/index.js";
import { ConsoleInputValidator } from "../../cli/utils/ConsoleInputValidator.js";
import { LyraConsole } from "../../orm/index.js";
export class GenerateEntityCommand {
    async execute() {
        const { entityName } = await inquirer.prompt([
            {
                type: "input",
                name: "entityName",
                message: "Entity name (ie: Fruit, FruitType) ?",
                validate: (input) => ConsoleInputValidator.isEntityNameValid(input)
            }
        ]);
        const properties = [];
        let addMore = true;
        while (addMore) {
            const { propName } = await inquirer.prompt([
                {
                    type: "input",
                    name: "propName",
                    message: "Property name (ie: banana, banana_color ) ?",
                    validate: (input) => ConsoleInputValidator.isPropertyNameValid(input)
                }
            ]);
            const { propType } = await inquirer.prompt([
                {
                    type: "list",
                    name: "propType",
                    message: `SQL datatype of "${propName}" ?`,
                    choices: sqlTypeChoices
                }
            ]);
            let references;
            let onDelete;
            if (propType === "relation") {
                const entityFolder = path.join(process.cwd(), "src", "entity");
                const existingEntities = [];
                fs.readdirSync(entityFolder).forEach((file) => {
                    existingEntities.push(file.replace(".ts", "").toLowerCase());
                });
                const relation = await inquirer.prompt([
                    {
                        type: "list",
                        name: "relatedEntity",
                        message: "Related entity ?",
                        choices: existingEntities
                    },
                    {
                        type: "list",
                        name: "onDelete",
                        message: "What to do on related entity delete ?",
                        choices: onDeleteChoices,
                        default: "CASCADE"
                    }
                ]);
                references = relation.relatedEntity;
                onDelete = relation.onDelete;
            }
            let size = null;
            if (propType === "varchar") {
                const { varcharLength } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "varcharLength",
                        message: "Varchar max length ?",
                        default: "255",
                        validate: (input) => ConsoleInputValidator.isVarcharLengthValid(input)
                    }
                ]);
                size = parseInt(varcharLength);
            }
            const { nullable } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "nullable",
                    message: "Nullable ?",
                    default: false
                }
            ]);
            const { unique } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "unique",
                    message: "Unique ?",
                    default: false
                }
            ]);
            properties.push({
                name: propName,
                type: propType,
                size: size ?? undefined,
                nullable,
                unique,
                references,
                onDelete
            });
            const { more } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "more",
                    message: "Add an other property ?",
                    default: false
                }
            ]);
            addMore = more;
        }
        const entity = entityName.charAt(0).toUpperCase() + entityName.slice(1);
        const entityFileContent = this.generateEntityFile(entity, properties);
        const repositoryFileContent = this.generateRepositoryFile(entity);
        const entityFilePath = path.join(process.cwd(), "src", "entity", `${entity}.ts`);
        const repositoryFilePath = path.join(process.cwd(), "src", "repository", `${entity}Repository.ts`);
        fs.writeFileSync(entityFilePath, entityFileContent);
        fs.writeFileSync(repositoryFilePath, repositoryFileContent);
        LyraConsole.success(`Entity and repository generated!`, `Entity file at: ${entityFilePath}`, `Repository file at: ${repositoryFilePath}`, "", "You can create a controller for this entity using the 'make:controller' command");
    }
    generateEntityFile(entityName, properties) {
        return EntityGeneratorHelper.getFullEntityCode(entityName, properties);
    }
    generateRepositoryFile(entityName) {
        return RepositoryGeneratorHelper.getFullRepositoryCode(entityName);
    }
}
//# sourceMappingURL=GenerateEntityCommand.js.map