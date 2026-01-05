import { describe, it } from "node:test"
import assert from "node:assert"
import { ObjectCleaner } from "../src/orm/ObjectCleaner.js"
import { Entity } from "../src/orm/Entity.js"

describe("ObjectCleaner", () => {
  describe("removeId", () => {
    it("should remove id property from object", () => {
      const obj = { id: 123, name: "John", email: "john@example.com" }

      const result = ObjectCleaner.removeId(obj)

      assert.strictEqual(result.id, undefined)
      assert.strictEqual((result as any).name, "John")
      assert.strictEqual((result as any).email, "john@example.com")
    })

    it("should handle object without id property", () => {
      const obj = { name: "Jane", age: 30 }

      const result = ObjectCleaner.removeId(obj)

      assert.strictEqual((result as any).name, "Jane")
      assert.strictEqual((result as any).age, 30)
    })

    it("should remove id from Entity instance", () => {
      class User extends Entity<User> {
        constructor(user?: Partial<User> | User) {
          super(user)
        }
      }

      const user = new User({ id: 456, name: "Alice" })

      const result = ObjectCleaner.removeId(user)

      assert.strictEqual(result.id, undefined)
      assert.strictEqual((result as any).name, "Alice")
    })

    it("should handle null id", () => {
      const obj = { id: null, name: "Bob" }

      const result = ObjectCleaner.removeId(obj)

      assert.ok("id" in result)
      assert.strictEqual((result as any).name, "Bob")
    })

    it("should handle string id", () => {
      const obj = { id: "uuid-123", name: "Charlie" }

      const result = ObjectCleaner.removeId(obj)

      assert.strictEqual(result.id, undefined)
      assert.strictEqual((result as any).name, "Charlie")
    })
  })

  describe("removeMethods", () => {
    it("should remove function properties from object", () => {
      const obj = {
        name: "Test",
        value: 100,
        doSomething: () => "hello",
        calculate: function() { return 42 }
      }

      const result = ObjectCleaner.removeMethods(obj)

      assert.strictEqual((result as any).name, "Test")
      assert.strictEqual((result as any).value, 100)
      assert.strictEqual((result as any).doSomething, undefined)
      assert.strictEqual((result as any).calculate, undefined)
    })

    it("should handle object without methods", () => {
      const obj = {
        name: "Data",
        count: 5,
        flag: true
      }

      const result = ObjectCleaner.removeMethods(obj)

      assert.strictEqual((result as any).name, "Data")
      assert.strictEqual((result as any).count, 5)
      assert.strictEqual((result as any).flag, true)
    })

    it("should remove methods from Entity instance", () => {
      const entity = new Entity({ title: "Laptop", price: 999 })
      ;(entity as any).customMethod = () => "test"
      ;(entity as any).getPrice = function() { return this.price || 0 }

      const result = ObjectCleaner.removeMethods(entity)

      assert.strictEqual((result as any).title, "Laptop")
      assert.strictEqual((result as any).price, 999)
      assert.strictEqual((result as any).customMethod, undefined)
      assert.strictEqual((result as any).getPrice, undefined)
    })

    it("should handle empty object", () => {
      const obj = {}

      const result = ObjectCleaner.removeMethods(obj)

      assert.deepStrictEqual(result, {})
    })

    it("should preserve non-function values including arrays and objects", () => {
      const obj = {
        name: "Test",
        tags: ["a", "b", "c"],
        metadata: { key: "value" },
        count: 42,
        isActive: true,
        method: () => "remove me"
      }

      const result = ObjectCleaner.removeMethods(obj)

      assert.strictEqual((result as any).name, "Test")
      assert.deepStrictEqual((result as any).tags, ["a", "b", "c"])
      assert.deepStrictEqual((result as any).metadata, { key: "value" })
      assert.strictEqual((result as any).count, 42)
      assert.strictEqual((result as any).isActive, true)
      assert.strictEqual((result as any).method, undefined)
    })
  })

  describe("Combined operations", () => {
    it("should be able to chain removeId and removeMethods", () => {
      const obj = {
        id: 123,
        name: "Test",
        getValue: () => 42
      }

      let result = ObjectCleaner.removeId(obj)
      result = ObjectCleaner.removeMethods(result)

      assert.strictEqual(result.id, undefined)
      assert.strictEqual((result as any).name, "Test")
      assert.strictEqual((result as any).getValue, undefined)
    })
  })
})
