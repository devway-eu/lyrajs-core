import { describe, it } from "node:test"
import assert from "node:assert"
import { Entity } from "../src/orm/Entity.js"

describe("Entity", () => {
  it("should create entity with default id null", () => {
    const entity = new Entity()

    assert.strictEqual(entity.id, null)
  })

  it("should assign properties from constructor", () => {
    const entity = new Entity({ name: "John", email: "john@example.com" })

    assert.strictEqual((entity as any).name, "John")
    assert.strictEqual((entity as any).email, "john@example.com")
  })

  it("should assign partial properties", () => {
    const entity = new Entity({ name: "Jane" })

    assert.strictEqual((entity as any).name, "Jane")
    assert.strictEqual((entity as any).email, undefined)
  })

  it("should handle id assignment", () => {
    const entity = new Entity({ id: 123, name: "Alice" })

    assert.strictEqual(entity.id, 123)
    assert.strictEqual((entity as any).name, "Alice")
  })

  it("should support string id", () => {
    const entity = new Entity({ id: "uuid-123" })

    assert.strictEqual(entity.id, "uuid-123")
  })

  it("should support number id", () => {
    const entity = new Entity({ id: 456 })

    assert.strictEqual(entity.id, 456)
  })

  it("should create empty entity", () => {
    const entity = new Entity()

    assert.strictEqual(entity.id, null)
  })

  it("should maintain entity type when extended", () => {
    class Product extends Entity<Product> {
      constructor(product?: Partial<Product> | Product) {
        super(product)
        // Don't declare fields - let Object.assign handle them
      }
    }

    const product = new Product({ title: "Laptop", price: 999.99 })

    assert.ok(product instanceof Product)
    assert.ok(product instanceof Entity)
    assert.strictEqual((product as any).title, "Laptop")
    assert.strictEqual((product as any).price, 999.99)
  })

  it("should handle Object.assign correctly with inherited classes", () => {
    class User extends Entity<User> {
      constructor(user?: Partial<User> | User) {
        super(user)
        // Properties are assigned via Object.assign in parent
      }
    }

    const user = new User({ id: 1, name: "Bob", age: 30 })

    assert.strictEqual(user.id, 1)
    assert.strictEqual((user as any).name, "Bob")
    assert.strictEqual((user as any).age, 30)
  })
})
