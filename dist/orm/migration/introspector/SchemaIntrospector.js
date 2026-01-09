import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
/**
 * SchemaIntrospector
 * Introspects the current database schema using information_schema
 * MySQL-specific implementation
 */
export class SchemaIntrospector {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Get the complete current schema from the database
     */
    async getCurrentSchema() {
        const schema = new DatabaseSchema();
        // Get all tables
        const tables = await this.getTables();
        for (const tableName of tables) {
            const columns = await this.getColumns(tableName);
            const indexes = await this.getIndexes(tableName);
            const foreignKeys = await this.getForeignKeys(tableName);
            schema.addTable({
                name: tableName,
                columns,
                indexes,
                foreignKeys
            });
        }
        return schema;
    }
    /**
     * Get all table names in the current database
     */
    async getTables() {
        const result = await this.connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME NOT IN ('migrations', 'migration_lock')
      ORDER BY TABLE_NAME
    `);
        // Handle mysql2 result format [rows, fields]
        const rows = Array.isArray(result[0]) ? result[0] : result;
        // Filter out any undefined/null table names
        return rows
            .map((row) => row.TABLE_NAME)
            .filter((name) => name != null && name !== '');
    }
    /**
     * Get all columns for a specific table
     */
    async getColumns(tableName) {
        const result = await this.connection.query(`
      SELECT
        COLUMN_NAME as name,
        DATA_TYPE as type,
        CHARACTER_MAXIMUM_LENGTH as length,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_KEY as columnKey,
        EXTRA as extra,
        COLUMN_COMMENT as comment
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName]);
        // Handle mysql2 result format [rows, fields]
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows.map((row) => ({
            name: row.name,
            type: row.type ? row.type.toLowerCase() : 'varchar',
            length: row.length,
            nullable: row.nullable === 'YES',
            default: row.defaultValue,
            primary: row.columnKey === 'PRI',
            unique: row.columnKey === 'UNI',
            autoIncrement: row.extra ? row.extra.toLowerCase().includes('auto_increment') : false,
            comment: row.comment || ''
        }));
    }
    /**
     * Get all indexes for a specific table
     */
    async getIndexes(tableName) {
        const result = await this.connection.query(`
      SELECT
        INDEX_NAME as name,
        COLUMN_NAME as columnName,
        NON_UNIQUE as nonUnique,
        INDEX_TYPE as type
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND INDEX_NAME != 'PRIMARY'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `, [tableName]);
        // Handle mysql2 result format [rows, fields]
        const rows = Array.isArray(result[0]) ? result[0] : result;
        // Group by index name
        const indexes = new Map();
        for (const row of rows) {
            if (!indexes.has(row.name)) {
                indexes.set(row.name, {
                    name: row.name,
                    columns: [],
                    unique: row.nonUnique === 0,
                    type: row.type
                });
            }
            indexes.get(row.name).columns.push(row.columnName);
        }
        return Array.from(indexes.values());
    }
    /**
     * Get all foreign keys for a specific table
     */
    async getForeignKeys(tableName) {
        const result = await this.connection.query(`
      SELECT
        kcu.CONSTRAINT_NAME as name,
        kcu.COLUMN_NAME as columnName,
        kcu.REFERENCED_TABLE_NAME as referencedTable,
        kcu.REFERENCED_COLUMN_NAME as referencedColumn,
        rc.UPDATE_RULE as onUpdate,
        rc.DELETE_RULE as onDelete
      FROM information_schema.KEY_COLUMN_USAGE kcu
      JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
        AND kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = ?
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `, [tableName]);
        // Handle mysql2 result format [rows, fields]
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows.map((row) => ({
            name: row.name,
            column: row.columnName,
            referencedTable: row.referencedTable,
            referencedColumn: row.referencedColumn,
            onUpdate: row.onUpdate,
            onDelete: row.onDelete
        }));
    }
    /**
     * Check if migrations tracking tables exist
     */
    async migrationTablesExist() {
        const result = await this.connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('migrations', 'migration_lock')
    `);
        return result[0].count === 2;
    }
    /**
     * Initialize migration tracking tables
     */
    async initializeMigrationTables() {
        const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at DATETIME NOT NULL,
        execution_time INT,
        batch INT NOT NULL,
        squashed BOOLEAN DEFAULT FALSE,
        backup_path VARCHAR(500) NULL,
        INDEX idx_batch (batch),
        INDEX idx_squashed (squashed)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS migration_lock (
        id INT PRIMARY KEY AUTO_INCREMENT,
        locked_at DATETIME NOT NULL,
        hostname VARCHAR(255) NOT NULL,
        process_id INT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
        const statements = sql.split(';').filter(s => s.trim());
        for (const statement of statements) {
            await this.connection.query(statement);
        }
    }
}
//# sourceMappingURL=SchemaIntrospector.js.map