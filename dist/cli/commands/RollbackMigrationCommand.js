import { db, LyraConsole } from "../../orm/index.js";
import { MigrationExecutor } from "../../orm/migration/index.js";
/**
 * RollbackMigrationCommand class
 * Rolls back migrations to a specific version or by steps
 * Uses the new TypeScript-based migration system
 *
 * Usage:
 *   maestro migration:rollback                    (rollback last batch)
 *   maestro migration:rollback --steps=2          (rollback 2 batches)
 *   maestro migration:rollback --version=123456   (rollback to specific version)
 */
export class RollbackMigrationCommand {
    /**
     * Executes the rollback migration command
     * Parses args for --version or --steps flags
     * @param {string[]} args - Command-line arguments
     * @returns {Promise<void>}
     */
    async execute(args = []) {
        try {
            const executor = new MigrationExecutor(db);
            // Parse arguments
            const versionArg = args.find(arg => arg.startsWith('--version='));
            const stepsArg = args.find(arg => arg.startsWith('--steps='));
            if (versionArg) {
                // Rollback to specific version
                const version = versionArg.split('=')[1];
                if (!version) {
                    throw new Error('Please provide a version number: --version=<VERSION>');
                }
                await executor.rollbackToVersion(version);
            }
            else if (stepsArg) {
                // Rollback by steps
                const steps = parseInt(stepsArg.split('=')[1]);
                if (isNaN(steps) || steps < 1) {
                    throw new Error('Please provide a valid number of steps: --steps=<NUMBER>');
                }
                await executor.rollback(steps);
            }
            else {
                // Default: rollback last batch
                await executor.rollback(1);
            }
            LyraConsole.success("Migrations rolled back successfully");
        }
        catch (error) {
            LyraConsole.error(`Migration rollback failed: ${error.message}`);
            throw error;
        }
    }
}
//# sourceMappingURL=RollbackMigrationCommand.js.map