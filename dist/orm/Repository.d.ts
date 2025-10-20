import { StdObject } from "../types/index.js";
export declare class Repository<T extends {
    id: number | string;
}> {
    private readonly entityClass;
    private readonly table;
    constructor(entityClass: new () => T);
    /**
     * Sanitizes SQL identifiers to prevent SQL injection
     * @param identifier - The identifier to sanitize
     * @returns The sanitized identifier wrapped in backticks
     */
    private sanitizeIdentifier;
    find: (id: number | string) => Promise<T | null>;
    findOneBy: (constraints: StdObject) => Promise<T | null>;
    findBy: (criteria: Partial<T> | StdObject) => Promise<T[]>;
    findAll: () => Promise<T[]>;
    save: (entity: T | StdObject) => Promise<void>;
    delete: (id: number | string) => Promise<void>;
}
