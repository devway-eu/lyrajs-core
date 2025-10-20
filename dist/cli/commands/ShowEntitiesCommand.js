import fs from "fs";
import path from "path";
import { LyraConsole } from "../../orm/index.js";
export class ShowEntitiesCommand {
    async execute() {
        const entityFolder = path.join(process.cwd(), "src", "entity");
        const entities = ["ENTITIES"];
        fs.readdirSync(entityFolder).forEach((file) => {
            const entity = file.replace(".ts", "");
            entities.push(`\u27A5  ${entity} \u0040 /src/entity/${file}`);
        });
        LyraConsole.success(...entities);
    }
}
//# sourceMappingURL=ShowEntitiesCommand.js.map