/**
 * MigrationValidator
 * Validates migrations before execution for safety
 */
export class MigrationValidator {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Validate a migration before execution
     */
    async validate(migration, schema) {
        const warnings = [];
        const errors = [];
        const suggestions = [];
        // Run migration's own validation if it exists
        if (migration.validate) {
            const selfValidation = await migration.validate(schema);
            if (!selfValidation.valid) {
                errors.push(...selfValidation.errors);
            }
            if (selfValidation.warnings) {
                warnings.push(...selfValidation.warnings);
            }
        }
        // Analyze SQL for destructive operations if dryRun is available
        if (migration.dryRun) {
            const sql = await migration.dryRun(this.connection);
            for (const query of sql) {
                const upperQuery = query.toUpperCase();
                // Check for DROP TABLE operations
                if (upperQuery.includes('DROP TABLE')) {
                    warnings.push(`🚨 DESTRUCTIVE: Drops entire table - ALL DATA WILL BE LOST`);
                    if (!migration.requiresBackup) {
                        suggestions.push(`Consider setting requiresBackup=true for this migration`);
                    }
                }
                // Check for DROP COLUMN operations
                if (upperQuery.includes('DROP COLUMN')) {
                    warnings.push(`⚠️  Drops column - data in this column will be lost`);
                }
                // Check for NOT NULL without DEFAULT
                if (upperQuery.includes('NOT NULL') && !upperQuery.includes('DEFAULT')) {
                    const hasExistingData = await this.checkForExistingData(query);
                    if (hasExistingData) {
                        errors.push(`❌ Adding NOT NULL column without DEFAULT to table with existing data`);
                        suggestions.push(`Add a DEFAULT value or migrate data first`);
                    }
                }
                // Check for large table alterations
                if (upperQuery.includes('ALTER TABLE')) {
                    const tableName = this.extractTableName(query);
                    if (tableName) {
                        const rowCount = await this.getTableRowCount(tableName);
                        if (rowCount > 100000) {
                            warnings.push(`⚠️  Altering large table (${rowCount.toLocaleString()} rows) - may take a long time`);
                            suggestions.push(`Consider running this migration during low-traffic hours`);
                        }
                    }
                }
            }
        }
        // Check destructive flag
        if (migration.isDestructive && warnings.length === 0) {
            warnings.push(`⚠️  Migration is marked as destructive`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            canProceed: errors.length === 0,
            requiresConfirmation: warnings.length > 0
        };
    }
    /**
     * Check if table has existing data
     */
    async checkForExistingData(query) {
        var _a;
        try {
            const tableName = this.extractTableName(query);
            if (!tableName)
                return false;
            const result = await this.connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\` LIMIT 1`);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Extract table name from SQL query
     */
    extractTableName(query) {
        const match = query.match(/(?:TABLE|FROM|INTO|UPDATE)\s+`?(\w+)`?/i);
        return match ? match[1] : null;
    }
    /**
     * Get approximate row count for a table
     */
    async getTableRowCount(tableName) {
        var _a;
        try {
            const result = await this.connection.query(`
        SELECT TABLE_ROWS as rowCount
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      `, [tableName]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.rowCount) || 0;
        }
        catch (error) {
            return 0;
        }
    }
}
//# sourceMappingURL=MigrationValidator.js.map