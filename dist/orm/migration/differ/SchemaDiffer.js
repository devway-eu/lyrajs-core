import { SchemaDiffResult } from '../interfaces/DatabaseSchema.js';
import { RenameDetector } from '../detector/RenameDetector.js';
/**
 * SchemaDiffer
 * Compares two database schemas and generates a diff
 * Detects table/column additions, modifications, and removals
 */
export class SchemaDiffer {
    constructor() {
        this.renameDetector = new RenameDetector();
    }
    /**
     * Compare current and desired schemas
     */
    diff(current, desired) {
        const result = new SchemaDiffResult();
        // Tables
        result.tablesToCreate = this.findNewTables(current, desired);
        result.tablesToDrop = this.findRemovedTables(current, desired);
        result.tablesToRename = this.detectTableRenames(current, desired);
        // Columns (only for existing tables)
        const commonTables = this.getCommonTables(current, desired);
        for (const tableName of commonTables) {
            const currentTable = current.getTable(tableName);
            const desiredTable = desired.getTable(tableName);
            // Get columns to add and remove
            const columnsToAdd = this.findNewColumns(currentTable, desiredTable);
            const columnsToRemove = this.findRemovedColumns(currentTable, desiredTable);
            // Detect potential column renames
            const removedColumnDefs = columnsToRemove
                .map(colName => currentTable.columns.find(c => c.name === colName))
                .filter(col => col !== undefined);
            const columnRenames = this.renameDetector.detectColumnRenames(tableName, removedColumnDefs, columnsToAdd);
            result.columnsToRename.push(...columnRenames);
            // Filter out detected renames from additions and removals
            const renamedFrom = new Set(columnRenames.map(r => r.from));
            const renamedTo = new Set(columnRenames.map(r => r.to));
            const actualColumnsToAdd = columnsToAdd.filter(col => !renamedTo.has(col.name));
            const actualColumnsToRemove = columnsToRemove.filter(colName => !renamedFrom.has(colName));
            // Column additions (excluding renamed columns)
            result.columnsToAdd.push(...actualColumnsToAdd.map(col => ({
                table: tableName,
                column: col
            })));
            // Column removals (excluding renamed columns)
            result.columnsToRemove.push(...actualColumnsToRemove.map(colName => ({
                table: tableName,
                column: colName
            })));
            // Column modifications
            const columnsToModify = this.findModifiedColumns(currentTable, desiredTable);
            result.columnsToModify.push(...columnsToModify.map(change => ({
                table: tableName,
                ...change
            })));
            // Indexes
            const indexesToAdd = this.findNewIndexes(currentTable, desiredTable);
            result.indexesToAdd.push(...indexesToAdd.map(idx => ({
                table: tableName,
                index: idx
            })));
            const indexesToRemove = this.findRemovedIndexes(currentTable, desiredTable);
            result.indexesToRemove.push(...indexesToRemove.map(idxName => ({
                table: tableName,
                index: idxName
            })));
            // Foreign keys
            const foreignKeysToAdd = this.findNewForeignKeys(currentTable, desiredTable);
            result.foreignKeysToAdd.push(...foreignKeysToAdd.map(fk => ({
                table: tableName,
                foreignKey: fk
            })));
            const foreignKeysToRemove = this.findRemovedForeignKeys(currentTable, desiredTable);
            result.foreignKeysToRemove.push(...foreignKeysToRemove.map(fkName => ({
                table: tableName,
                foreignKey: fkName
            })));
        }
        return result;
    }
    /**
     * Find tables that exist in desired but not in current
     */
    findNewTables(current, desired) {
        const currentNames = new Set(current.getTableNames());
        return desired.getTables().filter(t => !currentNames.has(t.name));
    }
    /**
     * Find tables that exist in current but not in desired
     */
    findRemovedTables(current, desired) {
        const desiredNames = new Set(desired.getTableNames());
        return current.getTableNames()
            .filter(name => name != null && name !== '') // Filter out undefined/empty names
            .filter(name => !desiredNames.has(name));
    }
    /**
     * Detect potential table renames using similarity
     */
    detectTableRenames(current, desired) {
        const removedTables = this.findNewTables(desired, current); // Tables in current but not desired
        const addedTables = this.findNewTables(current, desired); // Tables in desired but not current
        return this.renameDetector.detectTableRenames(removedTables, addedTables);
    }
    /**
     * Get tables that exist in both schemas
     */
    getCommonTables(current, desired) {
        const currentNames = new Set(current.getTableNames());
        return desired.getTableNames().filter(name => currentNames.has(name));
    }
    /**
     * Find new columns in a table
     */
    findNewColumns(currentTable, desiredTable) {
        const currentColNames = new Set(currentTable.columns.map(c => c.name));
        return desiredTable.columns.filter(c => !currentColNames.has(c.name));
    }
    /**
     * Find removed columns from a table
     */
    findRemovedColumns(currentTable, desiredTable) {
        const desiredColNames = new Set(desiredTable.columns.map(c => c.name));
        return currentTable.columns
            .filter(c => !desiredColNames.has(c.name))
            .map(c => c.name);
    }
    /**
     * Find modified columns (type, nullable, default changes)
     */
    findModifiedColumns(currentTable, desiredTable) {
        const changes = [];
        for (const desiredCol of desiredTable.columns) {
            const currentCol = currentTable.columns.find(c => c.name === desiredCol.name);
            if (!currentCol)
                continue;
            // Type change
            if (this.normalizeType(currentCol.type) !== this.normalizeType(desiredCol.type) ||
                currentCol.length !== desiredCol.length) {
                changes.push({
                    column: desiredCol.name,
                    changeType: 'TYPE_CHANGE',
                    from: `${currentCol.type}${currentCol.length ? `(${currentCol.length})` : ''}`,
                    to: `${desiredCol.type}${desiredCol.length ? `(${desiredCol.length})` : ''}`
                });
            }
            // Nullable change
            if (currentCol.nullable !== desiredCol.nullable) {
                changes.push({
                    column: desiredCol.name,
                    changeType: 'NULLABLE_CHANGE',
                    from: currentCol.nullable,
                    to: desiredCol.nullable
                });
            }
            // Default value change
            if (currentCol.default !== desiredCol.default) {
                changes.push({
                    column: desiredCol.name,
                    changeType: 'DEFAULT_CHANGE',
                    from: currentCol.default,
                    to: desiredCol.default
                });
            }
        }
        return changes;
    }
    /**
     * Find new indexes
     */
    findNewIndexes(currentTable, desiredTable) {
        const currentIndexNames = new Set(currentTable.indexes.map(i => i.name));
        return desiredTable.indexes.filter(i => !currentIndexNames.has(i.name));
    }
    /**
     * Find removed indexes
     */
    findRemovedIndexes(currentTable, desiredTable) {
        const desiredIndexNames = new Set(desiredTable.indexes.map(i => i.name));
        return currentTable.indexes
            .filter(i => i.name != null && i.name !== '') // Filter out undefined/null/empty names
            .filter(i => !desiredIndexNames.has(i.name))
            .map(i => i.name);
    }
    /**
     * Find new foreign keys
     */
    findNewForeignKeys(currentTable, desiredTable) {
        const currentFkNames = new Set(currentTable.foreignKeys.map(fk => fk.name));
        return desiredTable.foreignKeys.filter(fk => !currentFkNames.has(fk.name));
    }
    /**
     * Find removed foreign keys
     */
    findRemovedForeignKeys(currentTable, desiredTable) {
        const desiredFkNames = new Set(desiredTable.foreignKeys.map(fk => fk.name));
        return currentTable.foreignKeys
            .filter(fk => fk.name != null && fk.name !== '') // Filter out undefined/null/empty names
            .filter(fk => !desiredFkNames.has(fk.name))
            .map(fk => fk.name);
    }
    /**
     * Normalize type names for comparison
     * Maps various type names to their canonical form
     */
    normalizeType(type) {
        const normalized = type.toLowerCase().trim();
        // Comprehensive type mapping for MySQL types
        const typeMap = {
            // Integer types
            'int': 'int',
            'integer': 'int',
            'tinyint': 'tinyint',
            'smallint': 'smallint',
            'mediumint': 'mediumint',
            'bigint': 'bigint',
            // Boolean
            'bool': 'tinyint',
            'boolean': 'tinyint',
            // String types
            'varchar': 'varchar',
            'char': 'char',
            'text': 'text',
            'tinytext': 'tinytext',
            'mediumtext': 'mediumtext',
            'longtext': 'longtext',
            // Decimal types
            'float': 'float',
            'double': 'double',
            'decimal': 'decimal',
            // Date/Time types
            'date': 'date',
            'time': 'time',
            'datetime': 'datetime',
            'timestamp': 'timestamp',
            'year': 'year',
            // Binary types
            'blob': 'blob',
            'tinyblob': 'tinyblob',
            'mediumblob': 'mediumblob',
            'longblob': 'longblob',
            // JSON
            'json': 'json',
            // Enum
            'enum': 'enum'
        };
        return typeMap[normalized] || normalized;
    }
    /**
     * Calculate Levenshtein distance for similarity detection
     */
    calculateSimilarity(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str1.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str2.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        const maxLen = Math.max(str1.length, str2.length);
        return maxLen === 0 ? 1 : 1 - matrix[str1.length][str2.length] / maxLen;
    }
}
//# sourceMappingURL=SchemaDiffer.js.map