/**
 * Union of all standard JavaScript/TypeScript native types
 * Used throughout LyraJS for flexible type handling
 */
export type StdNativeType = bigint | boolean | Date | null | number | object | Promise<StdNativeType> | Promise<void> | StdArray | StdObject | StdFunction | string | undefined | unknown | void;
/**
 * Array type containing standard native types
 * Alias for Array<StdNativeType>
 */
export type StdArray = Array<StdNativeType>;
/**
 * Generic object type with string keys and native type values
 * Used for flexible object handling in ORM and utilities
 */
export type StdObject = {
    [key: string]: StdNativeType;
};
/**
 * Union of common function signatures
 * Includes void functions, value-returning functions, async functions, and constructors
 */
export type StdFunction = (() => void) | (() => StdNativeType) | ((...args: StdNativeType[]) => StdNativeType) | ((...args: StdNativeType[]) => void) | (() => Promise<StdNativeType>) | (new () => never);
