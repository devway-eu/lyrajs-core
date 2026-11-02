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
         * @param {false | PaginationOptions} pagination - Pagination options (page and perPage) or false
         * @returns {Promise<T[]>} - Array of matching entities
         * @throws {Error} - If no criteria provided
         * @example
         * const activeUsers = await userRepository.findBy({ active: true, role: 'admin' })
         * const paginatedUsers = await userRepository.findBy({ active: true }, { page: 2, perPage: 10 })
         */
        this.findBy = async (criteria, pagination = false) => {
            const keys = Object.keys(criteria);
            if (keys.length === 0) {
                throw new Error("findBy requires at least one constraint");
            }
            const safeTable = this.sanitizeIdentifier(this.table);
            const whereClause = keys.map((key) => `${this.sanitizeIdentifier(key)} = ?`).join(" AND ");
            const values = keys.map((key) => criteria[key]);
            let query = `SELECT * FROM ${safeTable} WHERE ${whereClause}`;
            // Add pagination if provided
            if (pagination !== false) {
                const offset = (pagination.page - 1) * pagination.perPage;
                query += ` LIMIT ${pagination.perPage} OFFSET ${offset}`;
            }
            const [rows] = await db.query(query, values);
            return rows.map((row) => Object.assign(new this.entityClass(), row));
        };
        /**
         * Retrieves all entities from the table
         * @param {false | PaginationOptions} pagination - Pagination options (page and perPage) or false
         * @returns {Promise<T[]>} - Array of all entities
         * @example
         * const allUsers = await userRepository.findAll()
         * const paginatedUsers = await userRepository.findAll({ page: 1, perPage: 20 })
         */
        this.findAll = async (pagination = false) => {
            const safeTable = this.sanitizeIdentifier(this.table);
            let query = `SELECT * FROM ${safeTable}`;
            // Add pagination if provided
            if (pagination !== false) {
                const offset = (pagination.page - 1) * pagination.perPage;
                query += ` LIMIT ${pagination.perPage} OFFSET ${offset}`;
            }
            const [rows] = await db.query(query, []);
            return rows.map((row) => Object.assign(new this.entityClass(), row));
        };
        /**
         * Saves an entity (insert or update)
         * Performs INSERT if entity has no id, UPDATE if id exists
         * Automatically formats data according to column metadata
         * Only persists properties decorated with @Column()
         * @param {T | StdObject} entity - Entity to save
         * @returns {Promise<T>} - The saved entity
         * @example
         * const user = new User({ name: 'John', email: 'john@example.com' })
         * const savedUser = await userRepository.save(user) // INSERT
         * savedUser.name = 'Jane'
         * const updatedUser = await userRepository.save(savedUser) // UPDATE
         */
        this.save = async (entity) => {
            const isUpdate = !!entity.id;
            const entityId = entity.id; // Store ID before formatting
            const formattedEntity = DataFormatter.getFormattedEntityData(entity);
            entity = formattedEntity;
            // Get only decorated columns from metadata
            const decoratedColumns = this.getDecoratedColumnNames();
            let columns = decoratedColumns.filter((col) => col !== "id" && entity.hasOwnProperty(col));
            const safeTable = this.sanitizeIdentifier(this.table);
            if (isUpdate) {
                const updates = columns.map((col) => `${this.sanitizeIdentifier(col)} = ?`).join(", ");
                const values = columns.map((col) => entity[col]);
                values.push(entityId);
                await db.query(`UPDATE ${safeTable} SET ${updates} WHERE id = ?`, values);
                return await this.find(entityId);
            }
            else {
                const columnNames = columns.map((col) => this.sanitizeIdentifier(col));
                const values = columns.map((key) => (key === "content" ? JSON.stringify({}) : entity[key]));
                const placeholders = columnNames.map(() => "?").join(", ");
                const [result] = await db.query(`INSERT INTO ${safeTable} (${columnNames.join(", ")}) VALUES (${placeholders})`, values);
                // Get the insertId from the result
                const insertId = result.insertId;
                // Fetch and return the newly created entity
                return await this.find(insertId);
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
    /**
     * Gets the list of decorated column names from entity metadata
     * Only returns properties that have the @Column() decorator
     * @returns {string[]} - Array of column names
     * @private
     */
    getDecoratedColumnNames() {
        // Note: Column decorator stores metadata on the prototype, not the constructor
        const columnMetadata = Reflect.getMetadata("entity:columns", this.entityClass.prototype) || [];
        return columnMetadata.map((col) => col.name);
    }
}
//# sourceMappingURL=Repository.js.map