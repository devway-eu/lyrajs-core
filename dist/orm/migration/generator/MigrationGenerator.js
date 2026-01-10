import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as readline from "node:readline";
import { LyraConsole } from '../../../console/LyraConsole.js';
import { EntitySchemaBuilder } from '../builder/EntitySchemaBuilder.js';
import { SchemaIntrospector } from '../introspector/SchemaIntrospector.js';
import { SchemaDiffer } from '../differ/SchemaDiffer.js';
/**
 * MigrationGenerator
 * Generates TypeScript migration files based on entity changes
 */
export class MigrationGenerator {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Generate a new migration file
     */
    async generate(options = {}) {
        LyraConsole.info("\u2699 Analyzing schema changes..."); // ⚙ Gear symbol
        // 1. Build desired schema from entities
        const entityBuilder = new EntitySchemaBuilder();
        const desiredSchema = await entityBuilder.buildSchemaFromEntities();
        // 2. Get current schema from database
        const introspector = new SchemaIntrospector(this.connection);
        // Initialize migration tables if they don't exist
        const tablesExist = await introspector.migrationTablesExist();
        if (!tablesExist) {
            LyraConsole.info("\u2699 Initializing migration tracking tables..."); // ⚙ Gear symbol
            await introspector.initializeMigrationTables();
            LyraConsole.success("\u2713 Migration tables created successfully"); // ✓ Check mark
        }
        const currentSchema = await introspector.getCurrentSchema();
        // 3. Diff the schemas
        const differ = new SchemaDiffer();
        const diff = differ.diff(currentSchema, desiredSchema);
        // 4. Prompt user to confirm detected renames
        await this.promptForRenameConfirmation(diff);
        // 5. Check if there are any changes
        if (diff.isEmpty()) {
            LyraConsole.success("\u2713 No schema changes detected - entities match database"); // ✓ Check mark
            return;
        }
        // 6. Generate migration class
        const timestamp = Date.now();
        const className = `Migration_${timestamp}`;
        const migrationContent = this.buildMigrationClass(className, timestamp, diff);
        // 6. Write migration file
        const migrationDir = path.join(process.cwd(), 'migrations');
        if (!fs.existsSync(migrationDir)) {
            fs.mkdirSync(migrationDir, { recursive: true });
        }
        const filename = `${className}.ts`;
        const filepath = path.join(migrationDir, filename);
        fs.writeFileSync(filepath, migrationContent);
        // 7. Show summary
        LyraConsole.success(`\u2713 Migration created: ${filename}`); // ✓ Check mark
        this.printDiffSummary(diff);
    }
    /**
     * Prompt user to confirm detected renames
     * Returns the confirmed renames and updates diff to remove false positives
     */
    async promptForRenameConfirmation(diff) {
        const CYAN = '\x1b[36m';
        const YELLOW = '\x1b[33m';
        const GREEN = '\x1b[32m';
        const RESET = '\x1b[0m';
        const BOLD = '\x1b[1m';
        // Check if there are any detected renames
        if (diff.columnsToRename.length === 0 && diff.tablesToRename.length === 0) {
            return;
        }
        console.log(`\n${CYAN}${BOLD}🔍 Potential Renames Detected${RESET}`);
        console.log(`${YELLOW}Review the following potential renames and confirm whether they are actual renames or separate drop/create operations.${RESET}\n`);
        const confirmedColumnRenames = [];
        const confirmedTableRenames = [];
        // Prompt for column renames
        for (const rename of diff.columnsToRename) {
            const confidencePercent = Math.round(rename.confidence * 100);
            const confidenceTag = rename.confidence >= 0.8 ? `${GREEN}HIGH` : `${YELLOW}MEDIUM`;
            console.log(`${CYAN}Column Rename Detected:${RESET}`);
            console.log(`  Table: ${rename.table}`);
            console.log(`  From: ${rename.from} → To: ${rename.to}`);
            console.log(`  Confidence: ${confidenceTag} (${confidencePercent}%)${RESET}`);
            const isRename = await this.askYesNo(`  Is this a rename? (y/n): `);
            if (isRename) {
                confirmedColumnRenames.push(rename);
                console.log(`  ${GREEN}✓ Confirmed as rename${RESET}\n`);
            }
            else {
                console.log(`  ${YELLOW}✗ Treating as drop + create${RESET}\n`);
            }
        }
        // Prompt for table renames
        for (const rename of diff.tablesToRename) {
            console.log(`${CYAN}Table Rename Detected:${RESET}`);
            console.log(`  From: ${rename.from} → To: ${rename.to}`);
            const isRename = await this.askYesNo(`  Is this a rename? (y/n): `);
            if (isRename) {
                confirmedTableRenames.push(rename);
                console.log(`  ${GREEN}✓ Confirmed as rename${RESET}\n`);
            }
            else {
                console.log(`  ${YELLOW}✗ Treating as drop + create${RESET}\n`);
            }
        }
        // Update diff with only confirmed renames
        diff.columnsToRename = confirmedColumnRenames;
        // For rejected column renames, add back to columnsToAdd and columnsToRemove
        const rejectedColumnRenames = diff.columnsToRename.filter(r => !confirmedColumnRenames.find(c => c.table === r.table && c.from === r.from));
        for (const rejected of rejectedColumnRenames) {
            // Add back to removals
            diff.columnsToRemove.push({
                table: rejected.table,
                column: rejected.from
            });
            // Note: The column should already be in columnsToAdd from the original detection
        }
        diff.tablesToRename = confirmedTableRenames;
    }
    /**
     * Helper to ask yes/no questions
     */
    async askYesNo(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise(resolve => {
            rl.question(question, answer => {
                rl.close();
                const normalized = answer.trim().toLowerCase();
                resolve(normalized === "y" || normalized === "yes");
            });
        });
    }
    /**
     * Build the TypeScript migration class content using string concatenation
     */
    buildMigrationClass(className, timestamp, diff) {
        let content = ``;
        // Import statement
        content += `import { MigrationInterface } from "@lyra-js/core"\n\n`;
        // Class documentation
        content += `/**\n`;
        content += ` * Generated migration: ${className}\n`;
        content += ` * Generated at: ${new Date(timestamp).toISOString()}\n`;
        content += ` */\n`;
        // Class declaration
        content += `export class ${className} implements MigrationInterface {\n`;
        content += `  readonly version = "${timestamp}"\n`;
        content += `  readonly isDestructive = ${diff.isDestructive()}\n`;
        content += `  readonly canRunInParallel = true\n\n`;
        // up() method
        content += `  async up(connection: any): Promise<void> {\n`;
        content += this.generateUpSQL(diff);
        content += `  }\n\n`;
        // down() method
        content += `  async down(connection: any): Promise<void> {\n`;
        content += this.generateDownSQL(diff);
        content += `  }\n\n`;
        // dryRun() method
        content += `  async dryRun(connection: any): Promise<string[]> {\n`;
        content += `    return [\n`;
        content += this.generateDryRunSQL(diff);
        content += `    ]\n`;
        content += `  }\n`;
        content += `}\n`;
        return content;
    }
    /**
     * Generate UP migration SQL
     */
    generateUpSQL(diff) {
        let sql = ``;
        // 1. Rename tables (must happen first to preserve data)
        for (const tableRename of diff.tablesToRename) {
            sql += `    await connection.query(\`RENAME TABLE \\\`${tableRename.from}\\\` TO \\\`${tableRename.to}\\\`\`)\n`;
        }
        // 2. Rename columns (before other operations)
        for (const colRename of diff.columnsToRename) {
            const renameSQL = this.generateRenameColumnSQL(colRename);
            sql += `    ${renameSQL}\n`;
        }
        // 3. Drop foreign keys that will be removed
        for (const fkRemove of diff.foreignKeysToRemove) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${fkRemove.table}\\\` DROP FOREIGN KEY \\\`${fkRemove.foreignKey}\\\`\`)\n`;
        }
        // 4. Create new tables
        for (const table of diff.tablesToCreate) {
            const createSQL = this.generateCreateTableSQL(table);
            sql += `    await connection.query(\`${createSQL}\`)\n`;
        }
        // 5. Drop tables
        for (const tableName of diff.tablesToDrop) {
            sql += `    await connection.query(\`DROP TABLE IF EXISTS \\\`${tableName}\\\`\`)\n`;
        }
        // 6. Add columns
        for (const colAdd of diff.columnsToAdd) {
            const addSQL = this.generateAddColumnSQL(colAdd.table, colAdd.column);
            sql += `    await connection.query(\`${addSQL}\`)\n`;
        }
        // 7. Modify columns - group by table and column to generate single MODIFY statement
        const columnModifications = new Map();
        for (const colMod of diff.columnsToModify) {
            if (!columnModifications.has(colMod.table)) {
                columnModifications.set(colMod.table, new Map());
            }
            const tableModifications = columnModifications.get(colMod.table);
            if (!tableModifications.has(colMod.column)) {
                tableModifications.set(colMod.column, []);
            }
            tableModifications.get(colMod.column).push(colMod);
        }
        // Generate MODIFY statements (skip for now - needs full column definition)
        // TODO: Implement proper MODIFY COLUMN with complete column definition
        // 8. Remove columns
        for (const colRemove of diff.columnsToRemove) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${colRemove.table}\\\` DROP COLUMN \\\`${colRemove.column}\\\`\`)\n`;
        }
        // 9. Add indexes
        for (const idxAdd of diff.indexesToAdd) {
            const idxSQL = this.generateAddIndexSQL(idxAdd.table, idxAdd.index);
            sql += `    await connection.query(\`${idxSQL}\`)\n`;
        }
        // 10. Remove indexes
        for (const idxRemove of diff.indexesToRemove) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${idxRemove.table}\\\` DROP INDEX \\\`${idxRemove.index}\\\`\`)\n`;
        }
        // 11. Add foreign keys
        for (const fkAdd of diff.foreignKeysToAdd) {
            const fkSQL = this.generateAddForeignKeySQL(fkAdd.table, fkAdd.foreignKey);
            sql += `    await connection.query(\`${fkSQL}\`)\n`;
        }
        if (sql === ``) {
            sql = `    // No changes\n`;
        }
        return sql;
    }
    /**
     * Generate DOWN migration SQL (reverse operations)
     */
    generateDownSQL(diff) {
        let sql = ``;
        // Reverse order: remove FKs, remove indexes, restore columns, restore tables, reverse renames
        // 1. Drop foreign keys that were added
        for (const fkAdd of diff.foreignKeysToAdd) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${fkAdd.table}\\\` DROP FOREIGN KEY \\\`${fkAdd.foreignKey.name}\\\`\`)\n`;
        }
        // 2. Drop indexes that were added
        for (const idxAdd of diff.indexesToAdd) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${idxAdd.table}\\\` DROP INDEX \\\`${idxAdd.index.name}\\\`\`)\n`;
        }
        // 3. Drop columns that were added
        for (const colAdd of diff.columnsToAdd) {
            sql += `    await connection.query(\`ALTER TABLE \\\`${colAdd.table}\\\` DROP COLUMN \\\`${colAdd.column.name}\\\`\`)\n`;
        }
        // 4. Reverse column renames (rename back)
        for (const colRename of diff.columnsToRename) {
            const reverseRename = {
                table: colRename.table,
                from: colRename.to,
                to: colRename.from,
                confidence: colRename.confidence
            };
            const renameSQL = this.generateRenameColumnSQL(reverseRename);
            sql += `    ${renameSQL}\n`;
        }
        // 5. Restore tables that were dropped
        for (const tableName of diff.tablesToDrop) {
            sql += `    // TODO: Restore table ${tableName} - requires backup\n`;
        }
        // 6. Drop tables that were created
        for (const table of diff.tablesToCreate) {
            sql += `    await connection.query(\`DROP TABLE IF EXISTS \\\`${table.name}\\\`\`)\n`;
        }
        // 7. Reverse table renames
        for (const tableRename of diff.tablesToRename) {
            sql += `    await connection.query(\`RENAME TABLE \\\`${tableRename.to}\\\` TO \\\`${tableRename.from}\\\`\`)\n`;
        }
        if (sql === ``) {
            sql = `    // No changes\n`;
        }
        return sql;
    }
    /**
     * Generate dry run SQL preview
     */
    generateDryRunSQL(diff) {
        let sql = ``;
        for (const table of diff.tablesToCreate) {
            const createSQL = this.generateCreateTableSQL(table).replace(/"/g, '\\"');
            sql += `      "${createSQL}",\n`;
        }
        for (const colAdd of diff.columnsToAdd) {
            const addSQL = this.generateAddColumnSQL(colAdd.table, colAdd.column).replace(/"/g, '\\"');
            sql += `      "${addSQL}",\n`;
        }
        // Remove trailing comma and newline
        if (sql.endsWith(',\n')) {
            sql = sql.slice(0, -2) + '\n';
        }
        return sql;
    }
    /**
     * Generate CREATE TABLE SQL
     */
    generateCreateTableSQL(table) {
        let sql = `CREATE TABLE IF NOT EXISTS \\\`${table.name}\\\` (`;
        const columnDefs = [];
        // Add columns
        for (const col of table.columns) {
            let colDef = `\\\`${col.name}\\\` ${col.type.toUpperCase()}`;
            if (col.length) {
                colDef += `(${col.length})`;
            }
            if (col.autoIncrement) {
                colDef += ' AUTO_INCREMENT';
            }
            if (!col.nullable) {
                colDef += ' NOT NULL';
            }
            if (col.unique) {
                colDef += ' UNIQUE';
            }
            if (col.default !== undefined && col.default !== null) {
                colDef += ` DEFAULT '${col.default}'`;
            }
            columnDefs.push(colDef);
        }
        sql += columnDefs.join(', ');
        // Add primary key
        const pk = table.columns.find(c => c.primary);
        if (pk) {
            sql += `, PRIMARY KEY (\\\`${pk.name}\\\`)`;
        }
        sql += ')';
        return sql;
    }
    /**
     * Generate ADD COLUMN SQL
     */
    generateAddColumnSQL(tableName, column) {
        let sql = `ALTER TABLE \\\`${tableName}\\\` ADD COLUMN \\\`${column.name}\\\` ${column.type.toUpperCase()}`;
        if (column.length) {
            sql += `(${column.length})`;
        }
        if (!column.nullable) {
            sql += ' NOT NULL';
        }
        if (column.default !== undefined && column.default !== null) {
            sql += ` DEFAULT '${column.default}'`;
        }
        return sql;
    }
    /**
     * Generate MODIFY COLUMN SQL
     */
    generateModifyColumnSQL(tableName, columnName, newType) {
        return `ALTER TABLE \\\`${tableName}\\\` MODIFY COLUMN \\\`${columnName}\\\` ${newType}`;
    }
    /**
     * Generate ADD INDEX SQL
     */
    generateAddIndexSQL(tableName, index) {
        const unique = index.unique ? 'UNIQUE ' : '';
        const columns = index.columns.map(c => `\\\`${c}\\\``).join(', ');
        return `ALTER TABLE \\\`${tableName}\\\` ADD ${unique}INDEX \\\`${index.name}\\\` (${columns})`;
    }
    /**
     * Generate ADD FOREIGN KEY SQL
     */
    generateAddForeignKeySQL(tableName, fk) {
        let sql = `ALTER TABLE \\\`${tableName}\\\` ADD CONSTRAINT \\\`${fk.name}\\\` `;
        sql += `FOREIGN KEY (\\\`${fk.column}\\\`) `;
        sql += `REFERENCES \\\`${fk.referencedTable}\\\` (\\\`${fk.referencedColumn}\\\`)`;
        if (fk.onUpdate && fk.onUpdate !== 'RESTRICT') {
            sql += ` ON UPDATE ${fk.onUpdate}`;
        }
        if (fk.onDelete && fk.onDelete !== 'RESTRICT') {
            sql += ` ON DELETE ${fk.onDelete}`;
        }
        return sql;
    }
    /**
     * Generate RENAME COLUMN SQL
     * Note: MySQL uses CHANGE COLUMN which requires the full column definition
     * For simplicity, we'll use a comment noting this needs the column type
     */
    generateRenameColumnSQL(rename) {
        // Note: In a real implementation, you'd need to fetch the column definition
        // For now, we'll use a TODO comment
        return `// TODO: Rename column \\\`${rename.table}\\\`.\\\`${rename.from}\\\` to \\\`${rename.to}\\\` - requires full column definition`;
    }
    /**
     * Print a summary of the diff
     */
    printDiffSummary(diff) {
        const GREEN = '\x1b[32m';
        const YELLOW = '\x1b[33m';
        const CYAN = '\x1b[36m';
        const RED = '\x1b[31m';
        const RESET = '\x1b[0m';
        console.log(`${CYAN}📊 Changes Summary:${RESET}`);
        if (diff.tablesToCreate.length > 0) {
            console.log(`  ${GREEN}✓ Tables to create: ${diff.tablesToCreate.length}${RESET}`);
            diff.tablesToCreate.forEach(t => console.log(`    ${GREEN}- ${t.name}${RESET}`));
        }
        if (diff.tablesToDrop.length > 0) {
            console.log(`  ${RED}⚠️  Tables to drop: ${diff.tablesToDrop.length}${RESET}`);
            diff.tablesToDrop.forEach(t => console.log(`    ${RED}- ${t}${RESET}`));
        }
        if (diff.tablesToRename.length > 0) {
            console.log(`  ${CYAN}✓ Tables to rename: ${diff.tablesToRename.length}${RESET}`);
            diff.tablesToRename.forEach(r => console.log(`    ${CYAN}- ${r.from} → ${r.to}${RESET}`));
        }
        if (diff.columnsToAdd.length > 0) {
            console.log(`  ${GREEN}✓ Columns to add: ${diff.columnsToAdd.length}${RESET}`);
        }
        if (diff.columnsToRemove.length > 0) {
            console.log(`  ${YELLOW}⚠️  Columns to remove: ${diff.columnsToRemove.length}${RESET}`);
        }
        if (diff.columnsToModify.length > 0) {
            console.log(`  ${CYAN}✓ Columns to modify: ${diff.columnsToModify.length}${RESET}`);
        }
        if (diff.columnsToRename.length > 0) {
            console.log(`  ${CYAN}✓ Columns to rename: ${diff.columnsToRename.length}${RESET}`);
            diff.columnsToRename.forEach(r => console.log(`    ${CYAN}- ${r.table}.${r.from} → ${r.to}${RESET}`));
        }
        if (diff.indexesToAdd.length > 0) {
            console.log(`  ${GREEN}✓ Indexes to add: ${diff.indexesToAdd.length}${RESET}`);
        }
        if (diff.foreignKeysToAdd.length > 0) {
            console.log(`  ${GREEN}✓ Foreign keys to add: ${diff.foreignKeysToAdd.length}${RESET}`);
        }
        console.log('');
    }
}
//# sourceMappingURL=MigrationGenerator.js.map