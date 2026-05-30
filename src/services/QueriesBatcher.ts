export class QueriesBatcher {
  private readonly queries: Promise<unknown>[]

  constructor(queries: Promise<unknown>[] = []) {
    this.queries = queries
    return this
  }

  add(query: Promise<unknown>): void {
    this.queries.push(query)
  }

  async execute(): Promise<void> {
    await Promise.all(this.queries)
  }

  async executeAndGetResponses<T = unknown>(): Promise<T[]> {
    return (await Promise.all(this.queries)) as T[]
  }

  async executeSettled(): Promise<void> {
    await Promise.allSettled(this.queries)
  }
}
