import { db } from "../orm/Database.js";
import { DataFormatter } from "../orm/DataFormatter.js";
/**
 * Repository class
 * Generic repository for database CRUD operations
 * Provides type-safe database access with automatic entity mapping
 * Implements SQL injection prevention through identifier sanitization and parameterized queries
 * @template T - Entity type that extends {id: number | string}
 * @example
 * class UserRepository extends Repository<User> {
 *   constructor() {
 *     super(User)
 *   }
 * }
 * const userRepo = new UserRepository()
 * const user = await userRepo.find(1)
 */
export class Repository {
    /**
     * Creates a new Repository instance
     * Extracts table name from entity metadata
     * @param {new () => T} entityClass - Entity class constructor
     */
    constructor(entityClass) {
        /**
         * Finds a single entity by its primary key ID
         * @param {number | string} id - Primary key value
         * @returns {Promise<T | null>} - Entity instance or null if not found
         * @example
         * const user = await userRepository.find(42)
         */
        this.find = async (id) => {
            const safeTable = this.sanitizeIdentifier(this.table);
            const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE id = ?`, [id]);
            const arrRows = rows;
            return arrRows.length === 0 ? null : Object.assign(new this.entityClass(), arrRows[0]);
        };
        /**
         * Finds a single entity matching the given constraints
         * Returns first match if multiple results exist
         * @param {StdObject} constraints - Key-value pairs for WHERE conditions
         * @returns {Promise<T | null>} - First matching entity or null
         * @example
         * const user = await userRepository.findOneBy({ email: 'user@example.com' })
         */
        this.findOneBy = async (constraints) => {
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
        /**
         * Finds all entities matching the given criteria
         * All criteria must be satisfied (AND condition)
         * @param {Partial<T> | StdObject} criteria - Key-value pairs for WHERE conditions
         * @returns {Promise<T[]>} - Array of matching entities
         * @throws {Error} - If no criteria provided
         * @example
         * const activeUsers = await userRepository.findBy({ active: true, role: 'admin' })
         */
        this.findBy = async (criteria) => {
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
        /**
         * Retrieves all entities from the table
         * @returns {Promise<T[]>} - Array of all entities
         * @example
         * const allUsers = await userRepository.findAll()
         */
        this.findAll = async () => {
            const safeTable = this.sanitizeIdentifier(this.table);
            const [rows] = await db.query(`SELECT * FROM ${safeTable}`, []);
            return rows.map((row) => Object.assign(new this.entityClass(), row));
        };
        /**
         * Saves an entity (insert or update)
         * Performs INSERT if entity has no id, UPDATE if id exists
         * Automatically formats data according to column metadata
         * @param {T | StdObject} entity - Entity to save
         * @returns {Promise<void>}
         * @example
         * const user = new User({ name: 'John', email: 'john@example.com' })
         * await userRepository.save(user) // INSERT
         * user.name = 'Jane'
         * await userRepository.save(user) // UPDATE
         */
        this.save = async (entity) => {
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
        /**
         * Deletes an entity by its primary key ID
         * @param {number | string} id - Primary key value of entity to delete
         * @returns {Promise<void>}
         * @example
         * await userRepository.delete(42)
         */
        this.delete = async (id) => {
            const safeTable = this.sanitizeIdentifier(this.table);
            await db.query(`DELETE FROM ${safeTable} WHERE id = ?`, [id]);
        };
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
}
//# sourceMappingURL=Repository.js.map