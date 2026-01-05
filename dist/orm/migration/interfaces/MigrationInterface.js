/**
 * Base migration class with helper methods
 */
export class BaseMigration {
    isDestructive = false;
    requiresBackup = false;
    autoRollbackOnError = true;
    dependsOn = [];
    conflictsWith = [];
    canRunInParallel = true;
    async dryRun(connection) {
        return [];
    }
    async validate(schema) {
        return { valid: true, errors: [] };
    }
}
//# sourceMappingURL=MigrationInterface.js.map