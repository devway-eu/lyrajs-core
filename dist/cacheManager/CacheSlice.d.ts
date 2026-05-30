import { CacheHookResult, CacheSchemaType, SliceConfigType } from "./index.js";
declare class CacheSlice {
    hooks: Record<string, (...keys: string[]) => Promise<CacheHookResult>>;
    schemas: CacheSchemaType;
    private name;
    private keysPrefix;
    private DefaultTTL;
    private accessor;
    constructor(config: SliceConfigType);
    invalidate(...keys: string[]): Promise<number>;
    private createHook;
}
export declare const createCacheSlice: (config: SliceConfigType) => CacheSlice;
export declare const invalidateCache: (...keys: string[]) => Promise<number>;
export {};
