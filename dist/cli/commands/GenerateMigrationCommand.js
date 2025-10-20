import { LyraConsole } from "../../console/LyraConsole.js";
import { MigrationGeneratorHelper } from "../utils/index.js";
import { TmpManager } from "../../loader/index.js";
export class GenerateMigrationCommand {
    async execute() {
        await TmpManager.refreshTmpEntities();
        const migrator = new MigrationGeneratorHelper();
        const queries = await migrator.buildCreateTableQueries();
        migrator.generateMigrationFile(queries);
        LyraConsole.success("Migration created", "");
    }
}
//# sourceMappingURL=GenerateMigrationCommand.js.map