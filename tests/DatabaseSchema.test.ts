import { describe, it } from "node:test"
import assert from "node:assert"
import { DatabaseSchema, SchemaDiffResult } from "../src/orm/migration/interfaces/DatabaseSchema.js"

describe("DatabaseSchema", () => {
  it("should create empty schema", () => {
    const schema = new DatabaseSchema()

    assert.strictEqual(schema.getTables().length, 0)
    assert.strictEqual(schema.getTableNames().length, 0)
  })

  it("should add table to schema", () => {
    const schema = new DatabaseSchema()
    const table = {
      name: "users",
      columns: [{ name: "id", type: "bigint", primary: true, nullable: false }],
      indexes: [],
      foreignKeys: []
    }

    schema.addTable(table)

    assert.strictEqual(schema.getTables().length, 1)
    assert.strictEqual(schema.hasTable("users"), true)
  })

  it("should get table by name", () => {
    const schema = new DatabaseSchema()
    const table = {
      name: "products",
      columns: [{ name: "id", type: "int", primary: true, nullable: false }],
      indexes: [],
      foreignKeys: []
    }

    schema.addTable(table)
    const retrieved = schema.getTable("products")

    assert.ok(retrieved)
    assert.strictEqual(retrieved.name, "products")
    assert.strictEqual(retrieved.columns.length, 1)
  })

  it("should return undefined for non-existent table", () => {
    const schema = new DatabaseSchema()
    const table = schema.getTable("non_existent")

    assert.strictEqual(table, undefined)
  })

  it("should check if table exists", () => {
    const schema = new DatabaseSchema()

    assert.strictEqual(schema.hasTable("users"), false)

    schema.addTable({
      name: "users",
      columns: [],
      indexes: [],
      foreignKeys: []
    })

    assert.strictEqual(schema.hasTable("users"), true)
  })

  it("should remove table from schema", () => {
    const schema = new DatabaseSchema()
    schema.addTable({
      name: "users",
      columns: [],
      indexes: [],
      foreignKeys: []
    })

    assert.strictEqual(schema.hasTable("users"), true)

    schema.removeTable("users")

    assert.strictEqual(schema.hasTable("users"), false)
  })

  it("should get table names", () => {
    const schema = new DatabaseSchema()
    schema.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })
    schema.addTable({ name: "products", columns: [], indexes: [], foreignKeys: [] })

    const names = schema.getTableNames()

    assert.strictEqual(names.length, 2)
    assert.ok(names.includes("users"))
    assert.ok(names.includes("products"))
  })

  it("should serialize to JSON", () => {
    const schema = new DatabaseSchema()
    schema.addTable({
      name: "users",
      columns: [{ name: "id", type: "int", primary: true, nullable: false }],
      indexes: [],
      foreignKeys: []
    })

    const json = schema.toJSON()

    assert.ok(json.tables)
    assert.strictEqual(json.tables.length, 1)
    assert.strictEqual(json.tables[0].name, "users")
  })

  it("should deserialize from JSON", () => {
    const json = {
      tables: [
        {
          name: "users",
          columns: [{ name: "id", type: "int", primary: true, nullable: false }],
          indexes: [],
          foreignKeys: []
        }
      ]
    }

    const schema = DatabaseSchema.fromJSON(json)

    assert.strictEqual(schema.getTables().length, 1)
    assert.strictEqual(schema.hasTable("users"), true)
  })

  it("should handle empty JSON", () => {
    const schema = DatabaseSchema.fromJSON({})

    assert.strictEqual(schema.getTables().length, 0)
  })
})

describe("SchemaDiffResult", () => {
  it("should create empty diff", () => {
    const diff = new SchemaDiffResult()

    assert.strictEqual(diff.isEmpty(), true)
    assert.strictEqual(diff.isDestructive(), false)
  })

  it("should detect non-empty diff", () => {
    const diff = new SchemaDiffResult()
    diff.tablesToCreate.push({
      name: "users",
      columns: [],
      indexes: [],
      foreignKeys: []
    })

    assert.strictEqual(diff.isEmpty(), false)
  })

  it("should detect destructive operations - table drops", () => {
    const diff = new SchemaDiffResult()
    diff.tablesToDrop.push("old_table")

    assert.strictEqual(diff.isDestructive(), true)
  })

  it("should detect destructive operations - column removal", () => {
    const diff = new SchemaDiffResult()
    diff.columnsToRemove.push({ table: "users", column: "old_column" })

    assert.strictEqual(diff.isDestructive(), true)
  })

  it("should not consider column additions as destructive", () => {
    const diff = new SchemaDiffResult()
    diff.columnsToAdd.push({ table: "users", column: "new_column" })

    assert.strictEqual(diff.isDestructive(), false)
    assert.strictEqual(diff.isEmpty(), false)
  })

  it("should not consider table creation as destructive", () => {
    const diff = new SchemaDiffResult()
    diff.tablesToCreate.push({
      name: "new_table",
      columns: [],
      indexes: [],
      foreignKeys: []
    })

    assert.strictEqual(diff.isDestructive(), false)
    assert.strictEqual(diff.isEmpty(), false)
  })

  it("should track multiple change types", () => {
    const diff = new SchemaDiffResult()
    diff.tablesToCreate.push({ name: "new_table", columns: [], indexes: [], foreignKeys: [] })
    diff.columnsToAdd.push({ table: "users", column: "email" })
    diff.indexesToAdd.push({ table: "users", index: "idx_email" })

    assert.strictEqual(diff.isEmpty(), false)
    assert.strictEqual(diff.isDestructive(), false)
  })
})
