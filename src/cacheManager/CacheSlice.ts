import { cacheAccessor } from "./CacheAccessor"
import { CacheHookResult, CacheSchemaEntry, CacheSchemaType, SliceConfigType } from "./"
import { capitalize } from "../"

class CacheSlice {
  hooks: Record<string, (...keys: string[]) => Promise<CacheHookResult>>
  schemas: CacheSchemaType
  private name: string
  private keysPrefix: string
  private DefaultTTL: number
  private accessor = cacheAccessor

  constructor(config: SliceConfigType) {
    this.name = config.name
    this.keysPrefix = config.keysPrefix ?? ""
    this.DefaultTTL =
      typeof config.DefaultTTL === "string" ? (this.accessor.strToTTL(config.DefaultTTL) as number) : config.DefaultTTL
    this.schemas = Object.fromEntries(Object.entries(config.schema).map(([schemaName, schema]) => [schemaName, schema]))
    this.hooks = Object.fromEntries(
      Object.entries(config.schema).map(([schemaName, schema]) => {
        const hookName = `use${capitalize(schemaName)}Cache`
        return [hookName, this.createHook(schema)]
      })
    )
  }

  public async invalidate(...keys: string[]) {
    return await this.accessor.delete(...keys)
  }

  private createHook(schema: CacheSchemaEntry) {
    return async (...args: (string | number)[]) => {
      const ttl = schema.ttl
        ? ((typeof schema.ttl === "string" ? this.accessor.strToTTL(schema.ttl) : schema.ttl) as number)
        : this.DefaultTTL
      const key = `${this.keysPrefix ? `${this.keysPrefix}:` : ""}${this.name}:${schema.keyBuilder(...args)}`
      return {
        cachedData: (await this.accessor.get(key)) ?? null,
        dataKey: key,
        setCachedData: async (data: any) => await this.accessor.set(key, data, ttl),
        invalidateCachedData: async () => await this.accessor.delete(key)
      }
    }
  }
}

export const createCacheSlice = (config: SliceConfigType) => new CacheSlice(config)
export const invalidateCache = async (...keys: string[]) => await cacheAccessor.delete(...keys)
