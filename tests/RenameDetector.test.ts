import { describe, it } from "node:test"
import assert from "node:assert"
import { RenameDetector } from "../src/orm/migration/detector/RenameDetector.js"

describe("RenameDetector", () => {
  const detector = new RenameDetector()

  describe("Column Rename Detection", () => {
    it("should detect high similarity column renames", () => {
      const removed = [
        { name: "firstName", type: "varchar", length: 255, nullable: false }
      ]
      const added = [
        { name: "first_name", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      assert.strictEqual(renames.length, 1)
      assert.strictEqual(renames[0].from, "firstName")
      assert.strictEqual(renames[0].to, "first_name")
      assert.ok(renames[0].confidence > 0.6)
    })

    it("should not detect renames for completely different names", () => {
      const removed = [
        { name: "age", type: "int", nullable: false }
      ]
      const added = [
        { name: "email", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      assert.strictEqual(renames.length, 0)
    })

    it("should consider type compatibility in rename detection", () => {
      const removed = [
        { name: "user_name", type: "varchar", length: 255, nullable: false }
      ]
      const added = [
        { name: "username", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      assert.strictEqual(renames.length, 1)
      assert.strictEqual(renames[0].from, "user_name")
      assert.strictEqual(renames[0].to, "username")
      assert.ok(renames[0].confidence > 0.7)
    })

    it("should handle empty arrays", () => {
      const renames = detector.detectColumnRenames("users", [], [])

      assert.strictEqual(renames.length, 0)
    })

    it("should handle no removed columns", () => {
      const added = [
        { name: "new_column", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", [], added)

      assert.strictEqual(renames.length, 0)
    })

    it("should handle no added columns", () => {
      const removed = [
        { name: "old_column", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, [])

      assert.strictEqual(renames.length, 0)
    })

    it("should detect renames with similar case changes", () => {
      const removed = [
        { name: "UserEmail", type: "varchar", length: 255, nullable: false }
      ]
      const added = [
        { name: "userEmail", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      assert.strictEqual(renames.length, 1)
      assert.ok(renames[0].confidence > 0.8)
    })
  })

  describe("Table Rename Detection", () => {
    it("should detect high similarity table renames", () => {
      const removed = [{ name: "user_account", columns: [], indexes: [], foreignKeys: [] }]
      const added = [{ name: "user_accounts", columns: [], indexes: [], foreignKeys: [] }]

      const renames = detector.detectTableRenames(removed, added)

      assert.strictEqual(renames.length, 1)
      assert.strictEqual(renames[0].from, "user_account")
      assert.strictEqual(renames[0].to, "user_accounts")
    })

    it("should not detect renames for different table names", () => {
      const removed = [{ name: "users", columns: [], indexes: [], foreignKeys: [] }]
      const added = [{ name: "products", columns: [], indexes: [], foreignKeys: [] }]

      const renames = detector.detectTableRenames(removed, added)

      assert.strictEqual(renames.length, 0)
    })

    it("should handle empty arrays", () => {
      const renames = detector.detectTableRenames([], [])

      assert.strictEqual(renames.length, 0)
    })

    it("should detect case-only changes", () => {
      const removed = [{ name: "UserData", columns: [], indexes: [], foreignKeys: [] }]
      const added = [{ name: "userData", columns: [], indexes: [], foreignKeys: [] }]

      const renames = detector.detectTableRenames(removed, added)

      assert.strictEqual(renames.length, 1)
    })

    it("should detect snake_case to camelCase conversions", () => {
      const removed = [{ name: "user_profile", columns: [], indexes: [], foreignKeys: [] }]
      const added = [{ name: "userProfile", columns: [], indexes: [], foreignKeys: [] }]

      const renames = detector.detectTableRenames(removed, added)

      assert.strictEqual(renames.length, 1)
    })
  })

  describe("Confidence Scoring", () => {
    it("should have high confidence for exact matches with case change", () => {
      const removed = [
        { name: "Email", type: "varchar", length: 255, nullable: false }
      ]
      const added = [
        { name: "email", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      assert.strictEqual(renames.length, 1)
      assert.ok(renames[0].confidence > 0.9)
    })

    it("should have lower confidence for partial matches", () => {
      const removed = [
        { name: "user", type: "varchar", length: 255, nullable: false }
      ]
      const added = [
        { name: "username", type: "varchar", length: 255, nullable: false }
      ]

      const renames = detector.detectColumnRenames("users", removed, added)

      if (renames.length > 0) {
        assert.ok(renames[0].confidence < 0.8)
      }
    })
  })
})
