export class Entity<T extends object> {
  id: string | number | null = null

  constructor(entity?: Partial<T> | T) {
    if (entity) {
      Object.assign(this, entity)
    }
    return this
  }
}
