import { describe, it } from "node:test"
import assert from "node:assert"
import { BaseMigration } from "../src/orm/migration/interfaces/MigrationInterface.js"

describe("BaseMigration", () => {
  describe("Default Values", () => {
    it("should have default non-destructive flag", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {
          // Test implementation
        }

        async down(connection: any): Promise<void> {
          // Test implementation
        }
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.isDestructive, false)
    })

    it("should have default requiresBackup as false", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.requiresBackup, false)
    })

    it("should have default autoRollbackOnError as true", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.autoRollbackOnError, true)
    })

    it("should have empty dependsOn array by default", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.deepStrictEqual(migration.dependsOn, [])
    })

    it("should have empty conflictsWith array by default", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.deepStrictEqual(migration.conflictsWith, [])
    })

    it("should have canRunInParallel as true by default", () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.canRunInParallel, true)
    })
  })

  describe("Default Method Implementations", () => {
    it("should return empty array from default dryRun", async () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()
      const sql = await migration.dryRun(null)

      assert.deepStrictEqual(sql, [])
    })

    it("should return valid from default validate", async () => {
      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()
      const result = await migration.validate(null)

      assert.strictEqual(result.valid, true)
      assert.deepStrictEqual(result.errors, [])
    })
  })

  describe("Custom Overrides", () => {
    it("should allow overriding isDestructive", () => {
      class DestructiveMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly isDestructive = true

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new DestructiveMigration()

      assert.strictEqual(migration.isDestructive, true)
    })

    it("should allow overriding requiresBackup", () => {
      class BackupMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly requiresBackup = true

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new BackupMigration()

      assert.strictEqual(migration.requiresBackup, true)
    })

    it("should allow overriding autoRollbackOnError", () => {
      class NoAutoRollbackMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly autoRollbackOnError = false

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new NoAutoRollbackMigration()

      assert.strictEqual(migration.autoRollbackOnError, false)
    })

    it("should allow overriding dependsOn", () => {
      class DependentMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly dependsOn = ["1234567800", "1234567850"]

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new DependentMigration()

      assert.deepStrictEqual(migration.dependsOn, ["1234567800", "1234567850"])
    })

    it("should allow overriding conflictsWith", () => {
      class ConflictingMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly conflictsWith = ["1234567900"]

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new ConflictingMigration()

      assert.deepStrictEqual(migration.conflictsWith, ["1234567900"])
    })

    it("should allow overriding canRunInParallel", () => {
      class SequentialMigration extends BaseMigration {
        readonly version = "1234567890"
        readonly canRunInParallel = false

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new SequentialMigration()

      assert.strictEqual(migration.canRunInParallel, false)
    })

    it("should allow overriding dryRun", async () => {
      class CustomDryRunMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}

        async dryRun(connection: any): Promise<string[]> {
          return ["CREATE TABLE test (id INT)", "ALTER TABLE test ADD name VARCHAR(255)"]
        }
      }

      const migration = new CustomDryRunMigration()
      const sql = await migration.dryRun(null)

      assert.strictEqual(sql.length, 2)
      assert.strictEqual(sql[0], "CREATE TABLE test (id INT)")
      assert.strictEqual(sql[1], "ALTER TABLE test ADD name VARCHAR(255)")
    })

    it("should allow overriding validate", async () => {
      class CustomValidationMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}

        async validate(schema: any): Promise<any> {
          if (!schema.hasTable) {
            return { valid: false, errors: ["Schema validation failed"] }
          }
          return { valid: true, errors: [] }
        }
      }

      const migration = new CustomValidationMigration()

      const invalidResult = await migration.validate({})
      assert.strictEqual(invalidResult.valid, false)
      assert.strictEqual(invalidResult.errors.length, 1)

      const validResult = await migration.validate({ hasTable: true })
      assert.strictEqual(validResult.valid, true)
    })
  })

  describe("Version Property", () => {
    it("should require version property implementation", () => {
      class TestMigration extends BaseMigration {
        readonly version = "20250105123456"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.version, "20250105123456")
    })

    it("should support different version formats", () => {
      class TestMigration extends BaseMigration {
        readonly version = "v2_initial_schema"

        async up(connection: any): Promise<void> {}
        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()

      assert.strictEqual(migration.version, "v2_initial_schema")
    })
  })

  describe("Migration Execution", () => {
    it("should call up method implementation", async () => {
      let upCalled = false

      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {
          upCalled = true
        }

        async down(connection: any): Promise<void> {}
      }

      const migration = new TestMigration()
      await migration.up(null)

      assert.strictEqual(upCalled, true)
    })

    it("should call down method implementation", async () => {
      let downCalled = false

      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {}

        async down(connection: any): Promise<void> {
          downCalled = true
        }
      }

      const migration = new TestMigration()
      await migration.down(null)

      assert.strictEqual(downCalled, true)
    })

    it("should pass connection to up method", async () => {
      let receivedConnection: any = null

      class TestMigration extends BaseMigration {
        readonly version = "1234567890"

        async up(connection: any): Promise<void> {
          receivedConnection = connection
        }

        async down(connection: any): Promise<void> {}
      }

      const mockConnection = { query: async () => {} }
      const migration = new TestMigration()
      await migration.up(mockConnection)

      assert.strictEqual(receivedConnection, mockConnection)
    })
  })
})
