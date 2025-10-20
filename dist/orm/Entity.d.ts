export declare class Entity<T extends object> {
    id: string | number | null;
    constructor(entity?: Partial<T> | T);
}
