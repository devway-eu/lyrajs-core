export type StdNativeType = bigint | boolean | Date | null | number | object | Promise<StdNativeType> | Promise<void> | StdArray | StdObject | StdFunction | string | undefined | unknown | void;
export type StdArray = Array<StdNativeType>;
export type StdObject = {
    [key: string]: StdNativeType;
};
export type StdFunction = (() => void) | (() => StdNativeType) | ((...args: StdNativeType[]) => StdNativeType) | ((...args: StdNativeType[]) => void) | (() => Promise<StdNativeType>) | (new () => never);
