import { db } from "@/core/orm/Database"
import { DataFormatter } from "@/core/orm/DataFormatter"
import { StdArray, StdNativeType, StdObject } from "@/core/types"

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
export class Repository<T extends { id: number | string }> {
  private readonly entityClass: new () => T
  private readonly table: string

  /**
   * Creates a new Repository instance
   * Extracts table name from entity metadata
   * @param {new () => T} entityClass - Entity class constructor
   */
  constructor(entityClass: new () => T) {
    this.entityClass = entityClass
    this.table = Reflect.getMetadata("entity:table", this.entityClass)

    return this
  }

  /**
   * Sanitizes SQL identifiers to prevent SQL injection
   * @param identifier - The identifier to sanitize
   * @returns The sanitized identifier wrapped in backticks
   */
  private sanitizeIdentifier(identifier: string): string {
    // Only allow valid SQL identifiers
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw new Error(`Invalid SQL identifier: ${identifier}`)
    }
    return `\`${identifier}\``
  }

  /**
   * Finds a single entity by its primary key ID
   * @param {number | string} id - Primary key value
   * @returns {Promise<T | null>} - Entity instance or null if not found
   * @example
   * const user = await userRepository.find(42)
   */
  find = async (id: number | string) => {
    const safeTable = this.sanitizeIdentifier(this.table)
    const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE id = ?`, [id])
    const arrRows = rows as StdArray
    return arrRows.length === 0 ? null : Object.assign(new this.entityClass(), arrRows[0])
  }

  /**
   * Finds a single entity matching the given constraints
   * Returns first match if multiple results exist
   * @param {StdObject} constraints - Key-value pairs for WHERE conditions
   * @returns {Promise<T | null>} - First matching entity or null
   * @example
   * const user = await userRepository.findOneBy({ email: 'user@example.com' })
   */
  findOneBy = async (constraints: StdObject) => {
    const safeTable = this.sanitizeIdentifier(this.table)
    const keys = Object.keys(constraints)
    const strConstraints = keys
      .map((key) => `${this.sanitizeIdentifier(key)} = ?`)
      .join(" AND ")
    const values: StdArray = []

    Object.values(constraints).forEach((value: StdNativeType) => {
      if (typeof value !== "function") values.push(value)
    })

    const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE ${strConstraints} LIMIT 1`, values)
    const arrRows = rows as StdArray
    return arrRows.length === 0 ? null : Object.assign(new this.entityClass(), arrRows[0])
  }

  /**
   * Finds all entities matching the given criteria
   * All criteria must be satisfied (AND condition)
   * @param {Partial<T> | StdObject} criteria - Key-value pairs for WHERE conditions
   * @returns {Promise<T[]>} - Array of matching entities
   * @throws {Error} - If no criteria provided
   * @example
   * const activeUsers = await userRepository.findBy({ active: true, role: 'admin' })
   */
  findBy = async (criteria: Partial<T> | StdObject) => {
    const keys = Object.keys(criteria)

    if (keys.length === 0) {
      throw new Error("findBy requires at least one constraint")
    }

    const safeTable = this.sanitizeIdentifier(this.table)
    const whereClause = keys.map((key) => `${this.sanitizeIdentifier(key)} = ?`).join(" AND ")
    const values = keys.map((key) => (criteria as StdObject)[key])

    const [rows] = await db.query(`SELECT * FROM ${safeTable} WHERE ${whereClause}`, values)
    return (rows as StdArray).map((row) => Object.assign(new this.entityClass(), row))
  }

  /**
   * Retrieves all entities from the table
   * @returns {Promise<T[]>} - Array of all entities
   * @example
   * const allUsers = await userRepository.findAll()
   */
  findAll = async () => {
    const safeTable = this.sanitizeIdentifier(this.table)
    const [rows] = await db.query(`SELECT * FROM ${safeTable}`, [])
    return (rows as StdArray).map((row) => Object.assign(new this.entityClass(), row))
  }

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
  save = async (entity: T | StdObject) => {
    // const columns = Reflect.getMetadata("entity:columns", this.entityClass) || []
    // const primaryKey: string = Reflect.getMetadata("entity:pk", this.entityClass)
    let columns = Object.keys(entity)
    // const entityObj = entity as T | any
    const isUpdate = !!entity.id

    const formattedEntity = DataFormatter.getFormattedEntityData(entity as StdObject)
    entity = formattedEntity as T

    const safeTable = this.sanitizeIdentifier(this.table)

    if (isUpdate) {
      columns = columns.filter((col: string) => col !== "id")
      const updates = columns.map((col: string) => `${this.sanitizeIdentifier(col)} = ?`).join(", ")
      const values: unknown[] = columns.map((col: string) => entity[col as keyof typeof entity])

      values.push(entity.id)

      await db.query(`UPDATE ${safeTable} SET ${updates} WHERE id = ?`, values)
    } else {
      const columnNames = columns
        .filter((col: string) => col !== "id")
        .map((col: string) => this.sanitizeIdentifier(col))
      const values = columns
        .filter((col: string) => col !== "id")
        .map((key: string | unknown) => (key === "content" ? JSON.stringify({}) : entity[key as keyof typeof entity]))

      const placeholders = columnNames.map(() => "?").join(", ")

      await db.query(`INSERT INTO ${safeTable} (${columnNames.join(", ")}) VALUES (${placeholders})`, values)
    }
  }

  /**
   * Deletes an entity by its primary key ID
   * @param {number | string} id - Primary key value of entity to delete
   * @returns {Promise<void>}
   * @example
   * await userRepository.delete(42)
   */
  delete = async (id: number | string) => {
    const safeTable = this.sanitizeIdentifier(this.table)
    await db.query(`DELETE FROM ${safeTable} WHERE id = ?`, [id])
  }
}
