export type KeyBuilderType = (...args: (string | number | null | undefined)[]) => string

export interface CacheSchemaEntry {
  keyBuilder: KeyBuilderType
  ttl?: number | string
}

export interface CacheSchemaType {
  [key: string]: CacheSchemaEntry
}

export interface SliceConfigType {
  name: string
  keysPrefix?: string
  DefaultTTL: number | string
  schema: CacheSchemaType
}

export type CacheHookResult<T = any> = {
  cachedData: null | (() => Promise<T>)
  dataKey: string
  setCachedData: (data: T) => Promise<void>
  invalidateCachedData: () => Promise<number>
}
