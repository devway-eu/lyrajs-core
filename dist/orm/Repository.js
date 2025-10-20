import { db } from "../orm/Database.js";
import { DataFormatter } from "../orm/DataFormatter.js";
export class Repository {
    entityClass;
    table;
    constructor(entityClass) {
        this.entityClass = entityClass;
        this.table = Reflect.getMetadata("entity:table", this.entityClass);
        return this;
    }
    /**
     * Sanitizes SQL identifiers to prevent SQL injection
     * @param identifier - The identifier to sanitize
     * @returns The sanitized identifier wrapped in backticks
     */
    sanitizeIdentifier(identifier) {
        // Only allow valid SQL identifiers
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
            throw new Error(`Invalid SQL identifier: ${identifier}`);
        }
        return `\`${identifier}\``;
    }
    find = async (id) => {
        const safeTable = this.sanitizeIdentifier(this.table);
        const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE id = ?`, [id]);
        const arrRows = rows;
        return arrRows.length === 0 ? null : Object.assign(new this.entityClass(), arrRows[0]);
    };
    findOneBy = async (constraints) => {
        const safeTable = this.sanitizeIdentifier(this.table);
        const keys = Object.keys(constraints);
        const strConstraints = keys
            .map((key) => `${this.sanitizeIdentifier(key)} = ?`)
            .join(" AND ");
        const values = [];
        Object.values(constraints).forEach((value) => {
            if (typeof value !== "function")
                values.push(value);
        });
        const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE ${strConstraints} LIMIT 1`, values);
        const arrRows = rows;
        return arrRows.length === 0 ? null : Object.assign(new this.entityClass(), arrRows[0]);
    };
    findBy = async (criteria) => {
        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("findBy requires at least one constraint");
        }
        const safeTable = this.sanitizeIdentifier(this.table);
        const whereClause = keys.map((key) => `${this.sanitizeIdentifier(key)} = ?`).join(" AND ");
        const values = keys.map((key) => criteria[key]);
        const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE ${whereClause}`, values);
        return rows.map((row) => Object.assign(new this.entityClass(), row));
    };
    findAll = async () => {
        const safeTable = this.sanitizeIdentifier(this.table);
        const [rows] = await db.query(`SELECT * FROM ${safeTable}`, []);
        return rows.map((row) => Object.assign(new this.entityClass(), row));
    };
    save = async (entity) => {
        // const columns = Reflect.getMetadata("entity:columns", this.entityClass) || []
        // const primaryKey: string = Reflect.getMetadata("entity:pk", this.entityClass)
        let columns = Object.keys(entity);
        // const entityObj = entity as T | any
        const isUpdate = !!entity.id;
        const formattedEntity = DataFormatter.getFormattedEntityData(entity);
        entity = formattedEntity;
        const safeTable = this.sanitizeIdentifier(this.table);
        if (isUpdate) {
            columns = columns.filter((col) => col !== "id");
            const updates = columns.map((col) => `${this.sanitizeIdentifier(col)} = ?`).join(", ");
            const values = columns.map((col) => entity[col]);
            values.push(entity.id);
            await db.query(`UPDATE ${safeTable} SET ${updates} WHERE id = ?`, values);
        }
        else {
            const columnNames = columns
                .filter((col) => col !== "id")
                .map((col) => this.sanitizeIdentifier(col));
            const values = columns
                .filter((col) => col !== "id")
                .map((key) => (key === "content" ? JSON.stringify({}) : entity[key]));
            const placeholders = columnNames.map(() => "?").join(", ");
            await db.query(`INSERT INTO ${safeTable} (${columnNames.join(", ")}) VALUES (${placeholders})`, values);
        }
    };
    delete = async (id) => {
        const safeTable = this.sanitizeIdentifier(this.table);
        await db.query(`DELETE FROM ${safeTable} WHERE id = ?`, [id]);
    };
}
//# sourceMappingURL=Repository.js.map