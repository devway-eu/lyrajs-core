import { Entity } from "../orm/Entity.js";
import { EntityInterface, StdArray, StdConstructor, StdObject } from "../types/index.js";
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
export declare class QueryBuilder {
    private readonly entity?;
    private sql;
    private params;
    /**
     * Creates a new QueryBuilder instance
     * @param {Entity<EntityInterface> | StdConstructor | null} entity - Optional entity class for result mapping
     */
    constructor(entity?: Entity<EntityInterface> | StdConstructor | null);
    /**
     * Sanitizes SQL identifiers (table names, column names) to prevent SQL injection
     * @param identifier - The identifier to sanitize
     * @returns The sanitized identifier wrapped in backticks
     * @throws Error if identifier contains invalid characters
     */
    private sanitizeIdentifier;
    selectFrom: (table: string, columns?: string[]) => this;
    insertInto: (table: string) => this;
    insertData: (data: StdObject) => this;
    updateFrom: (table: string) => this;
    updateData: (data: StdObject) => this;
    deleteFrom: (table: string) => this;
    join: (table: string, on: string, type?: "INNER" | "LEFT" | "RIGHT" | "FULL") => this;
    /**
     * Sanitizes JOIN ON conditions to prevent SQL injection
     * Supports simple conditions like "users.id = posts.user_id"
     */
    private sanitizeJoinCondition;
    where: (column: string, test: "=" | ">" | "<" | ">=" | "<=" | "!=" | "IS" | "LIKE" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL" | "NOT LIKE", value: string | number | boolean | null) => this;
    andWhere: (column: string, test: "=" | ">" | "<" | ">=" | "<=" | "!=" | "IS" | "LIKE" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL" | "NOT LIKE", value: string | number | boolean | null) => this;
    orWhere: (column: string, test: "=" | ">" | "<" | ">=" | "<=" | "!=" | "IS" | "LIKE" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL" | "NOT LIKE", value: string | number | boolean | null) => this;
    orderBy: (column: string, direction?: "ASC" | "DESC") => this;
    limit: (limit: number, offset?: number) => this;
    raw: (sql: string, params: StdArray) => this;
    getSqlQuery: () => {
        sql: string;
        params: StdArray;
    };
    execute: () => Promise<unknown[]>;
}
