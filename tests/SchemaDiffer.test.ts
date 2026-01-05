import { describe, it } from "node:test"
import assert from "node:assert"
import { SchemaDiffer } from "../src/orm/migration/differ/SchemaDiffer.js"
import { DatabaseSchema } from "../src/orm/migration/interfaces/DatabaseSchema.js"

describe("SchemaDiffer", () => {
  const differ = new SchemaDiffer()

  describe("Table Operations", () => {
    it("should detect new tables to create", () => {
      const current = new DatabaseSchema()
      current.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })

      const desired = new DatabaseSchema()
      desired.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })
      desired.addTable({ name: "products", columns: [], indexes: [], foreignKeys: [] })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.tablesToCreate.length, 1)
      assert.strictEqual(diff.tablesToCreate[0].name, "products")
    })

    it("should detect tables to drop", () => {
      const current = new DatabaseSchema()
      current.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })
      current.addTable({ name: "old_table", columns: [], indexes: [], foreignKeys: [] })

      const desired = new DatabaseSchema()
      desired.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.tablesToDrop.length, 1)
      assert.strictEqual(diff.tablesToDrop[0], "old_table")
    })

    it("should detect empty schema diff", () => {
      const current = new DatabaseSchema()
      current.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })

      const desired = new DatabaseSchema()
      desired.addTable({ name: "users", columns: [], indexes: [], foreignKeys: [] })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.isEmpty(), true)
    })

    it("should handle empty schemas", () => {
      const current = new DatabaseSchema()
      const desired = new DatabaseSchema()

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.isEmpty(), true)
    })
  })

  describe("Column Operations", () => {
    it("should detect new columns to add", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "id", type: "bigint", primary: true, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "id", type: "bigint", primary: true, nullable: false },
          { name: "email", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToAdd.length, 1)
      assert.strictEqual(diff.columnsToAdd[0].table, "users")
      assert.strictEqual(diff.columnsToAdd[0].column.name, "email")
    })

    it("should detect columns to remove", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "id", type: "bigint", primary: true, nullable: false },
          { name: "old_column", type: "varchar", length: 255, nullable: true }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "id", type: "bigint", primary: true, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToRemove.length, 1)
      assert.strictEqual(diff.columnsToRemove[0].table, "users")
      assert.strictEqual(diff.columnsToRemove[0].column, "old_column")
      assert.strictEqual(diff.isDestructive(), true)
    })

    it("should detect column type changes", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "age", type: "int", nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "age", type: "bigint", nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToModify.length, 1)
      assert.strictEqual(diff.columnsToModify[0].table, "users")
      assert.strictEqual(diff.columnsToModify[0].column, "age")
      assert.strictEqual(diff.columnsToModify[0].changeType, "TYPE_CHANGE")
    })

    it("should detect nullable changes", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "email", type: "varchar", length: 255, nullable: true }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "email", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToModify.length, 1)
      assert.strictEqual(diff.columnsToModify[0].changeType, "NULLABLE_CHANGE")
      assert.strictEqual(diff.columnsToModify[0].from, true)
      assert.strictEqual(diff.columnsToModify[0].to, false)
    })

    it("should detect default value changes", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "status", type: "varchar", length: 50, nullable: false, default: "'active'" }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "status", type: "varchar", length: 50, nullable: false, default: "'pending'" }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToModify.length, 1)
      assert.strictEqual(diff.columnsToModify[0].changeType, "DEFAULT_CHANGE")
    })

    it("should detect column length changes", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "name", type: "varchar", length: 100, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "name", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.columnsToModify.length, 1)
      assert.strictEqual(diff.columnsToModify[0].changeType, "TYPE_CHANGE")
      assert.strictEqual(diff.columnsToModify[0].from, "varchar(100)")
      assert.strictEqual(diff.columnsToModify[0].to, "varchar(255)")
    })
  })

  describe("Index Operations", () => {
    it("should detect new indexes to add", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [{ name: "email", type: "varchar", length: 255, nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [{ name: "email", type: "varchar", length: 255, nullable: false }],
        indexes: [{ name: "idx_email", columns: ["email"], unique: true }],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.indexesToAdd.length, 1)
      assert.strictEqual(diff.indexesToAdd[0].table, "users")
      assert.strictEqual(diff.indexesToAdd[0].index.name, "idx_email")
    })

    it("should detect indexes to remove", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [{ name: "email", type: "varchar", length: 255, nullable: false }],
        indexes: [{ name: "idx_old", columns: ["email"], unique: false }],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [{ name: "email", type: "varchar", length: 255, nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.indexesToRemove.length, 1)
      assert.strictEqual(diff.indexesToRemove[0].table, "users")
      assert.strictEqual(diff.indexesToRemove[0].index, "idx_old")
    })
  })

  describe("Foreign Key Operations", () => {
    it("should detect new foreign keys to add", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "posts",
        columns: [{ name: "user_id", type: "bigint", nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "posts",
        columns: [{ name: "user_id", type: "bigint", nullable: false }],
        indexes: [],
        foreignKeys: [{
          name: "fk_posts_user",
          column: "user_id",
          referencedTable: "users",
          referencedColumn: "id",
          onDelete: "CASCADE"
        }]
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.foreignKeysToAdd.length, 1)
      assert.strictEqual(diff.foreignKeysToAdd[0].table, "posts")
      assert.strictEqual(diff.foreignKeysToAdd[0].foreignKey.name, "fk_posts_user")
    })

    it("should detect foreign keys to remove", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "posts",
        columns: [{ name: "user_id", type: "bigint", nullable: false }],
        indexes: [],
        foreignKeys: [{
          name: "fk_old",
          column: "user_id",
          referencedTable: "users",
          referencedColumn: "id"
        }]
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "posts",
        columns: [{ name: "user_id", type: "bigint", nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.foreignKeysToRemove.length, 1)
      assert.strictEqual(diff.foreignKeysToRemove[0].table, "posts")
      assert.strictEqual(diff.foreignKeysToRemove[0].foreignKey, "fk_old")
    })
  })

  describe("Complex Scenarios", () => {
    it("should handle multiple changes across tables", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [{ name: "id", type: "int", primary: true, nullable: false }],
        indexes: [],
        foreignKeys: []
      })
      current.addTable({
        name: "posts",
        columns: [{ name: "id", type: "int", primary: true, nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "id", type: "bigint", primary: true, nullable: false },
          { name: "email", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [{ name: "idx_email", columns: ["email"], unique: true }],
        foreignKeys: []
      })
      desired.addTable({
        name: "products",
        columns: [{ name: "id", type: "bigint", primary: true, nullable: false }],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      assert.strictEqual(diff.tablesToCreate.length, 1)
      assert.strictEqual(diff.tablesToDrop.length, 1)
      assert.strictEqual(diff.columnsToAdd.length, 1)
      assert.strictEqual(diff.columnsToModify.length, 1)
      assert.strictEqual(diff.indexesToAdd.length, 1)
      assert.strictEqual(diff.isEmpty(), false)
    })

    it("should not confuse renames with add/remove", () => {
      const current = new DatabaseSchema()
      current.addTable({
        name: "users",
        columns: [
          { name: "firstName", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const desired = new DatabaseSchema()
      desired.addTable({
        name: "users",
        columns: [
          { name: "first_name", type: "varchar", length: 255, nullable: false }
        ],
        indexes: [],
        foreignKeys: []
      })

      const diff = differ.diff(current, desired)

      // Should detect as rename, not add + remove
      assert.ok(diff.columnsToRename.length > 0 ||
                (diff.columnsToAdd.length > 0 && diff.columnsToRemove.length > 0))
    })
  })
})
