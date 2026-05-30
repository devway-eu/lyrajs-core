import { cacheAccessor } from "./CacheAccessor.js";
import { capitalize } from "../index.js";
class CacheSlice {
    constructor(config) {
        var _a;
        this.accessor = cacheAccessor;
        this.name = config.name;
        this.keysPrefix = (_a = config.keysPrefix) !== null && _a !== void 0 ? _a : "";
        this.DefaultTTL =
            typeof config.DefaultTTL === "string" ? this.accessor.strToTTL(config.DefaultTTL) : config.DefaultTTL;
        this.schemas = Object.fromEntries(Object.entries(config.schema).map(([schemaName, schema]) => [schemaName, schema]));
        this.hooks = Object.fromEntries(Object.entries(config.schema).map(([schemaName, schema]) => {
            const hookName = `use${capitalize(schemaName)}Cache`;
            return [hookName, this.createHook(schema)];
        }));
    }
    async invalidate(...keys) {
        return await this.accessor.delete(...keys);
    }
    createHook(schema) {
        return async (...args) => {
            var _a;
            const ttl = schema.ttl
                ? (typeof schema.ttl === "string" ? this.accessor.strToTTL(schema.ttl) : schema.ttl)
                : this.DefaultTTL;
            const key = `${this.keysPrefix ? `${this.keysPrefix}:` : ""}${this.name}:${schema.keyBuilder(...args)}`;
            return {
                cachedData: (_a = (await this.accessor.get(key))) !== null && _a !== void 0 ? _a : null,
                dataKey: key,
                setCachedData: async (data) => await this.accessor.set(key, data, ttl),
                invalidateCachedData: async () => await this.accessor.delete(key)
            };
        };
    }
}
export const createCacheSlice = (config) => new CacheSlice(config);
export const invalidateCache = async (...keys) => await cacheAccessor.delete(...keys);
//# sourceMappingURL=CacheSlice.js.map