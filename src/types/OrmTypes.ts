export interface EntityInterface {
  id: string | number
  [key: string]: unknown
}

export interface StdConstructor {
  new (...args: unknown[]): unknown
}
