import { db } from "../orm/Database.js";
/**
 * QueryBuilder class
 * Fluent query builder for constructing SQL queries programmatically
 * Provides chainable methods for SELECT, INSERT, UPDATE, DELETE with automatic SQL injection prevention
 * Supports WHERE clauses, JOINs, ORDER BY, LIMIT, and raw SQL
 * @example
 * const qb = new QueryBuilder(User)
 * const users = await qb
 *   .selectFrom('users', ['id', 'name'])
 *   .where('active', '=', true)
 *   .orderBy('name', 'ASC')
 *   .limit(10)
 *   .execute()
 */
export class QueryBuilder {
    // private readonly table: string
    entity = null;
    sql = ``;
    params = [];
    /**
     * Creates a new QueryBuilder instance
     * @param {Entity<EntityInterface> | StdConstructor | null} entity - Optional entity class for result mapping
     */
    constructor(entity = null) {
        this.entity = entity;
        return this;
    }
    /**
     * Sanitizes SQL identifiers (table names, column names) to prevent SQL injection
     * @param identifier - The identifier to sanitize
     * @returns The sanitized identifier wrapped in backticks
     * @throws Error if identifier contains invalid characters
     */
    sanitizeIdentifier(identifier) {
        // Allow table.column syntax
        if (identifier.includes(".")) {
            const parts = identifier.split(".");
            return parts.map((part) => this.sanitizeIdentifier(part)).join(".");
        }
        // Only allow valid SQL identifiers: letters, numbers, underscores
        // Must start with letter or underscore
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
            throw new Error(`Invalid SQL identifier: ${identifier}`);
        }
        return `\`${identifier}\``;
    }
    selectFrom = (table, columns = ["*"]) => {
        const safeTable = this.sanitizeIdentifier(table);
        const safeColumns = columns.map((col) => (col === "*" ? "*" : this.sanitizeIdentifier(col)));
        this.sql += `SELECT ${safeColumns.join(", ")} FROM ${safeTable} `;
        return this;
    };
    insertInto = (table) => {
        const safeTable = this.sanitizeIdentifier(table);
        this.sql += `INSERT INTO ${safeTable} `;
        return this;
    };
    insertData = (data) => {
        const safeColumns = Object.keys(data).map((col) => this.sanitizeIdentifier(col));
        this.sql += `(${safeColumns.join(", ")}) VALUES (${Object.values(data)
            .map(() => "?")
            .join(", ")})`;
        this.params = Object.values(data);
        return this;
    };
    updateFrom = (table) => {
        const safeTable = this.sanitizeIdentifier(table);
        this.sql += `UPDATE ${safeTable} `;
        return this;
    };
    updateData = (data) => {
        const safeUpdates = Object.entries(data).map(([key]) => `${this.sanitizeIdentifier(key)} = ?`);
        this.sql += `SET ${safeUpdates.join(", ")}`;
        this.params = Object.values(data);
        return this;
    };
    deleteFrom = (table) => {
        const safeTable = this.sanitizeIdentifier(table);
        this.sql += `DELETE FROM ${safeTable} `;
        return this;
    };
    join = (table, on, type = "LEFT") => {
        const safeTable = this.sanitizeIdentifier(table);
        // Sanitize the ON clause by validating it contains only valid identifiers and operators
        const sanitizedOn = this.sanitizeJoinCondition(on);
        this.sql += ` ${type} JOIN ${safeTable} ON ${sanitizedOn}`;
        return this;
    };
    /**
     * Sanitizes JOIN ON conditions to prevent SQL injection
     * Supports simple conditions like "users.id = posts.user_id"
     */
    sanitizeJoinCondition(condition) {
        // Match pattern: identifier operator identifier
        // e.g., "users.id = posts.user_id" or "a.id = b.id"
        const pattern = /^([a-zA-Z_][a-zA-Z0-9_.]*)\s*(=|!=|<|>|<=|>=)\s*([a-zA-Z_][a-zA-Z0-9_.]*)$/;
        const match = condition.trim().match(pattern);
        if (!match) {
            throw new Error(`Invalid JOIN condition: ${condition}`);
        }
        const [, left, operator, right] = match;
        const safeLeft = this.sanitizeIdentifier(left);
        const safeRight = this.sanitizeIdentifier(right);
        return `${safeLeft} ${operator} ${safeRight}`;
    }
    where = (column, test, value) => {
        const safeColumn = this.sanitizeIdentifier(column);
        this.sql += `WHERE ${safeColumn} ${test} ? `;
        this.params.push(value);
        return this;
    };
    andWhere = (column, test, value) => {
        const safeColumn = this.sanitizeIdentifier(column);
        this.sql += `AND ${safeColumn} ${test} ? `;
        this.params.push(value);
        return this;
    };
    orWhere = (column, test, value) => {
        const safeColumn = this.sanitizeIdentifier(column);
        this.sql += `OR ${safeColumn} ${test} ? `;
        this.params.push(value);
        return this;
    };
    orderBy = (column, direction = "ASC") => {
        const safeColumn = this.sanitizeIdentifier(column);
        this.sql += `ORDER BY ${safeColumn} ${direction}`;
        return this;
    };
    limit = (limit, offset = 0) => {
        this.sql += `LIMIT ${offset}, ${limit}`;
        return this;
    };
    raw = (sql, params) => {
        this.sql = sql;
        this.params = params;
        return this;
    };
    getSqlQuery = () => {
        return {
            sql: this.sql,
            params: this.params
        };
    };
    execute = async () => {
        const data = await db.query(this.sql, this.params);
        if (data && this.entity && Array.isArray(data)) {
            const entityClass = this.entity;
            return data.map((item) => {
                if (typeof entityClass === "function")
                    return new entityClass(item);
                return item;
            });
        }
        return data;
    };
}
//# sourceMappingURL=QueryBuilder.js.map