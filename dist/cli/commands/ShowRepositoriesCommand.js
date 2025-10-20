import fs from "fs";
import path from "path";
import { LyraConsole } from "../../orm/index.js";
export class ShowRepositoriesCommand {
    async execute() {
        const repositoryFolder = path.join(process.cwd(), "src", "repository");
        const repositories = ["REPOSITORIES"];
        fs.readdirSync(repositoryFolder).forEach((file) => {
            const repository = file.replace(".ts", "");
            repositories.push(`\u27A5  ${repository} \u0040 /src/repository/${file}`);
        });
        LyraConsole.success(...repositories);
    }
}
//# sourceMappingURL=ShowRepositoriesCommand.js.map