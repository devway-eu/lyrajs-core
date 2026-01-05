import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { LyraConsole } from "../../../console/LyraConsole.js";
import { SchemaIntrospector } from "../introspector/SchemaIntrospector.js";
/**
 * MigrationSquasher
 * Combines multiple migrations into a single squashed migration
 * Reduces migration count for fresh installations
 */
export class MigrationSquasher {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Squash migrations up to a specific version
     * Creates a baseline migration representing the current schema state
     */
    async squash(targetVersion) {
        LyraConsole.info("\u2699 Starting migration squashing process...");
        // 1. Get all executed migrations
        const [migrations] = await this.connection.query("SELECT * FROM migrations ORDER BY version ASC");
        if (migrations.length === 0) {
            LyraConsole.warn("\u26A0 No executed migrations to squash");
            return;
        }
        // 2. Determine target version (default to latest)
        const target = targetVersion || migrations[migrations.length - 1].version;
        const migrationsToSquash = migrations.filter((m) => m.version <= target && !m.squashed);
        if (migrationsToSquash.length === 0) {
            LyraConsole.warn("\u26A0 No migrations to squash (all already squashed or none before target)");
            return;
        }
        LyraConsole.info(`\u2699 Squashing ${migrationsToSquash.length} migrations up to version ${target}...`);
        // 3. Introspect current schema
        const introspector = new SchemaIntrospector(this.connection);
        const currentSchema = await introspector.getCurrentSchema();
        if (currentSchema.getTables().length === 0) {
            LyraConsole.error("\u2717 Cannot squash: No tables found in database");
            return;
        }
        // 4. Generate squashed migration file
        const timestamp = Date.now();
        const className = `SquashedMigration_${timestamp}`;
        const migrationContent = this.buildSquashedMigration(className, timestamp, currentSchema.getTables(), migrationsToSquash);
        // 5. Write squashed migration file
        const migrationDir = path.join(process.cwd(), "migrations");
        if (!fs.existsSync(migrationDir)) {
            fs.mkdirSync(migrationDir, { recursive: true });
        }
        const filename = `${className}.ts`;
        const filepath = path.join(migrationDir, filename);
        fs.writeFileSync(filepath, migrationContent);
        // 6. Mark old migrations as squashed
        const versions = migrationsToSquash.map((m) => m.version);
        await this.connection.query(`UPDATE migrations SET squashed = TRUE WHERE version IN (${versions.map(() => "?").join(",")})`, versions);
        LyraConsole.success("\u2713 Migration squashing completed", `Squashed migration: ${filename}`, `Migrations squashed: ${migrationsToSquash.length}`, `Version range: ${migrationsToSquash[0].version} to ${target}`);
    }
    /**
     * Build the squashed migration file content
     */
    buildSquashedMigration(className, timestamp, tables, squashedMigrations) {
        let content = "";
        // Import statement
        content += `import { MigrationInterface } from "@lyra-js/core"\n\n`;
        // Class documentation
        content += `/**\n`;
        content += ` * Squashed Migration: ${className}\n`;
        content += ` * Generated at: ${new Date(timestamp).toISOString()}\n`;
        content += ` *\n`;
        content += ` * This migration represents the combined state of ${squashedMigrations.length} migrations:\n`;
        content += ` * - From: ${squashedMigrations[0].version}\n`;
        content += ` * - To: ${squashedMigrations[squashedMigrations.length - 1].version}\n`;
        content += ` *\n`;
        content += ` * This is a baseline migration. Fresh installations should run this\n`;
        content += ` * instead of the individual squashed migrations.\n`;
        content += ` */\n`;
        // Class declaration
        content += `export class ${className} implements MigrationInterface {\n`;
        content += `  readonly version = "${timestamp}"\n`;
        content += `  readonly isDestructive = false\n`;
        content += `  readonly canRunInParallel = false\n`;
        content += `  readonly isSquashed = true\n\n`;
        // up() method - Create entire schema
        content += `  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n`;
        content += `  async up(connection: any): Promise<void> {\n`;
        content += this.generateSquashedUpSQL(tables);
        content += `  }\n\n`;
        // down() method - Drop all tables
        content += `  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n`;
        content += `  async down(connection: any): Promise<void> {\n`;
        content += this.generateSquashedDownSQL(tables);
        content += `  }\n\n`;
        // dryRun() method
        content += `  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n`;
        content += `  async dryRun(_connection: any): Promise<string[]> {\n`;
        content += `    return [\n`;
        content += this.generateSquashedDryRunSQL(tables);
        content += `    ]\n`;
        content += `  }\n`;
        content += `}\n`;
        return content;
    }
    /**
     * Generate UP SQL for squashed migration
     */
    generateSquashedUpSQL(tables) {
        let sql = "";
        for (const table of tables) {
            sql += `    // Create table: ${table.name}\n`;
            sql += `    await connection.query(\`${this.generateCreateTableSQL(table)}\`)\n\n`;
            // Add indexes
            for (const index of table.indexes) {
                if (index.name !== "PRIMARY") {
                    sql += `    await connection.query(\`${this.generateCreateIndexSQL(table.name, index)}\`)\n`;
                }
            }
            // Add foreign keys
            for (const fk of table.foreignKeys) {
                sql += `    await connection.query(\`${this.generateCreateForeignKeySQL(table.name, fk)}\`)\n`;
            }
            if (table.indexes.length > 0 || table.foreignKeys.length > 0) {
                sql += `\n`;
            }
        }
        if (sql === "") {
            sql = `    // No tables to create\n`;
        }
        return sql;
    }
    /**
     * Generate DOWN SQL for squashed migration
     */
    generateSquashedDownSQL(tables) {
        let sql = "";
        sql += `    // Disable foreign key checks\n`;
        sql += `    await connection.query("SET FOREIGN_KEY_CHECKS = 0")\n\n`;
        for (const table of tables) {
            sql += `    await connection.query(\`DROP TABLE IF EXISTS \\\`${table.name}\\\`\`)\n`;
        }
        sql += `\n    // Re-enable foreign key checks\n`;
        sql += `    await connection.query("SET FOREIGN_KEY_CHECKS = 1")\n`;
        return sql;
    }
    /**
     * Generate dry run SQL
     */
    generateSquashedDryRunSQL(tables) {
        let sql = "";
        for (const table of tables) {
            // Remove backslash escapes from backticks since we're using regular strings, not template literals
            const createSQL = this.generateCreateTableSQL(table)
                .replace(/\\`/g, "`")
                .replace(/"/g, '\\"');
            sql += `      "${createSQL}",\n`;
        }
        // Remove trailing comma
        if (sql.endsWith(",\n")) {
            sql = sql.slice(0, -2) + "\n";
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
                colDef += " AUTO_INCREMENT";
            }
            if (!col.nullable) {
                colDef += " NOT NULL";
            }
            if (col.unique && !col.primary) {
                colDef += " UNIQUE";
            }
            if (col.default !== undefined && col.default !== null) {
                colDef += ` DEFAULT '${col.default}'`;
            }
            columnDefs.push(colDef);
        }
        sql += columnDefs.join(", ");
        // Add primary key
        const pk = table.columns.find(c => c.primary);
        if (pk) {
            sql += `, PRIMARY KEY (\\\`${pk.name}\\\`)`;
        }
        sql += ")";
        return sql;
    }
    /**
     * Generate CREATE INDEX SQL
     */
    generateCreateIndexSQL(tableName, index) {
        const unique = index.unique ? "UNIQUE " : "";
        const columns = index.columns.map((c) => `\\\`${c}\\\``).join(", ");
        return `ALTER TABLE \\\`${tableName}\\\` ADD ${unique}INDEX \\\`${index.name}\\\` (${columns})`;
    }
    /**
     * Generate ADD FOREIGN KEY SQL
     */
    generateCreateForeignKeySQL(tableName, fk) {
        let sql = `ALTER TABLE \\\`${tableName}\\\` ADD CONSTRAINT \\\`${fk.name}\\\` `;
        sql += `FOREIGN KEY (\\\`${fk.column}\\\`) `;
        sql += `REFERENCES \\\`${fk.referencedTable}\\\` (\\\`${fk.referencedColumn}\\\`)`;
        if (fk.onUpdate && fk.onUpdate !== "RESTRICT") {
            sql += ` ON UPDATE ${fk.onUpdate}`;
        }
        if (fk.onDelete && fk.onDelete !== "RESTRICT") {
            sql += ` ON DELETE ${fk.onDelete}`;
        }
        return sql;
    }
}
//# sourceMappingURL=MigrationSquasher.js.map