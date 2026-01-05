import { describe, it } from "node:test"
import * as assert from "node:assert"
import { Entity } from "../src"

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
      declare title?: string
      declare price?: number

      constructor(product?: Partial<Product> | Product) {
        super(product)
      }
    }

    const product = new Product({ title: "Laptop", price: 999.99 })

    assert.ok(product instanceof Product)
    assert.ok(product instanceof Entity)
    assert.strictEqual(product.title, "Laptop")
    assert.strictEqual(product.price, 999.99)
  })

  it("should handle Object.assign correctly with inherited classes", () => {
    class User extends Entity<User> {
      declare name?: string
      declare age?: number

      constructor(user?: Partial<User> | User) {
        super(user)
      }
    }

    const user = new User({ id: 1, name: "Bob", age: 30 })

    assert.strictEqual(user.id, 1)
    assert.strictEqual(user.name, "Bob")
    assert.strictEqual(user.age, 30)
  })
})
