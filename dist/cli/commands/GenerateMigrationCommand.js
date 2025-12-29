import { LyraConsole } from "../../console/LyraConsole.js";
import { MigrationGeneratorHelper } from "../utils/index.js";
export class GenerateMigrationCommand {
    async execute() {
        const migrator = new MigrationGeneratorHelper();
        const queries = await migrator.buildCreateTableQueries();
        migrator.generateMigrationFile(queries);
        LyraConsole.success("Migration created", "");
    }
}
//# sourceMappingURL=GenerateMigrationCommand.js.map