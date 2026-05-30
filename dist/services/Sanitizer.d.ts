export declare class Sanitizer {
    static sanitizeEntityData<T extends object>(entity: new () => T, data: object): Partial<T>;
    static sanitizeString(str: string): string;
}
